"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "../lib/db"
import type { Control, ScriptInputParam } from "../types/database"
import { UpdateFilter } from "mongodb"

export async function importScript(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const controlId = formData.get("controlId") as string
    const language = formData.get("language") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const inputSource = (formData.get("inputSource") as "user" | "database" | "documents" | "none") || "none"

    // Parse script inputs
    const inputsJson = formData.get("inputs") as string
    const scriptInputs: ScriptInputParam[] = []
    if (inputsJson) {
      try {
        const parsed = JSON.parse(inputsJson) as unknown
        if (Array.isArray(parsed)) {
          parsed.forEach((item, index) => {
            const entry = item as Record<string, unknown>
            const label = typeof entry.label === "string" ? entry.label : `param${index + 1}`
            const type = typeof entry.type === "string" && ["string","number","boolean","select","data"].includes(entry.type)
              ? entry.type as ScriptInputParam["type"]
              : "string"
            const descriptionText = typeof entry.description === "string" ? entry.description : ""
            const required = typeof entry.required === "boolean" ? entry.required : true
            const options = type === "select" && Array.isArray(entry.options) && entry.options.every(opt => typeof opt === "string")
              ? entry.options as string[]
              : undefined

            scriptInputs.push({
              key: `param${index + 1}`,
              label,
              type,
              description: `${descriptionText} (${type})`,
              required,
              default: type === "boolean" ? false : "",
              options,
              inputSource,
            })
          })
        }
      } catch (parseError: unknown) {
        console.error("Error parsing script inputs:", parseError)
      }
    }

    if (!file || !controlId) {
      return { success: false, error: "Missing required fields" }
    }

    const scriptContent = await file.text()

    // Auto-detect language from extension
    let detectedLanguage = language || file.name.split('.').pop()?.toLowerCase() || ""
    detectedLanguage = ["py","js","sh","ps1"].includes(detectedLanguage)
      ? detectedLanguage === "py" ? "python"
        : detectedLanguage === "js" ? "javascript"
        : detectedLanguage === "sh" ? "bash"
        : "powershell"
      : language || "unknown"

    const db = await getDb()

    // Validate control exists
    const control = await db.collection<Control>("controls").findOne({ id: controlId })
    if (!control) {
      return { success: false, error: "Control not found" }
    }

    const scriptNameToUse = name || file.name

    // Prevent duplicate script names
    const duplicate = await db.collection("scripts").findOne({ controlId, scriptName: scriptNameToUse })
    if (duplicate) {
      return { success: false, error: `A script named \"${scriptNameToUse}\" already exists for this control.` }
    }

    const scriptRecord = {
      controlId,
      scriptName: scriptNameToUse,
      description: description || `Script for ${control.name}`,
      language: detectedLanguage,
      code: scriptContent,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date(),
      lastRun: null,
      status: "ready",
      getInput: scriptInputs,
      inputSource,
    }

    const insertResult = await db.collection("scripts").insertOne(scriptRecord)

    // Build a typed update filter
    const updateDoc: UpdateFilter<Control> = {
      $push: { scripts: insertResult.insertedId },
      $set: { canAutomate: control.canAutomate ?? true },
    }

    await db.collection<Control>("controls").updateOne({ id: controlId }, updateDoc)

    revalidatePath("/controls")

    return {
      success: true,
      message: "Script imported successfully",
      scriptId: insertResult.insertedId.toString(),
    }
  } catch (error: unknown) {
    console.error("Error importing script:", error)
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: "Failed to import script", details: message }
  }
}
