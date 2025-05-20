"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Plus } from "lucide-react"
import { fetchUserProfile } from "@/app/actions/user"
import { fetchPoliciesByUser } from "@/app/actions/policies"
import type { Policy } from "@/app/types/database"


interface UserProfile {
  _id: string
  name: string
  email: string
  jobTitle?: string
  department?: string
  phone?: string
  bio?: string
  profilePicture?: string
  role: "admin" | "auditor" | "user"
  status: "active" | "inactive" | "pending"
  createdAt: string
  updatedAt: string
}

export function PoliciesTable() {
  // now uses UserProfile (no required password)
  const [user, setUser] = useState<UserProfile>()
  const [policies, setPolicies] = useState<Policy[]>([])

  useEffect(() => {
    async function loadUserAndPolicies() {
      try {
        const userResult = await fetchUserProfile()
        if (userResult.success && userResult.data) {
          // data matches UserProfile
          setUser(userResult.data)

          const policiesResult = await fetchPoliciesByUser(
            userResult.data._id
          )
          if (policiesResult.success && policiesResult.data) {
            setPolicies(policiesResult.data)
          } else {
            console.error("Failed to load policies:", policiesResult.error)
          }
        } else {
          console.error("Failed to load user:", userResult.error)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      }
    }

    loadUserAndPolicies()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input placeholder="Search policies..." className="max-w-sm" />

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-acasa-blue hover:bg-acasa-darkBlue">
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                Select a policy template to get started
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col">
              <Button
                asChild
                variant="ghost"
                className="justify-start rounded-none h-auto p-6 hover:bg-acasa-blue/5 border-t"
              >
                <Link href="/dashboard/policies/create/isms-scope">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-base">
                      ISMS Scope Policy
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Define the scope of your Information Security Management System
                    </span>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="justify-start rounded-none h-auto p-6 hover:bg-acasa-blue/5 border-t"
              >
                <Link href="/dashboard/policies/create/privileged-access">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-base">
                      Privileged Access Management Policy
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Define how privileged access is managed in your organization
                    </span>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="justify-start rounded-none h-auto p-6 hover:bg-acasa-blue/5 border-t"
              >
                <Link href="/dashboard/policies/create/malware-detection">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-base">
                      Malware Detection Policy
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      Define how malware is detected and managed in your
                      organization
                    </span>
                  </div>
                </Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[150px]">Last Updated</TableHead>
              <TableHead className="w-[150px]">Created By</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow
                // use only _id (no nonexistent `id` field)
                key={policy._id!.toString()}
              >
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    {policy.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      policy.status === "Published"
                        ? "badge-success"
                        : policy.status === "Draft"
                        ? "badge-neutral"
                        : "badge-warning"
                    }
                  >
                    {policy.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(policy.lastUpdated).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell>{user?.name ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={
                          policy.name === "ISMS Policy"
                            ? "/dashboard/policies/create/isms-scope"
                            : policy.name ===
                              "Priviledged Access Policy"
                            ? "/dashboard/policies/create/privileged-access"
                            : policy.name === "Malware Detection Policy"
                            ? "/dashboard/policies/create/malware-detection"
                            : "/dashboard/policies"
                        }
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
