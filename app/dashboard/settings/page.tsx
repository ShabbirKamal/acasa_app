"use client"

import { useState, useEffect } from "react"
import { TableCell, TableBody, TableHead, TableRow, TableHeader, Table } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Save, Bell, Mail, Shield, Users, Globe, Database, RefreshCw } from "lucide-react"
import { fetchGeneralSettings, saveGeneralSettings } from "@/app/actions/settings"
import { AwsIntegrationCard } from "@/components/aws-integration-card"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "",
    industry: "",
    website: "",
    contactEmail: "",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    complianceAlerts: true,
    weeklyReports: true,
    securityIncidents: true,
    controlUpdates: false,
  })

  // Fetch general settings on component mount
  useEffect(() => {
    async function loadSettings() {
      const result = await fetchGeneralSettings()
      if (result.success) {
        setGeneralSettings(result.data)
      } else {
        toast({
          title: "Error loading settings",
          description: result.error,
          variant: "destructive",
        })
      }
    }
    loadSettings()
  }, [toast])

  const handleGeneralSettingChange = (field: string, value: string) => {
    setGeneralSettings({
      ...generalSettings,
      [field]: value,
    })
  }

  const handleNotificationToggle = (field: string, checked: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [field]: checked,
    })
  }

  // Save general settings using the server action
  const handleSaveSettings = async () => {
    const result = await saveGeneralSettings(generalSettings)
    if (result.success) {
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    } else {
      toast({
        title: "Error saving settings",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
      <aside className="hidden w-[200px] flex-col md:flex">
        <DashboardNav activeItem="settings" />
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your application settings</p>
          </div>
        </div>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="advanced" className="hidden md:inline-flex">
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your organization and application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={generalSettings.companyName}
                    onChange={(e) => handleGeneralSettingChange("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={generalSettings.industry}
                    onChange={(e) => handleGeneralSettingChange("industry", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={generalSettings.website}
                    onChange={(e) => handleGeneralSettingChange("website", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => handleGeneralSettingChange("contactEmail", e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the appearance of the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the application</p>
                  </div>
                  <Switch id="darkMode" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compactView">Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout for tables and lists</p>
                  </div>
                  <Switch id="compactView" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how and when you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => handleNotificationToggle("emailNotifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="complianceAlerts">Compliance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about compliance status changes</p>
                    </div>
                  </div>
                  <Switch
                    id="complianceAlerts"
                    checked={notificationSettings.complianceAlerts}
                    onCheckedChange={(checked) => handleNotificationToggle("complianceAlerts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="weeklyReports">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Receive weekly compliance summary reports</p>
                    </div>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => handleNotificationToggle("weeklyReports", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="securityIncidents">Security Incidents</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about security incidents and breaches
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="securityIncidents"
                    checked={notificationSettings.securityIncidents}
                    onCheckedChange={(checked) => handleNotificationToggle("securityIncidents", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-0.5">
                      <Label htmlFor="controlUpdates">Control Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified when controls are updated or changed</p>
                    </div>
                  </div>
                  <Switch
                    id="controlUpdates"
                    checked={notificationSettings.controlUpdates}
                    onCheckedChange={(checked) => handleNotificationToggle("controlUpdates", checked)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their access to the application</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Input placeholder="Search users..." className="max-w-sm" />
                  <Button className="bg-acasa-blue hover:bg-acasa-darkBlue">
                    <Users className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { name: "John Doe", email: "john.doe@example.com", role: "Admin", status: "Active" },
                        { name: "Jane Smith", email: "jane.smith@example.com", role: "Auditor", status: "Active" },
                        { name: "Mike Johnson", email: "mike.johnson@example.com", role: "User", status: "Active" },
                        {
                          name: "Sarah Williams",
                          email: "sarah.williams@example.com",
                          role: "User",
                          status: "Inactive",
                        },
                      ].map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.status === "Active"
                                  ? "bg-acasa-success/10 text-acasa-success"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                              }`}
                            >
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect with other tools and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* AWS Integration Card */}
                  <AwsIntegrationCard />

                  {/* Existing integrations */}
                  {[
                    {
                      name: "Microsoft Azure",
                      description: "Connect to Azure Active Directory for user management",
                      connected: true,
                      icon: Globe,
                    },
                    {
                      name: "Google Workspace",
                      description: "Integrate with Google Workspace for document management",
                      connected: false,
                      icon: Globe,
                    },
                    {
                      name: "Slack",
                      description: "Receive notifications in your Slack workspace",
                      connected: true,
                      icon: Bell,
                    },
                    {
                      name: "Jira",
                      description: "Create and track issues in Jira",
                      connected: false,
                      icon: Database,
                    },
                  ].map((integration, index) => (
                    <Card key={index}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div>
                          <CardTitle className="text-xl font-bold">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                        <integration.icon className="h-8 w-8 text-acasa-blue" />
                      </CardHeader>
                      <CardContent className="text-muted-foreground">
                        <p>
                          {integration.connected
                            ? "This integration is currently connected and active."
                            : "Connect to enable this integration."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={`w-full ${
                            integration.connected
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                              : "bg-acasa-blue hover:bg-acasa-darkBlue"
                          }`}
                        >
                          {integration.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Configure advanced application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input id="apiKey" value="••••••••••••••••••••••••••••••" readOnly className="font-mono" />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Use this API key to access the ACASA API</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention Period (days)</Label>
                  <Input id="dataRetention" type="number" defaultValue="365" />
                  <p className="text-xs text-muted-foreground">Specify how long to retain historical compliance data</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea id="customCss" placeholder="/* Add your custom CSS here */" className="font-mono h-32" />
                  <p className="text-xs text-muted-foreground">
                    Add custom CSS to customize the application appearance
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-acasa-danger/20">
              <CardHeader>
                <CardTitle className="text-acasa-danger">Danger Zone</CardTitle>
                <CardDescription>These actions are destructive and cannot be undone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-acasa-danger/20 rounded-md">
                  <div>
                    <h3 className="font-medium">Reset Application</h3>
                    <p className="text-sm text-muted-foreground">Reset all application data to default settings</p>
                  </div>
                  <Button variant="destructive">Reset</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-acasa-danger/20 rounded-md">
                  <div>
                    <h3 className="font-medium">Delete All Data</h3>
                    <p className="text-sm text-muted-foreground">Permanently delete all data from the application</p>
                  </div>
                  <Button variant="destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

