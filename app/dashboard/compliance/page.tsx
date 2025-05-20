import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, AlertTriangle } from "lucide-react"
import { ComplianceStats } from "@/components/compliance-stats"

export default function CompliancePage() {
  // Sample compliance data
  const complianceData = [
    {
      category: "Information Security Policies",
      compliant: 75,
      total: 4,
      completed: 3,
      critical: 0,
    },
    {
      category: "Organization of Information Security",
      compliant: 60,
      total: 5,
      completed: 3,
      critical: 1,
    },
    {
      category: "Human Resource Security",
      compliant: 45,
      total: 8,
      completed: 4,
      critical: 2,
    },
    {
      category: "Asset Management",
      compliant: 80,
      total: 10,
      completed: 8,
      critical: 0,
    },
    {
      category: "Access Control",
      compliant: 65,
      total: 14,
      completed: 9,
      critical: 1,
    },
    {
      category: "Cryptography",
      compliant: 30,
      total: 2,
      completed: 1,
      critical: 1,
    },
    {
      category: "Physical and Environmental Security",
      compliant: 90,
      total: 15,
      completed: 14,
      critical: 0,
    },
    {
      category: "Operations Security",
      compliant: 55,
      total: 14,
      completed: 8,
      critical: 2,
    },
  ]

  return (
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav activeItem="compliance" />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
              <p className="text-muted-foreground">Monitor your ISO27001:2022 compliance status</p>
            </div>
            <div className="flex items-center gap-2">
              <Button className="bg-acasa-blue hover:bg-acasa-darkBlue">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Status</TabsTrigger>
              <TabsTrigger value="findings">Critical Findings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-acasa-blue">62%</div>
                    <Progress value={62} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">58 of 93 controls implemented</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <AlertTriangle className="h-8 w-8 text-acasa-danger mr-2" />
                      <div>
                        <div className="text-3xl font-bold text-acasa-danger">7</div>
                        <p className="text-xs text-muted-foreground">Require immediate attention</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">March 15, 2024</div>
                    <p className="text-xs text-muted-foreground">Next assessment due in 14 days</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance by Category</CardTitle>
                  <CardDescription>Breakdown of compliance status across ISO27001:2022 categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ComplianceStats />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Compliance Status</CardTitle>
                  <CardDescription>Compliance status for each ISO27001:2022 category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {complianceData.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{category.category}</h3>
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-medium ${
                                category.compliant >= 70
                                  ? "text-acasa-success"
                                  : category.compliant >= 50
                                    ? "text-acasa-warning"
                                    : "text-acasa-danger"
                              }`}
                            >
                              {category.compliant}%
                            </span>
                            {category.critical > 0 && <AlertTriangle className="h-4 w-4 text-acasa-danger ml-2" />}
                          </div>
                        </div>
                        <Progress value={category.compliant} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {category.completed} of {category.total} controls implemented
                          </span>
                          {category.critical > 0 && (
                            <span className="text-acasa-danger">
                              {category.critical} critical finding{category.critical > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="findings" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Critical Findings</CardTitle>
                  <CardDescription>Issues that require immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        id: "8.3",
                        name: "Information Backup",
                        description: "Backup verification procedures are not being performed regularly",
                        severity: "High",
                      },
                      {
                        id: "5.23",
                        name: "Authentication Information",
                        description: "Password policy does not enforce complexity requirements",
                        severity: "High",
                      },
                      {
                        id: "5.15",
                        name: "Access Control",
                        description: "Privileged access reviews are not conducted quarterly",
                        severity: "Medium",
                      },
                      {
                        id: "8.8",
                        name: "Management of Technical Vulnerabilities",
                        description: "Vulnerability scanning is not performed on all systems",
                        severity: "High",
                      },
                      {
                        id: "6.7",
                        name: "Remote Working",
                        description: "Remote access policy is not enforced consistently",
                        severity: "Medium",
                      },
                      {
                        id: "8.12",
                        name: "Information Disposal",
                        description: "Media sanitization procedures are not documented",
                        severity: "Medium",
                      },
                      {
                        id: "5.3",
                        name: "Cryptographic Controls",
                        description: "Encryption is not used for all sensitive data in transit",
                        severity: "High",
                      },
                    ].map((finding, index) => (
                      <div key={index} className="flex items-start p-4 border rounded-md">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 ${
                            finding.severity === "High"
                              ? "bg-acasa-danger"
                              : finding.severity === "Medium"
                                ? "bg-acasa-warning"
                                : "bg-acasa-info"
                          }`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">
                              {finding.id}: {finding.name}
                            </h3>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded-full ${
                                finding.severity === "High"
                                  ? "bg-acasa-danger/10 text-acasa-danger"
                                  : finding.severity === "Medium"
                                    ? "bg-acasa-warning/10 text-acasa-warning"
                                    : "bg-acasa-info/10 text-acasa-info"
                              }`}
                            >
                              {finding.severity}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{finding.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  )
}

