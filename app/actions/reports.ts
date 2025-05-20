"use server"

import { getReports, getReportById, createReport, logActivity } from "../lib/db"
import { ObjectId } from "mongodb"
import type { Report } from "../types/database"

export async function fetchReports() {
  try {
    const reports = await getReports()
    return { success: true, data: reports }
  } catch (error) {
    console.error("Error fetching reports:", error)
    return { success: false, error: "Failed to fetch reports" }
  }
}

export async function fetchReportById(id: string) {
  try {
    const report = await getReportById(id)
    if (!report) {
      return { success: false, error: "Report not found" }
    }
    return { success: true, data: report }
  } catch (error) {
    console.error("Error fetching report:", error)
    return { success: false, error: "Failed to fetch report" }
  }
}

export async function generateReport(reportData: FormData, userId: string, userName: string) {
  try {
    const name = reportData.get("name") as string
    const type = reportData.get("type") as "Compliance" | "Assessment" | "Audit" | "Security"
    const content = reportData.get("content") as string

    if (!name || !type || !content) {
      return { success: false, error: "Name, type, and content are required" }
    }

    // Generate a unique report ID
    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const reportCount = (await getReports()).length + 1
    const reportId = `REP-${year}-${month}${reportCount.toString().padStart(3, "0")}`

    const newReport: Omit<Report, "_id"> = {
      id: reportId,
      name,
      type,
      date: new Date(),
      status: "Completed",
      content,
      generatedBy: new ObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const insertedId = await createReport(newReport)

    // Log the activity
    await logActivity({
      userId: new ObjectId(userId),
      userName,
      action: "generated a compliance report",
      target: "",
      targetType: "report",
      timestamp: new Date(),
      details: { reportId },
    })

    return { success: true, data: { id: insertedId, reportId } }
  } catch (error) {
    console.error("Error generating report:", error)
    return { success: false, error: "Failed to generate report" }
  }
}

