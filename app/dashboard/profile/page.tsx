"use client"

import type React from "react"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import { Switch } from "@/components/ui/switch"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Save, Mail, Phone, Lock, Shield, Key, Upload } from "lucide-react"
import { fetchUserProfile, updateUserProfile, changeUserPassword, uploadProfilePicture } from "@/app/actions/user"
import type { User } from "../../types/database"

export default function ProfilePage() {
  const { toast } = useToast()

  const [profileData, setProfileData] = useState<Partial<User>>({
    name: "",
    email: "",
    phone: "",
    jobTitle: "",
    department: "",
    bio: "",
    profilePicture: "",
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setIsLoading(true)
        const result = await fetchUserProfile()

        if (result.success && result.data) {
          setProfileData({
            name: result.data.name || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
            jobTitle: result.data.jobTitle || "",
            department: result.data.department || "",
            bio: result.data.bio || "",
            profilePicture: result.data.profilePicture || "",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load profile",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [toast])

  const handleProfileChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value,
    })
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadProfilePicture(formData)

      if (result.success && result.data) {
        setProfileData((prev) => ({
          ...prev,
          profilePicture: result.data.imageUrl,
        }))

        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to upload profile picture",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleSaveProfile = async () => {
    try {
      const result = await updateUserProfile(profileData)

      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required",
        variant: "destructive",
      })
      return
    }

    if (!newPassword) {
      toast({
        title: "Error",
        description: "New password is required",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await changeUserPassword(currentPassword, newPassword)

      if (result.success) {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully.",
        })
        // Clear password fields
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to change password",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEnableTwoFactor = () => {
    toast({
      title: "Two-factor authentication enabled",
      description: "Two-factor authentication has been enabled for your account.",
    })
  }

  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] pt-8">
      <aside className="hidden w-[200px] flex-col md:flex">
        <DashboardNav activeItem="profile" />
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <Card className="md:w-1/3">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-pulse bg-muted rounded-full h-32 w-32 mb-6"></div>
                  <div className="animate-pulse bg-muted h-6 w-40 rounded mb-2"></div>
                  <div className="animate-pulse bg-muted h-4 w-32 rounded mb-6"></div>
                  <div className="w-full space-y-2">
                    <div className="animate-pulse bg-muted h-4 w-full rounded"></div>
                    <div className="animate-pulse bg-muted h-4 w-full rounded"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative mb-6">
                    <Avatar className="h-32 w-32">
                      <AvatarImage
                        src={profileData.profilePicture || "/placeholder.svg?height=128&width=128"}
                        alt="Profile"
                      />
                      <AvatarFallback className="text-4xl">
                        {profileData.name
                          ? profileData.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <>
                      <input
                        type="file"
                        id="profile-picture"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background"
                        onClick={() => document.getElementById("profile-picture")?.click()}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </>
                  </div>
                  <h2 className="text-xl font-bold">{profileData.name || "User"}</h2>
                  <p className="text-sm text-muted-foreground">{profileData.jobTitle || "No job title"}</p>
                  <p className="text-sm text-muted-foreground">{profileData.department || "No department"}</p>

                  <div className="w-full mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profileData.phone || "No phone number"}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="md:w-2/3 space-y-6">
            <Tabs defaultValue="account">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Update your account information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="space-y-2">
                              <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
                              <div className="animate-pulse bg-muted h-10 w-full rounded"></div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <div className="animate-pulse bg-muted h-4 w-20 rounded"></div>
                          <div className="animate-pulse bg-muted h-24 w-full rounded"></div>
                        </div>
                      </div>
                    ) : (
                      // Existing form content
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => handleProfileChange("name", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleProfileChange("email", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => handleProfileChange("phone", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input
                            id="jobTitle"
                            value={profileData.jobTitle}
                            onChange={(e) => handleProfileChange("jobTitle", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={profileData.department}
                            onChange={(e) => handleProfileChange("department", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    {!isLoading && (
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => handleProfileChange("bio", e.target.value)}
                          rows={4}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-acasa-blue hover:bg-acasa-darkBlue"
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleChangePassword} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Shield className="h-10 w-10 text-acasa-blue" />
                      <div>
                        <h3 className="font-medium">Protect your account with two-factor authentication</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Two-factor authentication adds an extra layer of security to your account by requiring more
                          than just a password to sign in.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleEnableTwoFactor} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                      <Key className="h-4 w-4 mr-2" />
                      Enable Two-Factor Authentication
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Customize how the application appears to you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="darkMode">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">Use dark mode for the application</p>
                        </div>
                        <Switch id="darkMode" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="compactView">Compact View</Label>
                          <p className="text-sm text-muted-foreground">
                            Use a more compact layout for tables and lists
                          </p>
                        </div>
                        <Switch id="compactView" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select defaultValue="utc">
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="utc">UTC</SelectItem>
                            <SelectItem value="est">Eastern Time (ET)</SelectItem>
                            <SelectItem value="cst">Central Time (CT)</SelectItem>
                            <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                            <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select defaultValue="en">
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveProfile} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

