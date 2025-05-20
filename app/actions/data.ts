"use server"

import { getDb } from "../lib/db"
import type { DataItem } from "../types/database"

export async function fetchDataItems() {
  try {
    const db = await getDb()
    const dataItems = await db.collection("data").find({}).toArray()

    // Transform the MongoDB ObjectId to string
    const formattedItems = dataItems.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }))

    return {
      success: true,
      data: formattedItems as DataItem[],
    }
  } catch (error) {
    console.error("Error fetching data items:", error)
    return {
      success: false,
      error: "Failed to fetch data items",
    }
  }
}
