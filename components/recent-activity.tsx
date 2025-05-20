"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchRecentActivities } from "../app/actions/activities"
import type { Activity } from "../app/types/database"

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      try {
        const result = await fetchRecentActivities(5)
        if (result.success) {
          setActivities(
            (result.data ?? []).map((activity: any) => ({
              ...activity,
              _id: activity._id ? activity._id.toString() : undefined,
              userId: activity.userId ? activity.userId.toString() : "",
              timestamp: activity.timestamp instanceof Date
              ? activity.timestamp
              : new Date(activity.timestamp),
            }))
          )
        }
      } catch (error) {
        console.error("Error loading activities:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [])

  if (loading) {
    return <p>Loading recent activity...</p>
  }

  if (activities.length === 0) {
    return <p>No recent activity.</p>
  }

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
  
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) {
      return days === 1 ? "Yesterday" : `${days} days ago`;
    } else if (hours > 0) {
      return `${hours} hours ago`;
    } else if (minutes > 0) {
      return `${minutes} minutes ago`;
    } else {
      return "Just now";
    }
  }
  

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity._id ? activity._id.toString() : `activity-${index}`} className="flex items-start gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={activity.userName} />
            <AvatarFallback>
              {activity.userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.userName}</span> {activity.action}{" "}
              {activity.target && <span className="font-medium">{activity.target}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
