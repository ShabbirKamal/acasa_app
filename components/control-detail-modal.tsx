"use client"

import type React from "react"

import { useState } from "react"
import { Upload, File, Trash2, Download } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { Control } from "@/app/types/database"

interface ControlDetailModalProps {
  control: Control | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDocumentUpload: (
    controlId: string,
    documents: File[],
    metadata: {
      name: string
      classification: string
      label: string
      notes: string
    },
  ) => Promise<void>
  onDocumentDelete: (controlId: string, documentId: string) => Promise<void>
}

export function ControlDetailModal({
  control,
  open,
  onOpenChange,
  onDocumentUpload,
  onDocumentDelete,
}: ControlDetailModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [documentName, setDocumentName] = useState("")
  const [classification, setClassification] = useState("")
  const [label, setLabel] = useState("")
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("documents");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!control || files.length === 0) return

    setUploading(true)
    try {
      await onDocumentUpload(control.id, files, {
        name: documentName,
        classification,
        label,
        notes,
      })

      // Reset form
      setFiles([])
      setDocumentName("")
      setClassification("")
      setLabel("")
      setNotes("")

      toast({
        title: "Documents uploaded",
        description: `${files.length} document(s) uploaded successfully for control ${control.id}`,
      })
    } catch (error) {
      console.error("Error uploading documents:", error)
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading documents",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!control) return

    try {
      await onDocumentDelete(control.id, documentId)
      toast({
        title: "Document deleted",
        description: "Document has been removed successfully",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Delete failed",
        description: "An error occurred while deleting the document",
        variant: "destructive",
      })
    }
  }

  if (!control) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {control.id}: {control.name}
          </DialogTitle>
          <DialogDescription>{control.description}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="upload" id="upload-tab-trigger">
              Upload Documents
            </TabsTrigger>
            <TabsTrigger value="details">Control Details</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1">
              {!control.documents || control.documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <File className="h-12 w-12 mb-4" />
                  <p>No documents uploaded yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("upload")}
                  >
                    Upload Documents
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                  {control.documents.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <File className="h-5 w-5 mr-2 text-acasa-blue" />
                            <span className="font-medium truncate max-w-[200px]">{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`/api/documents/${doc.fileData}`, "_blank")}
                            >
                              <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="bg-acasa-blue/10">
                              {doc.classification}
                            </Badge>
                            <Badge variant="outline" className="bg-acasa-darkBlue/10">
                              {doc.label}
                            </Badge>
                            <Badge variant="outline">{doc.fileType}</Badge>
                          </div>

                          {doc.notes && (
                            <div className="text-muted-foreground text-xs mt-2 line-clamp-2">{doc.notes}</div>
                          )}

                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{doc.fileSize}</span>
                            <span>{doc.uploadDate}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 overflow-auto" id="upload-tab">
            <div className="space-y-4 p-2">
              <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                <Input type="file" id="file-upload" multiple className="hidden" onChange={handleFileChange} />
                <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-muted-foreground">Drag and drop files or click to browse</span>
                </Label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files</h4>
                  <div className="border rounded-md p-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="document-name">Document Name</Label>
                    <Input
                      id="document-name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Enter document name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classification">Classification</Label>
                    <Select value={classification} onValueChange={setClassification}>
                      <SelectTrigger id="classification">
                        <SelectValue placeholder="Select classification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Confidential">Confidential</SelectItem>
                        <SelectItem value="Internal">Internal</SelectItem>
                        <SelectItem value="Public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Select value={label} onValueChange={setLabel}>
                    <SelectTrigger id="label">
                      <SelectValue placeholder="Select label" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Policy">Policy</SelectItem>
                      <SelectItem value="Procedure">Procedure</SelectItem>
                      <SelectItem value="Evidence">Evidence</SelectItem>
                      <SelectItem value="Report">Report</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this document"
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full bg-acasa-blue hover:bg-acasa-darkBlue"
                  onClick={handleUpload}
                  disabled={files.length === 0 || !documentName || !classification || !label || uploading}
                >
                  {uploading ? "Uploading..." : "Upload Documents"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="flex-1 overflow-auto">
            <div className="space-y-4 p-2">
              <div className="space-y-2">
                <h3 className="font-medium">Control ID</h3>
                <p className="text-muted-foreground">{control.id}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{control.description}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Category</h3>
                <p className="text-muted-foreground">{control.category}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Status</h3>
                <Badge className={control.compliant ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                  {control.compliant ? "Compliant" : "Non-Compliant"}
                </Badge>
              </div>

              {control.lastReviewDate && (
                <div className="space-y-2">
                  <h3 className="font-medium">Last Review Date</h3>
                  <p className="text-muted-foreground">{new Date(control.lastReviewDate).toLocaleDateString()}</p>
                </div>
              )}

              {control.nextReviewDate && (
                <div className="space-y-2">
                  <h3 className="font-medium">Next Review Date</h3>
                  <p className="text-muted-foreground">{new Date(control.nextReviewDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

