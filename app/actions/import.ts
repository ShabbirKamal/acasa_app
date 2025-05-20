"use server"

import { getDb } from "../lib/db"
import { logActivity } from "../lib/db"
import { ObjectId } from "mongodb"
import type { Control } from "../types/database"

export async function importControls(csvContent: string, userId: string, userName: string) {
  try {
    // Parse CSV content and remove empty lines
    const lines = csvContent.split("\n").filter(line => line.trim() !== "")
    if (lines.length < 2) {
      return { success: false, error: "CSV file is empty or invalid" }
    }

    // Parse headers
    const headers = lines[0]
      .split(",")
      .map(header => header.trim().replace(/^"(.*)"$/, "$1"))

    // Expected headers
    const expectedHeaders = [
      "Control ID",
      "Name",
      "Description",
      "Category",
      "Compliant",
      "Has Document",
      "Can Automate",
    ]

    // Validate headers
    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header))
    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Missing required headers: ${missingHeaders.join(", ")}`
      }
    }

    // Parse rows into control objects (use let so we can dedupe later)
    let controls: Control[] = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue // Skip empty lines

      // Parse CSV row, handling quoted values correctly
      const row: string[] = []
      let inQuotes = false
      let currentValue = ""
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j]
        if (char === '"') {
          if (inQuotes && j + 1 < lines[i].length && lines[i][j + 1] === '"') {
            // Escaped quote
            currentValue += '"'
            j++
          } else {
            inQuotes = !inQuotes
          }
        } else if (char === "," && !inQuotes) {
          row.push(currentValue)
          currentValue = ""
        } else {
          currentValue += char
        }
      }
      // Push the last field
      row.push(currentValue)

      // Map row to control object using header indexes
      const idIndex = headers.indexOf("Control ID")
      const nameIndex = headers.indexOf("Name")
      const descriptionIndex = headers.indexOf("Description")
      const categoryIndex = headers.indexOf("Category")
      const compliantIndex = headers.indexOf("Compliant")
      const hasDocumentIndex = headers.indexOf("Has Document")
      const canAutomateIndex = headers.indexOf("Can Automate")

      if (idIndex === -1 || nameIndex === -1 || categoryIndex === -1) {
        continue // Skip row if required fields are missing
      }

      // Remove surrounding quotes from each field
      const id = row[idIndex].replace(/^"(.*)"$/, "$1").trim()
      const name = row[nameIndex].replace(/^"(.*)"$/, "$1").trim()
      const description = descriptionIndex !== -1 ? row[descriptionIndex].replace(/^"(.*)"$/, "$1").trim() : undefined
      let category = row[categoryIndex].replace(/^"(.*)"$/, "$1").trim()

      // Replace literal "undefined" or empty with a default category
      if (category.toLowerCase() === "undefined" || !category) {
        category = "Organizational"
      }

      const compliant =
        compliantIndex !== -1 ? row[compliantIndex].replace(/^"(.*)"$/, "$1").trim().toLowerCase() === "yes" : false
      const hasDocument =
        hasDocumentIndex !== -1 ? row[hasDocumentIndex].replace(/^"(.*)"$/, "$1").trim().toLowerCase() === "yes" : false
      const canAutomate =
        canAutomateIndex !== -1 ? row[canAutomateIndex].replace(/^"(.*)"$/, "$1").trim().toLowerCase() === "yes" : false

      // Validate required fields; skip if missing
      if (!id || !name || !category) continue

      controls.push({
        id,
        name,
        description,
        category,
        compliant,
        hasDocument,
        canAutomate,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    if (controls.length === 0) {
      return { success: false, error: "No valid controls found in the CSV file" }
    }

    // STEP 1: Deduplicate CSV rows by Control ID (keep first occurrence)
    const seen = new Set<string>()
    const dedupedControls: Control[] = []
    let duplicateWarning = ""
    for (const control of controls) {
      if (seen.has(control.id)) {
        duplicateWarning = "Duplicate control IDs found in CSV; duplicates were ignored."
      } else {
        seen.add(control.id)
        dedupedControls.push(control)
      }
    }
    controls = dedupedControls

    // STEP 2: Check if any control id already exists in the database
    const csvIds = controls.map(control => control.id)
    const db = await getDb()
    const collection = db.collection<Control>("controls")
    const existingControls = await collection.find({ id: { $in: csvIds } }).toArray()
    const existingIds = existingControls.map(c => c.id)

    // Filter out controls that already exist from the ones to insert
    const controlsToInsert = controls
      .filter(control => !existingIds.includes(control.id))
      .map(control => ({
        ...control,
        _id: new ObjectId()  // assign new ObjectId for db entry
      }))

    // STEP 3: If all controls already exist, return warning (and no new insertion)
    if (controlsToInsert.length === 0) {
      return {
        success: false,
        error: `Controls with the following IDs already exist: ${existingIds.join(", ")}`
      }
    }

    // Insert the new controls into the database
    await collection.insertMany(controlsToInsert)

    // Log the activity
    await logActivity({
      userId: new ObjectId(userId),
      userName,
      action: "imported controls",
      target: "",
      targetType: "control",
      timestamp: new Date(),
      details: { count: controlsToInsert.length },
    })

    // Convert non-plain values to plain ones
    const plainControls = controlsToInsert.map(control => ({
      ...control,
      _id: control._id.toString(),
      createdAt: control.createdAt.toISOString(),
      updatedAt: control.updatedAt.toISOString()
    }))

    // Return success along with any warnings
    let warningMessage = duplicateWarning
    if (existingIds.length > 0) {
      warningMessage += warningMessage ? " " : ""
      warningMessage += `The following controls were skipped as they already exist: ${existingIds.join(", ")}`
    }

    return {
      success: true,
      data: plainControls,
      warning: warningMessage || undefined,
    }
  } catch (error) {
    console.error("Error importing controls:", error)
    return { success: false, error: "Failed to import controls" }
  }
}
