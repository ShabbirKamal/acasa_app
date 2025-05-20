import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { ControlsTable } from "@/components/controls-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ControlsPage() {
  return (
    <>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav activeItem="controls" />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Controls</h1>
              <p className="text-muted-foreground">Manage your ISO27001:2022 Annex A Controls</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild className="bg-acasa-blue hover:bg-acasa-darkBlue">
                <Link href="/dashboard/generate-report">Generate Report</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ISO27001:2022 Annex A Controls</CardTitle>
                <CardDescription>Track and manage your compliance with ISO27001:2022 controls</CardDescription>
              </CardHeader>
              <CardContent>
                <ControlsTable />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  )
}

