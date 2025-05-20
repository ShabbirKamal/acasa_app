"use server"

import { getDb } from "../lib/db"
import { logActivity } from "../lib/db"
import { ObjectId } from "mongodb"
// import { fetchUserProfile } from "../actions/user"
import type { Control } from "../types/database"

export async function fetchControls() {
  try {
    const db = await getDb()
    const collection = db.collection<Control>("controls")

    const controls = await collection.find().toArray()

    const formattedControls = controls.map(control => ({
      ...control,
      _id: control._id.toString(), // ✅ Convert _id to string
    }))

    return { success: true, data: formattedControls }
  } catch (error) {
    console.error("Error fetching controls:", error)
    return { success: false, error: "Failed to fetch controls" }
  }
}

export async function updateControlStatus(id: string, compliant: boolean, userId: string, userName: string) {
  try {
    const db = await getDb()
    const collection = db.collection<Control>("controls")

    // Update the control
    await collection.updateOne(
      { id },
      {
        $set: {
          compliant,
          updatedAt: new Date(),
        },
      },
    )

    // const result = await fetchUserProfile()

    // Log the activity
    await logActivity({
      userId: new ObjectId(userId),
      userName,
      action: compliant ? "marked control as compliant" : "marked control as non-compliant",
      target: id,
      targetType: "control",
      timestamp: new Date(),
      details: { compliant },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating control status:", error)
    return { success: false, error: "Failed to update control status" }
  }
}

export async function uploadControlDocument(controlId: string, documentId: string, userId: string, userName: string) {
  try {
    const db = await getDb()
    const collection = db.collection<Control>("controls")

    // Update the control
    await collection.updateOne(
      { id: controlId },
      {
        $set: {
          hasDocument: true,
          documentId,
          updatedAt: new Date(),
        },
      },
    )

    // Log the activity
    await logActivity({
      userId: new ObjectId(userId),
      userName,
      action: "uploaded document for control",
      target: controlId,
      targetType: "control",
      timestamp: new Date(),
      details: { documentId },
    })

    return { success: true }
  } catch (error) {
    console.error("Error uploading document:", error)
    return { success: false, error: "Failed to upload document" }
  }
}

export async function fetchControlCounts() {
  const db = await getDb()
  const collection = db.collection("controls")
  const total = await collection.countDocuments()
  const compliant = await collection.countDocuments({ compliant: true })
  return { total, compliant }
}
