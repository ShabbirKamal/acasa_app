"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardNav } from "@/components/dashboard-nav"
import { ControlsTable } from "@/components/controls-table"
import { PoliciesTable } from "@/components/policies-table"
import { ComplianceStats } from "@/components/compliance-stats"
import { RecentActivity } from "@/components/recent-activity"
import { FileCheck, FileText, Shield, AlertTriangle } from "lucide-react"
import { fetchControlCounts } from "../actions/controls"

export default function DashboardPage() {
  const [totalControls, setTotalControls] = useState<number>(0)
  const [compliantControls, setCompliantControls] = useState<number>(0)

  useEffect(() => {
    async function loadCounts() {
      try {
        const counts = await fetchControlCounts()
        setTotalControls(counts.total)
        setCompliantControls(counts.compliant)
      } catch (error) {
        console.error("Error loading control counts:", error)
      }
    }
    loadCounts()
    // Refresh counts every minute to ensure data is fresh.
    const interval = setInterval(loadCounts, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav activeItem="dashboard" />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage your compliance status</p>
            </div>
            <div className="flex items-center gap-2">
              {/* <Button asChild className="bg-acasa-blue hover:bg-acasa-darkBlue">
                <Link href="/dashboard/generate-report">Generate Compliance Report</Link>
              </Button> */}
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalControls}</div>
                    <p className="text-xs text-muted-foreground">ISO27001:2022 Annex A Controls</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliant Controls</CardTitle>
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{compliantControls}</div>
                    <p className="text-xs text-muted-foreground">{totalControls > 0 ? `${Math.round((compliantControls / totalControls) * 100)}% of total controls` : ""}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Policy Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">ISMS, PAM, and Malware Detection</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader className="pb-4">
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>Your overall compliance with ISO27001:2022</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ComplianceStats />
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader className="pb-4">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates to your compliance status</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <RecentActivity />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="controls" className="space-y-4">
              <Card className="border border-acasa-blue/20">
                <CardHeader>
                  <CardTitle>ISO27001:2022 Annex A Controls</CardTitle>
                  <CardDescription>Manage your control implementation and compliance status</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ControlsTable />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="policies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Policy Documents</CardTitle>
                  <CardDescription>Create and manage your policy documents</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <PoliciesTable />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  )
}

