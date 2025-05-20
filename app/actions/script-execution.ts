"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "../lib/db"
import { ObjectId } from "mongodb"
import { writeFile, unlink } from "fs/promises"
import { randomUUID } from "crypto"
import path from "path"
import os from "os"
import { exec } from "child_process"
import { promisify } from "util"
import type { Script, AutomationResult } from "../types/database"

const execAsync = promisify(exec)

export async function executeScriptWithInputs(
  scriptId: string,
  controlId: string,
  inputs: Record<string, unknown>
) {
  try {
    const db = await getDb()

    // Retrieve the script from the DB
    const script = await db.collection<Script>("scripts").findOne({ _id: new ObjectId(scriptId) })
    if (!script?.code) {
      return { success: false, error: "Script not found" }
    }

    // Write the script code to a temporary file
    const tempFilename = `${randomUUID()}.py`
    const tempPath = path.join(os.tmpdir(), tempFilename)
    await writeFile(tempPath, script.code, { mode: 0o755 })

    // Prepare command line arguments from inputs
    const args = Object.values(inputs)
      .map((value) => {
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '\\"')}"`
        } else if (typeof value === "boolean") {
          return value ? "true" : "false"
        } else {
          return String(value)
        }
      })
      .join(" ")

    let stdout = ""
    let stderr = ""
    let status: "success" | "failure" | "error" = "error"
    let compliant = false
    let report = ""
    const runAt = new Date()

    try {
      const result = await execAsync(`python3 ${tempPath} ${args}`)
      stdout = result.stdout.trim()

      // Try parsing the output as JSON
      let parsed: unknown
      try {
        parsed = JSON.parse(stdout)
      } catch {
        parsed = null
      }

      // Validate parsed object structure
      if (
        typeof parsed === "object" &&
        parsed !== null
      ) {
        const data = parsed as Record<string, unknown>
        const hasStatus = typeof data.status === "string"
        const hasCompliant = typeof data.compliant === "boolean"
        const hasReport = typeof data.report === "string"

        if (hasStatus && hasCompliant && hasReport) {
          status = data.status as typeof status
          compliant = data.compliant as boolean
          report = data.report as string
        } else {
          report = stdout || "Invalid script output format"
        }
      } else {
        report = stdout || "Invalid script output format"
      }
    } catch (execError: unknown) {
      if (execError instanceof Error) {
        stderr = execError.message
      }
      report = stderr || stdout || "No output"
    }

    // Build result document
    const resultDoc: Omit<AutomationResult, "_id"> & { _id?: string } = {
      controlId,
      scriptId,
      scriptName: script.scriptName,
      status,
      compliant,
      report,
      runAt: runAt.toISOString(),
    }

    const insertResult = await db.collection<AutomationResult>("automationResults").insertOne(resultDoc)
    resultDoc._id = insertResult.insertedId.toString()

    // Update control status
    await db.collection("controls").updateOne(
      { id: controlId },
      { $set: { automationStatus: compliant ? "compliant" : "non-compliant", lastAutomationRun: runAt } }
    )

    // Update script metadata
    await db.collection<Script>("scripts").updateOne(
      { _id: new ObjectId(scriptId) },
      { $set: { lastRun: runAt, lastStatus: compliant ? "compliant" : "non-compliant" } }
    )

    // Clean up
    await unlink(tempPath)
    revalidatePath("/controls")

    return { success: true, result: resultDoc }
  } catch (error: unknown) {
    console.error("Error executing script with inputs:", error)
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: "Failed to execute script", details: message }
  }
}
