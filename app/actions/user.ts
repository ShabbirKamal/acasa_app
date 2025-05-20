"use server"

import { omit } from 'lodash';
import { getDb } from "../lib/db"
import { ObjectId } from "mongodb"
import { getSession } from "../lib/auth"
import bcrypt from "bcryptjs"
import type { User } from "../types/database"

// Fetch user profile data
export async function fetchUserProfile() {
  try {
    const session = await getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const db = await getDb()
    const user = await db.collection<User>("users").findOne({ _id: new ObjectId(session.id) })
    
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Return user data without sensitive information

    const userData = omit(user, ['password']);

    // const userData = Object.fromEntries(
    //   Object.entries(user).filter(([key]) => key !== 'password')
    // );

    const plainUser = {
      ...userData,
      _id: userData._id.toString(), // Convert ObjectId to string
      createdAt: userData.createdAt instanceof Date ? userData.createdAt.toISOString() : userData.createdAt,
      updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt.toISOString() : userData.updatedAt,
    }

    // console.log(plainUser)

    return {
      success: true,
      data: plainUser,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, error: "Failed to fetch user profile" }
  }
}

// Update user profile data
export async function updateUserProfile(data: Partial<Omit<User, 'password' | 'role' | 'status' | '_id'>>) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    // Prepare update data
    const updateData: Partial<User> = {
      ...data,
      updatedAt: new Date(),
    }

    const db = await getDb()
    const result = await db
      .collection<User>("users")
      .updateOne(
        { _id: new ObjectId(session.id) },
        { $set: updateData }
      )

    if (result.matchedCount === 0) {
      return { success: false, error: "User not found" }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("Error updating user profile:", error)
    return { success: false, error: "Failed to update user profile" }
  }
}

// Change user password
export async function changeUserPassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const db = await getDb()
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(session.id) })
    if (!user) {
      return { success: false, error: "User not found" }
    }

    // Hash and update the password
    const hashed = await bcrypt.hash(newPassword, 10)
    const result = await db
      .collection<User>("users")
      .updateOne(
        { _id: new ObjectId(session.id) },
        { $set: { password: hashed, updatedAt: new Date() } }
      )
    if (result.matchedCount === 0) {
      return { success: false, error: "User not found" }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error("Error changing password:", error)
    return { success: false, error: "Failed to change password" }
  }
}

// Upload profile picture
export async function uploadProfilePicture(
  formData: FormData
) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" }
    }
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 5MB" }
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const imageUrl = `data:${file.type};base64,${base64}`

    const db = await getDb()
    await db
      .collection<User>("users")
      .updateOne(
        { _id: new ObjectId(session.id) },
        { $set: { profilePicture: imageUrl, updatedAt: new Date() } }
      )

    return { success: true, data: { imageUrl } }
  } catch (error: unknown) {
    console.error("Error uploading profile picture:", error)
    return { success: false, error: "Failed to upload profile picture" }
  }
}
