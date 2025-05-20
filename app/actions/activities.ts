"use server"

import { getRecentActivities } from "../lib/db"

export async function fetchRecentActivities(limit = 5) {
  try {
    const activities = await getRecentActivities(limit)
    // Map each activity to a plain object
    const plainActivities = activities.map((activity) => {
      // Base mapping
      const mapped = {
        ...activity,
        _id: activity._id ? activity._id.toString() : null,
        userId: activity.userId ? activity.userId.toString() : null,
        timestamp: activity.timestamp ? activity.timestamp.toISOString() : null,
      }
      // Handle details.policyId conversion
      if (activity.details && 'policyId' in activity.details) {
        mapped.details = {
          ...activity.details,
          policyId: typeof activity.details.policyId === 'string'
            ? activity.details.policyId
            : activity.details.policyId.toString(),
        }
      }
      return mapped
    })
    return { success: true, data: plainActivities }
  } catch (error) {
    console.error("Error fetching activities:", error)
    return { success: false, error: "Failed to fetch activities" }
  }
}
