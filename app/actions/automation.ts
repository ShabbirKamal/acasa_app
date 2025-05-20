"use server"

import { revalidatePath } from "next/cache"
import { getDb } from "../lib/db"
import { ObjectId } from "mongodb"
import { writeFile, unlink } from "fs/promises"
import { randomUUID } from "crypto"
import path from "path"
import os from "os"
import omit from "lodash/omit"
import { exec } from "child_process"
import { promisify } from "util"
import type { Script, AutomationResult } from "../types/database"

const execAsync = promisify(exec)

interface ParsedOutput {
  status: "success" | "failure" | "error" 
  compliant: boolean
  report: string
}

export async function fetchScripts(controlId: string) {
  try {
    const db = await getDb()
    const scripts = await db
      .collection<Script>("scripts")
      .find({ controlId })
      .project({ _id: 1, scriptName: 1, description: 1, getInput: 1, inputSource: 1 })
      .toArray()

    const formatted = scripts.map((s) => ({
      id: s._id!.toString(),
      name: s.scriptName,
      description: s.description || "",
      path: `/scripts/${controlId}/${s._id!.toString()}`,
      inputSource: s.inputSource || (s.getInput && s.getInput.length > 0 ? "user" : "none"),
    }))

    return { success: true, scripts: formatted }
  } catch (error) {
    console.error("Error fetching scripts:", error)
    return { success: false, error: "Failed to fetch scripts" }
  }
}

export async function fetchScriptDetails(scriptId: string) {
  try {
    const db = await getDb()

    const script = await db.collection<Script>("scripts").findOne({ _id: new ObjectId(scriptId) })

    if (!script) {
      return { success: false, error: "Script not found" }
    }

    return {
      success: true,
      getInput: script.getInput || [],
      inputSource: script.inputSource || (script.getInput && script.getInput.length > 0 ? "user" : "none"),
    }
  } catch (err) {
    console.error("Error fetching script details:", err)
    return { success: false, error: "Failed to fetch script details" }
  }
}

export async function deleteScript(scriptId: string, controlId: string) {
  try {
    const db = await getDb()

    // First, check if the script exists
    const script = await db.collection("scripts").findOne({ _id: new ObjectId(scriptId) })
    if (!script) {
      return { success: false, error: "Script not found" }
    }

    // Delete the script
    const result = await db.collection("scripts").deleteOne({ _id: new ObjectId(scriptId) })

    if (result.deletedCount === 0) {
      return { success: false, error: "Failed to delete script" }
    }

    // Check if there are any remaining scripts for this control
    const remainingScripts = await db.collection("scripts").countDocuments({ controlId })

    // If no scripts remain, set canAutomate to false
    if (remainingScripts === 0) {
      await db.collection("controls").updateOne({ id: controlId }, { $set: { canAutomate: false } })
    }

    // Revalidate the page to reflect changes
    revalidatePath("/controls")

    return { success: true, message: "Script deleted successfully" }
  } catch (error) {
    console.error("Error deleting script:", error)
    return { success: false, error: "Failed to delete script" }
  }
}

export async function runAutomationScript(
  controlId: string ,
  scriptId: string,
  scriptName: string
) {
  try {
    const db = await getDb()

    // Retrieve the script from the DB
    const script = await db.collection<Script>("scripts").findOne({ _id: new ObjectId(scriptId) })
    if (!script || !script.code) {
      return { success: false, error: "Script not found" }
    }

    // Write the script code to a temporary file
    const tempFilename = `${randomUUID()}.py`
    const tempPath = path.join(os.tmpdir(), tempFilename)
    await writeFile(tempPath, script.code, { mode: 0o755 })

    let stdout = ""
    let stderr = ""
    let status: "success" | "failure" | "error" = "error"
    let compliant = false
    let report = ""
    const runAt = new Date()

    try {
      // Execute the Python script
      const result = await execAsync(`python3 ${tempPath}`)
      stdout = result.stdout.trim()

      // Try parsing the output as JSON
      let parsedOutput: ParsedOutput | null = null
      try {
        const obj = JSON.parse(stdout) as ParsedOutput
        // Validate structure
        if (
          typeof obj.status === "string" &&
          typeof obj.compliant === "boolean" &&
          typeof obj.report === "string"
        ) {
          parsedOutput = obj
        }
      } catch {
        // ignore JSON parse errors
      }

      if (parsedOutput) {
        status = parsedOutput.status
        compliant = parsedOutput.compliant
        report = parsedOutput.report
      } else {
        // Fallback if the output is not in the expected format
        status = "error"
        compliant = false
        report = stdout || "Invalid script output format"
      }
    } catch (e: unknown) {
      // Handle errors from execAsync
      const execError = e as { stderr?: Buffer | string; stdout?: Buffer | string; message?: string }
      stderr = typeof execError.stderr === "string" ? execError.stderr : execError.stderr?.toString() || ""
      stdout = typeof execError.stdout === "string" ? execError.stdout : execError.stdout?.toString() || ""
      status = "error"
      compliant = false
      report = stderr || stdout || execError.message || "No output"
    }

    // Build a plain object for the result document.
    const baseResult = {
      controlId,
      scriptId,
      scriptName,
      status,
      compliant,
      report,
      runAt: runAt.toISOString(),
    }
    
    // insert it
    const insertResult = await db
      .collection("automationResults")
      .insertOne(baseResult)
    
    // now remove any unwanted props (for example, if baseResult came from a find…)
    const cleaned = omit(baseResult, ["_id"])
    
    // attach the stringified _id
    const resultDoc = {
      ...cleaned,
      _id: insertResult.insertedId.toString(),
    }

    // Update the corresponding control's automation status
    await db.collection("controls").updateOne(
      { id: controlId },
      {
        $set: {
          automationStatus: compliant ? "compliant" : "non-compliant",
          lastAutomationRun: runAt,
        },
      }
    )

    // Update the script's metadata
    await db.collection("scripts").updateOne(
      { _id: new ObjectId(scriptId) },
      {
        $set: {
          lastRun: runAt,
          lastStatus: compliant ? "compliant" : "non-compliant",
        },
      }
    )

    // Remove the temporary file and revalidate the page
    await unlink(tempPath)
    revalidatePath("/controls")

    return {
      success: true,
      result: resultDoc,
    }
  } catch (error) {
    console.error("Error running automation script:", error)
    return {
      success: false,
      error: "Failed to run automation script",
    }
  }
}

export async function getAutomationHistory(controlId: string) {
  try {
    const db = await getDb()

    const historyRaw = await db
      .collection<AutomationResult>("automationResults")
      .find({ controlId })
      .sort({ runAt: -1 })
      .toArray()

    const history = historyRaw.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }))

    return {
      success: true,
      history,
    }
  } catch (error) {
    console.error("Error fetching automation history:", error)
    return {
      success: false,
      error: "Failed to fetch automation history",
    }
  }
}
