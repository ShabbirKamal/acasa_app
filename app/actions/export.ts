"use server"

import { getControls } from "../lib/db"
import { logActivity } from "../lib/db"
import { ObjectId } from "mongodb"

export async function exportControls(userId: string, userName: string) {
  try {
    const controls = await getControls()

    // Convert controls to CSV format
    const headers = ["Control ID", "Name", "Description", "Category", "Compliant", "Has Document", "Can Automate"]
    const rows = controls.map((control) => [
      control.id,
      control.name,
      control.description || "",
      control.category,
      control.compliant ? "Yes" : "No",
      control.hasDocument ? "Yes" : "No",
      control.canAutomate ? "Yes" : "No",
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Log the activity (in a real app, you would get the actual user ID and name)
    await logActivity({
      userId: new ObjectId(userId),
      userName: userName,
      action: "exported controls",
      target: "",
      targetType: "control",
      timestamp: new Date(),
      details: { count: controls.length },
    })

    return { success: true, data: csvContent }
  } catch (error) {
    console.error("Error exporting controls:", error)
    return { success: false, error: "Failed to export controls" }
  }
}

