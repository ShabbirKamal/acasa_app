"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertTriangle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { validateAwsCredentials, deleteAwsCredentials } from "../app/actions/aws-integration"


interface AwsCredentialsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingCredentials?: {
    accessKeyId: string
    accountId?: string
    isValid: boolean
    lastValidated?: Date
  } | null
}

export function AwsCredentialsModal({ open, onOpenChange, existingCredentials = null }: AwsCredentialsModalProps) {
  const [accessKeyId, setAccessKeyId] = useState(existingCredentials?.accessKeyId || "")
  const [secretAccessKey, setSecretAccessKey] = useState("")
  const [sessionToken, setSessionToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("accessKeyId", accessKeyId)
      formData.append("secretAccessKey", secretAccessKey)
      if (sessionToken) {
        formData.append("sessionToken", sessionToken)
      }

      const result = await validateAwsCredentials(formData)

      if (result.success) {
        toast({
          title: "AWS Integration Successful",
          description: `Credentials validated for account ${result.accountId}`,
        })
        onOpenChange(false)
      } else {
        setErrorMessage(result.error || "Failed to validate AWS credentials")
        toast({
          title: "Validation Failed",
          description: "Failed to validate AWS credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting AWS credentials:", error)
      setErrorMessage("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred while validating credentials",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete these AWS credentials?")) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteAwsCredentials()

      if (result.success) {
        toast({
          title: "Credentials Deleted",
          description: "AWS credentials have been removed",
        })
        onOpenChange(false)
      } else {
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete AWS credentials",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting AWS credentials:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting credentials",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">AWS Integration</DialogTitle>
          <DialogDescription>
            {existingCredentials
              ? "Update your AWS credentials to enable cloud scanning features."
              : "Add your AWS credentials to enable cloud scanning features."}
          </DialogDescription>
        </DialogHeader>

        {existingCredentials && (
          <div className="my-4">
            <Alert variant={existingCredentials.isValid ? "default" : "destructive"}>
              <div className="flex items-center">
                {existingCredentials.isValid ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mr-2" />
                )}
                <AlertTitle>{existingCredentials.isValid ? "Valid Credentials" : "Invalid Credentials"}</AlertTitle>
              </div>
              <AlertDescription>
                {existingCredentials.isValid
                  ? `Connected to AWS account ${existingCredentials.accountId || "Unknown"}`
                  : "The stored AWS credentials are invalid."}
                {existingCredentials.lastValidated && (
                  <div className="text-xs mt-1">
                    Last validated: {new Date(existingCredentials.lastValidated).toLocaleString()}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
            <Input
              id="accessKeyId"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
            <Input
              id="secretAccessKey"
              type="password"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionToken">AWS Session Token (Optional)</Label>
            <Input
              id="sessionToken"
              type="password"
              value={sessionToken}
              onChange={(e) => setSessionToken(e.target.value)}
              placeholder="Only required for temporary credentials"
            />
            <p className="text-xs text-muted-foreground">Only required when using temporary credentials</p>
          </div>

          {errorMessage && <div className="text-sm text-red-500">Error: {errorMessage}</div>}

          <DialogFooter className="flex justify-between">
            <div>
              {existingCredentials && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !accessKeyId || !secretAccessKey}
                className="bg-acasa-blue hover:bg-acasa-darkBlue"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Save Credentials"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

