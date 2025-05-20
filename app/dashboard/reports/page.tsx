import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Plus, Calendar, Filter, Search, FileBarChart, FileCog, FileCheck } from "lucide-react"

export default function ReportsPage() {
  // Sample reports data
  const reportsData = [
    {
      id: "REP-2024-001",
      name: "ISO27001 Compliance Report - Q1 2024",
      type: "Compliance",
      date: "2024-03-15",
      status: "Completed",
    },
    {
      id: "REP-2024-002",
      name: "Security Controls Assessment",
      type: "Assessment",
      date: "2024-02-28",
      status: "Completed",
    },
    {
      id: "REP-2024-003",
      name: "Privileged Access Audit",
      type: "Audit",
      date: "2024-02-10",
      status: "Completed",
    },
    {
      id: "REP-2024-004",
      name: "Vulnerability Management Report",
      type: "Security",
      date: "2024-01-25",
      status: "Completed",
    },
    {
      id: "REP-2024-005",
      name: "ISO27001 Gap Analysis",
      type: "Assessment",
      date: "2024-01-15",
      status: "Completed",
    },
    {
      id: "REP-2024-006",
      name: "Q2 2024 Compliance Forecast",
      type: "Compliance",
      date: "2024-03-20",
      status: "Draft",
    },
  ]

  return (
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav activeItem="reports" />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
              <p className="text-muted-foreground">Generate and manage compliance reports</p>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-acasa-blue hover:bg-acasa-darkBlue">
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Report Templates</CardTitle>
              <CardDescription>Select a template to generate a new report</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-full w-full flex flex-col items-start p-6 justify-start text-left hover:bg-accent"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileBarChart className="h-5 w-5 text-acasa-blue flex-shrink-0" />
                    <span className="font-medium">ISO27001 Compliance Report</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ISO27001:2022 compliance status
                  </p>
                </Button>
                <Button
                  variant="outline"
                  className="h-full w-full flex flex-col items-start p-6 justify-start text-left hover:bg-accent"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileCog className="h-5 w-5 text-acasa-blue flex-shrink-0" />
                    <span className="font-medium">Controls Assessment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Assessment of implemented security</p>
                </Button>
                <Button
                  variant="outline"
                  className="h-full w-full flex flex-col items-start p-6 justify-start text-left hover:bg-accent"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileCheck className="h-5 w-5 text-acasa-blue flex-shrink-0" />
                    <span className="font-medium">Gap Analysis Report</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analysis of gaps in compliance
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download your previously generated reports</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search reports..." className="pl-8" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Report ID</TableHead>
                      <TableHead>Report Name</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                            {report.name}
                          </div>
                        </TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              report.status === "Completed"
                                ? "bg-acasa-success/10 text-acasa-success"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {report.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
  )
}

