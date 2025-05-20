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
import { Save, Download, Plus, ChevronRight, ChevronLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchGeneralSettings } from "@/app/actions/settings"
import { fetchUserProfile } from "@/app/actions/user"
import { createNewPolicy, fetchPolicyByUserAndName, updateExistingPolicy } from "@/app/actions/policies"
import { useEffect } from "react"
import { UserWithoutPswd } from "@/app/types/database"

export default function ISMSScopePolicyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("form")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserWithoutPswd>()
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3 // Simplified from 9 steps in the original form
  const [fetched, setFetched] = useState(false)
  const [policyId, setPolicyId] = useState("")

  // Basic company details
  const [formData, setFormData] = useState({
    companyName: "",
    companyServices: "",
    locations: [""],
    assets: [""],
    departments: [""],
    objectives: [{ name: "", actionPlan: "", effectivenessMeasures: "", resources: "", eta: "" }],
  })

  // Handle input changes for text fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // Handle location changes
  const handleLocationChange = (index: number, value: string) => {
    const updatedLocations = [...formData.locations]
    updatedLocations[index] = value
    setFormData({ ...formData, locations: updatedLocations })
  }

  // Handle asset changes
  const handleAssetChange = (index: number, value: string) => {
    const updatedAssets = [...formData.assets]
    updatedAssets[index] = value
    setFormData({ ...formData, assets: updatedAssets })
  }

  // Handle department changes
  const handleDepartmentChange = (index: number, value: string) => {
    const updatedDepartments = [...formData.departments]
    updatedDepartments[index] = value
    setFormData({ ...formData, departments: updatedDepartments })
  }

  // Handle objective changes
  const handleObjectiveChange = (index: number, value: string) => {
    const updatedObjectives = [...formData.objectives]
    updatedObjectives[index].name = value
    setFormData({ ...formData, objectives: updatedObjectives })
  }

  // Handle objective detail changes
  const handleObjectiveDetailChange = (index: number, field: string, value: string) => {
    const updatedObjectives = [...formData.objectives]
    updatedObjectives[index] = {
      ...updatedObjectives[index],
      [field]: value,
    }
    setFormData({ ...formData, objectives: updatedObjectives })
  }

  // Add new fields
  const addLocationField = () => {
    setFormData({ ...formData, locations: [...formData.locations, ""] })
  }

  const addAssetField = () => {
    setFormData({ ...formData, assets: [...formData.assets, ""] })
  }

  const addDepartmentField = () => {
    setFormData({ ...formData, departments: [...formData.departments, ""] })
  }

  const addObjectiveField = () => {
    setFormData({
      ...formData,
      objectives: [
        ...formData.objectives,
        { name: "", actionPlan: "", effectivenessMeasures: "", resources: "", eta: "" },
      ],
    })
  }

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await fetchUserProfile()
        if (result.success) {
          // console.log(result.data)
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
    const loadISMS = async () => {
      try {
        setIsLoading(true)
        if (user)
        {
          const result = await fetchPolicyByUserAndName(user._id, "ISMS Policy")
          if (result.success && result.data?.content) {
            console.log(result.data)
            const parsedContent = JSON.parse(result.data.content)
            setFormData({
              companyName: parsedContent.companyName || "",
              companyServices: parsedContent.companyServices || "",
              locations: parsedContent.locations || [""],
              assets: parsedContent.assets || [""],
              departments: parsedContent.departments || [""],
              objectives:
                parsedContent.objectives || [
                  {
                    name: "",
                    actionPlan: "",
                    effectivenessMeasures: "",
                    resources: "",
                    eta: "",
                  },
                ],
            })
            setPolicyId(result.data._id)
            setFetched(true)
          } else {
            console.error(result.error)
          }
        }
      } catch (err) {
        console.error("Failed fetch to ISMS policy", err)
      }
      finally {
        setIsLoading(false)
      }
    }

    loadISMS()

  }, [user, fetched])

  useEffect(() => {
    const loadSettings = async () => {
      if (fetched) return
      try {
        const result = await fetchGeneralSettings()
        if (result.success) {
          setFormData({ ...formData, companyName: result.data.companyName })
          // console.log(formData.companyName)
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
  }, [formData, fetched])

  const saveISMSPolicy = async () => {

    const form = new FormData()
    form.append("name", "ISMS Policy")
    form.append("content", JSON.stringify(formData))
    form.append("status", "Draft")
    form.append("userId", user?._id || "")
    form.append("userName", user?.name || "")

    if (!fetched && user) {
      try {
        const result = await createNewPolicy(form, user._id, user.name)
        if (result.success) {
          toast({
            title: "Policy saved",
            description: "ISMS Scope Policy has been saved successfully.",
          })
          router.push("/dashboard/policies")
        }
        else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        }
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
        {        const result = await updateExistingPolicy(policyId, form, user._id, user.name)
        if (result.success) {
          toast({
            title: "Policy saved",
            description: "ISMS Scope Policy has been updated successfully.",
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

  // Generate ISMS policy
  const generateISMSPolicy = async () => {
    try {
      setIsLoading(true);

      // POST the form data to your doc-generation API
      const res = await fetch("/api/policy-gen/isms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to generate document");
      }

      // Convert response into a blob and download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ISMSPolicy.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Policy generated",
        description: "ISMS Scope Policy has been generated and downloaded successfully.",
      });
    } catch (error: unknown) {
      console.error("Error generating policy:", error);
      let message = "Failed to generate policy document"
      if (error instanceof Error) {
        message = error.message
      }
      toast({
        title: "Error",
        description: message || "Failed to generate policy document",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


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
              <h1 className="text-2xl font-bold tracking-tight">Create ISMS Scope Policy</h1>
              <p className="text-muted-foreground">Define the scope of your Information Security Management System</p>
            </div>
          </div>

          <Tabs defaultValue="form" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="form">Policy Form</TabsTrigger>
              {/* <TabsTrigger value="template">Upload Template</TabsTrigger> */}
            </TabsList>

            <TabsContent value="form" className="space-y-4 mt-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-16 rounded-full ${currentStep > index ? "bg-acasa-blue" : "bg-muted"}`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {currentStep === 1 && "Basic Company Details"}
                    {currentStep === 2 && "Additional Company Details"}
                    {currentStep === 3 && "Information Security Objectives"}
                  </CardTitle>
                  <CardDescription>
                    {currentStep === 1 && "Provide basic information about your company"}
                    {currentStep === 2 && "Define your company assets and departments"}
                    {currentStep === 3 && "Define your information security objectives and implementation plans"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentStep === 1 && (
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

                      <div className="space-y-2">
                        <Label htmlFor="companyServices">Enter the type of services your company provides</Label>
                        <Input
                          id="companyServices"
                          name="companyServices"
                          value={formData.companyServices}
                          onChange={handleInputChange}
                          placeholder="e.g., Software Development, Consulting, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Company Locations</Label>
                        {formData.locations.map((location, index) => (
                          <div key={index} className="flex items-center gap-2 mt-2">
                            <Label htmlFor={`location-${index}`} className="w-24">
                              {index === 0 ? "Location 1:" : `Location ${index + 1}:`}
                            </Label>
                            <Input
                              id={`location-${index}`}
                              value={location}
                              onChange={(e) => handleLocationChange(index, e.target.value)}
                              placeholder="Enter location address"
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addLocationField}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Location
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Company Assets</Label>
                        {formData.assets.map((asset, index) => (
                          <div key={index} className="flex items-center gap-2 mt-2">
                            <Label htmlFor={`asset-${index}`} className="w-24">
                              {index === 0 ? "Asset 1:" : `Asset ${index + 1}:`}
                            </Label>
                            <Input
                              id={`asset-${index}`}
                              value={asset}
                              onChange={(e) => handleAssetChange(index, e.target.value)}
                              placeholder="Enter asset name"
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addAssetField}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Asset
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Company Departments</Label>
                        {formData.departments.map((department, index) => (
                          <div key={index} className="flex items-center gap-2 mt-2">
                            <Label htmlFor={`department-${index}`} className="w-24">
                              {index === 0 ? "Department 1:" : `Department ${index + 1}:`}
                            </Label>
                            <Input
                              id={`department-${index}`}
                              value={department}
                              onChange={(e) => handleDepartmentChange(index, e.target.value)}
                              placeholder="Enter department name"
                              className="flex-1"
                            />
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addDepartmentField}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Department
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Information Security Objectives</Label>
                        {formData.objectives.map((objective, index) => (
                          <div key={index} className="p-4 border rounded-md mt-4">
                            <div className="space-y-2">
                              <Label htmlFor={`objective-${index}`}>Objective</Label>
                              <Input
                                id={`objective-${index}`}
                                value={objective.name}
                                onChange={(e) => handleObjectiveChange(index, e.target.value)}
                                placeholder="Enter objective"
                                className="w-full"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <Label htmlFor={`actionPlan-${index}`}>Action Plan</Label>
                                <Input
                                  id={`actionPlan-${index}`}
                                  value={objective.actionPlan || ""}
                                  onChange={(e) => handleObjectiveDetailChange(index, "actionPlan", e.target.value)}
                                  placeholder="Enter action plan"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`effectivenessMeasures-${index}`}>Effectiveness Measures</Label>
                                <Input
                                  id={`effectivenessMeasures-${index}`}
                                  value={objective.effectivenessMeasures || ""}
                                  onChange={(e) =>
                                    handleObjectiveDetailChange(index, "effectivenessMeasures", e.target.value)
                                  }
                                  placeholder="Enter effectiveness measures"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`resources-${index}`}>Resources Required</Label>
                                <Input
                                  id={`resources-${index}`}
                                  value={objective.resources || ""}
                                  onChange={(e) => handleObjectiveDetailChange(index, "resources", e.target.value)}
                                  placeholder="Enter required resources"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`eta-${index}`}>ETA</Label>
                                <Input
                                  id={`eta-${index}`}
                                  value={objective.eta || ""}
                                  onChange={(e) => handleObjectiveDetailChange(index, "eta", e.target.value)}
                                  placeholder="Enter estimated time of achievement"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addObjectiveField}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Objective
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {currentStep > 1 ? (
                    <Button variant="outline" onClick={prevStep}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => router.push("/dashboard/policies")}>
                      Cancel
                    </Button>
                  )}

                  {currentStep < totalSteps ? (
                    <Button onClick={nextStep} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={generateISMSPolicy}
                        disabled={isLoading}
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
                        onClick={saveISMSPolicy}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            {/* <TabsContent value="template" className="space-y-4 mt-6">
              <PolicyTemplateUploader policyType="isms" onUploadSuccess={handleTemplateUploadSuccess} />
            </TabsContent> */}
          </Tabs>
        </main>
      </div>
    </div>
  )
}