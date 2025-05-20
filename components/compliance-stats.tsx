// compliance stats component:
"use client"

import { useEffect, useRef, useState } from "react"
import { recalculateComplianceStats, fetchComplianceStats } from "../app/actions/stats"
import type { ComplianceStats as ComplianceStatsType } from "../app/types/database"

export function ComplianceStats() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stats, setStats] = useState<ComplianceStatsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        // First recalc stats, then fetch updated stats.
        const recalcResult = await recalculateComplianceStats()
        if (recalcResult.success) {
          const result = await fetchComplianceStats()
          if (result.success && result.data) {
            console.log()
            const data = {
              ...result.data,
              lastUpdated: new Date(result.data.lastUpdated),
            }
            setStats(data)
          }
        }
      } catch (error) {
        console.error("Error loading compliance stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    const interval = setInterval(loadStats, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = 300

    // Helper: map any category to one of the three groups.
    function mapCategory(category: string): "organizational" | "technological" | "physical" {
      const lowerCat = category.toLowerCase()
      if (lowerCat.includes("physical")) {
        return "physical"
      } else if (lowerCat.includes("technological")) {
        return "technological"
      } else {
        // Default group if not explicitly technological or physical.
        return "organizational"
      }
    }

    let groupedData: {
      category: string
      compliant: number
      total: number
      criticalFindings: number
      percentage: number
    }[] = []

    if (stats && stats.categoryStats && stats.categoryStats.length > 0) {
      // Create groups for the three categories.
      const groups = {
        organizational: { category: "Organizational", compliant: 0, total: 0, criticalFindings: 0 },
        technological: { category: "Technological", compliant: 0, total: 0, criticalFindings: 0 },
        physical: { category: "Physical", compliant: 0, total: 0, criticalFindings: 0 },
      }

      // Aggregate each stat into one of the groups.
      stats.categoryStats.forEach((item) => {
        const groupKey = mapCategory(item.category)
        groups[groupKey].compliant += item.compliant
        groups[groupKey].total += item.total
        groups[groupKey].criticalFindings += item.criticalFindings
      })

      groupedData = Object.values(groups).map((group) => ({
        ...group,
        percentage: group.total ? Math.round((group.compliant / group.total) * 100) : 0,
      }))
    } else {
      // Fallback data if no stats are available.
      groupedData = [
        { category: "Organizational", compliant: 0, total: 0, percentage: 0, criticalFindings: 0 },
        { category: "Technological", compliant: 0, total: 0, percentage: 0, criticalFindings: 0 },
        { category: "Physical", compliant: 0, total: 0, percentage: 0, criticalFindings: 0 },
      ]
    }

    // Chart configuration.
    const barWidth = (canvas.width - 100) / groupedData.length
    const maxBarHeight = 220
    const startY = 250

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    groupedData.forEach((item, index) => {
      const barHeight = (item.percentage / 100) * maxBarHeight
      const x = 50 + index * barWidth
      const y = startY - barHeight

      ctx.fillStyle = "#0052A5" // ACASA blue
      ctx.fillRect(x, y, barWidth - 10, barHeight)

      ctx.fillStyle = "#000"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${item.percentage}%`, x + (barWidth - 10) / 2, y - 5)

      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.fillText(item.category, x + (barWidth - 10) / 2, startY + 15)
    })

    ctx.strokeStyle = "#ccc"
    ctx.beginPath()
    ctx.moveTo(40, 30)
    ctx.lineTo(40, startY)
    ctx.lineTo(canvas.width - 20, startY)
    ctx.stroke()

    ctx.fillStyle = "#666"
    ctx.font = "10px Arial"
    ctx.textAlign = "right"
    for (let i = 0; i <= 100; i += 25) {
      const y = startY - (i / 100) * maxBarHeight
      ctx.fillText(`${i}%`, 35, y + 3)
      ctx.beginPath()
      ctx.moveTo(37, y)
      ctx.lineTo(43, y)
      ctx.stroke()
    }
  }, [stats])

  if (loading) {
    return <p>Loading compliance stats...</p>
  }

  return (
    <div className="w-full h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}