"use server"

import { getSession } from "../lib/auth"
import { getDb } from "../lib/db"
import { ObjectId } from "mongodb"

export async function uploadProfilePicture(formData: FormData) {
  try {
    const session = await getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 5MB" }
    }

    // Convert file to base64 for storage
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const imageUrl = `data:${file.type};base64,${base64}`

    // Update user's profile picture in database
    const db = await getDb()
    await db.collection("users").updateOne(
      { _id: new ObjectId(session.id) },
      {
        $set: {
          profilePicture: imageUrl,
          updatedAt: new Date(),
        },
      },
    )

    return { success: true, data: { imageUrl } }
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return { success: false, error: "Failed to upload profile picture" }
  }
}

