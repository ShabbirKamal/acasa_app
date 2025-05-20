"use server"

import { getDb } from "@/app/lib/db"

export async function fetchGeneralSettings() {
  try {
    const db = await getDb()
    const settings = await db.collection("appSettings").findOne({ key: "general" })
    return { success: true, data: settings?.value || {} }
  } catch (error) {
    console.error("Failed to fetch general settings:", error)
    return { success: false, error: "Unable to load settings" }
  }
}

export async function saveGeneralSettings(data: unknown) {
  try {
    const db = await getDb()
    await db.collection("appSettings").updateOne(
      { key: "general" },
      { $set: { value: data } },
      { upsert: true }
    )
    return { success: true }
  } catch (error) {
    console.error("Failed to save general settings:", error)
    return { success: false, error: "Unable to save settings" }
  }
}
