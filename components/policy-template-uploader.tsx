"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileUp, Check, AlertCircle } from "lucide-react"

interface PolicyTemplateUploaderProps {
  policyType: "isms" | "malware" | "privilegedAccess"
  onUploadSuccess: () => void
}

export function PolicyTemplateUploader({ policyType, onUploadSuccess }: PolicyTemplateUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const policyNames = {
    isms: "ISMS Scope Policy",
    malware: "Malware Detection Policy",
    privilegedAccess: "Privileged Access Management Policy",
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".docx")) {
        setError("Please select a .docx file")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("policyType", policyType)

      // In a real app, this would call an API endpoint to upload the template
      // For now, we'll simulate a successful upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Template uploaded",
        description: `${policyNames[policyType]} template has been uploaded successfully.`,
      })

      setFile(null)
      onUploadSuccess()
    } catch (error) {
      console.error("Error uploading template:", error)
      setError("An unexpected error occurred")
      toast({
        title: "Upload failed",
        description: "Failed to upload template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Template</CardTitle>
        <CardDescription>Upload a Word document (.docx) template for {policyNames[policyType]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".docx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
              <FileUp className="h-10 w-10 text-muted-foreground mb-2" />
              <span className="text-sm font-medium mb-1">{file ? file.name : "Click to upload or drag and drop"}</span>
              <span className="text-xs text-muted-foreground">.docx files only</span>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {file && !error && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              <span>File selected: {file.name}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full bg-acasa-blue hover:bg-acasa-darkBlue"
        >
          {isUploading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Template
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

