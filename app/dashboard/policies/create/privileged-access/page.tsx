"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { useToast } from "@/hooks/use-toast"
import { Save, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchGeneralSettings } from "@/app/actions/settings"
import { fetchUserProfile } from "@/app/actions/user"
import { createNewPolicy, fetchPolicyByUserAndName, updateExistingPolicy } from "@/app/actions/policies"
import { useEffect } from "react"
import { UserWithoutPswd } from "@/app/types/database"

export default function PrivilegedAccessPolicyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("form")
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
  })
  const [user, setUser] = useState<UserWithoutPswd>()
  const [fetched, setFetched] = useState(false)
  const [policyId, setPolicyId] = useState("")

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }


  const generatePrivilegedAccessPolicy = async () => {
    try {
      setIsLoading(true)
      // In a real app, this would call an API endpoint to generate the document
      // For now, we'll simulate a successful generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate downloading a file
      const dummyBlob = new Blob(["Dummy content for privileged access policy"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      const url = URL.createObjectURL(dummyBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "PrivilegedAccessPolicy.docx"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Policy generated",
        description: "Privileged Access Policy has been generated and downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating policy:", error)
      toast({
        title: "Error",
        description: "Failed to generate policy document",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await fetchUserProfile()
        if (result.success) {
          console.log(result.data)
          setUser(result.data)
        } else {
          console.error(result.error)
        }
      } catch (err) {
        console.error("Failed to load user profile:", err)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    const loadMalware = async () => {
      try {
        if (user)
        {        setIsLoading(true)
        const result = await fetchPolicyByUserAndName(user._id, "Priviledged Access Policy")
        if (result.success && result.data?.content) {
          console.log(result.data)
          const parsedContent = JSON.parse(result.data.content)
          setFormData({
            companyName: parsedContent.companyName || "",
          })

          setPolicyId(result.data._id)
          setFetched(true)
        } else {
          console.error(result.error)
        }}
      } catch (err) {
        console.error("Failed fetch to Malware policy", err)
      }
      finally {
        setIsLoading(false)
      }
    }

    loadMalware()

  }, [user, fetched])

  useEffect(() => {
    const loadSettings = async () => {
      if (fetched) return
      try {
        const result = await fetchGeneralSettings()
        if (result.success) {
          setFormData({ ...formData, companyName: result.data.companyName })
          console.log(formData.companyName)
        } else {
          console.error(result.error)
        }
      }
      catch (err) {
        console.error("Failed to load settings:", err)
      }
      finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [fetched, formData])

  const savePriveledgedPolicy = async () => {
    const form = new FormData()
    form.append("name", "Priviledged Access Policy")
    form.append("content", JSON.stringify(formData))
    form.append("status", "Draft")
    form.append("userId", user?._id || "")
    form.append("userName", user?.name || "")

    if (!fetched) {
      try {
        if (user)
        {        
          const result = await createNewPolicy(form, user._id, user.name)
        if (result.success) {
          toast({
            title: "Policy saved",
            description: "Priviledged Access has been saved successfully.",
          })
          router.push("/dashboard/policies")
        }
        else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }}
      }
      catch (error) {
        console.error("Error saving policy:", error)
        toast({
          title: "Error",
          description: "Failed to save policy document",
          variant: "destructive",
        })
      }
    }

    else {
      try {
        if (user)
        {        
          const result = await updateExistingPolicy(policyId, form, user._id, user.name)
        if (result.success) {
          toast({
            title: "Policy saved",
            description: "Priviledged Access Policy has been updated successfully.",
          })
          router.push("/dashboard/policies")
        }
        else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }}
      }
      catch (error) {
        console.error("Error saving policy:", error)
        toast({
          title: "Error",
          description: "Failed to save policy document",
          variant: "destructive",
        })
      }
    }
  }

  // const handleTemplateUploadSuccess = () => {
  //   setActiveTab("form")
  // }

  return (
    <div className="flex min-h-screen flex-col pb-8">
      {/* <DashboardHeader /> */}
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav activeItem="policies" />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Privileged Access Policy</h1>
              <p className="text-muted-foreground">Define how privileged access is managed in your organization</p>
            </div>
          </div>

          <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="form">Policy Form</TabsTrigger>
              {/* <TabsTrigger value="template">Upload Template</TabsTrigger> */}
            </TabsList>

            <TabsContent value="form" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Provide basic information about your company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Enter your company name"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => router.push("/dashboard/policies")}>
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={generatePrivilegedAccessPolicy}
                      disabled={isLoading || !formData.companyName}
                      className="bg-acasa-blue hover:bg-acasa-darkBlue"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Generate Policy
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={savePriveledgedPolicy}
                      disabled={isLoading || !formData.companyName}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* <TabsContent value="template" className="space-y-4 mt-6">
              <PolicyTemplateUploader policyType="privilegedAccess" onUploadSuccess={handleTemplateUploadSuccess} />
            </TabsContent> */}
          </Tabs>
        </main>
      </div>
    </div>
  )
}

