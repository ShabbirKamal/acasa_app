"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, ArrowUpDown, GripVertical, Eye, X, AlertCircle, File } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { executeScriptWithInputs } from "../app/actions/script-execution"
import { fetchPlainControl } from "@/app/actions/serialized-control-documents"
import type { ScriptInputParam, ControlDocument } from "../app/types/database"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DocumentInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scriptId: string
  scriptName: string
  controlId: string
  inputParams: ScriptInputParam[]
  onExecutionComplete: (result: any) => void
}

export function DocumentInputModal({
  open,
  onOpenChange,
  scriptId,
  scriptName,
  controlId,
  onExecutionComplete,
}: DocumentInputModalProps) {
  const [control, setControl] = useState<any>(null)
  const [documents, setDocuments] = useState<ControlDocument[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<ControlDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch documents when modal opens
  useEffect(() => {
    if (open && controlId) {
      loadDocuments()
    }
  }, [open, controlId])

  const loadDocuments = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log(`Loading documents for controlId: ${controlId}`)

      // Use fetchPlainControl to get the control with its documents
      const controlData = await fetchPlainControl(controlId)

      console.log("Control data:", controlData)

      if (controlData) {
        setControl(controlData)

        // Extract documents from the control
        if (controlData.documents && Array.isArray(controlData.documents)) {
          setDocuments(controlData.documents)
          console.log(`Found ${controlData.documents.length} documents`)

          if (controlData.documents.length === 0) {
            setError("No documents found for this control")
          }
        } else {
          console.log("No documents array found on control")
          setDocuments([])
          setError("No documents found for this control")
        }
      } else {
        setError("Failed to fetch control data")
        toast({
          title: "Error",
          description: "Failed to fetch control data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      setError("An unexpected error occurred while fetching documents")
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Convert selected documents to input format
      const inputs: Record<string, any> = {}

      // Add each selected document path as a separate input parameter
      selectedDocuments.forEach((doc, index) => {
        const key = `param${index + 1}`
        // Use fileData as the input value
        inputs[key] = doc.fileData
      })

      // Execute the script with the provided inputs
      const result = await executeScriptWithInputs(scriptId, controlId, inputs)

      if (result.success) {
        toast({
          title: "Script executed successfully",
        })
        onExecutionComplete(result.result)
        onOpenChange(false)
      } else {
        toast({
          title: "Script execution failed",
          description: result.error || "Failed to execute script",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing script:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while executing the script",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(selectedDocuments)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedDocuments(items)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Document Inputs: {scriptName}</DialogTitle>
          <DialogDescription>Select and arrange documents to use as inputs for this script.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-acasa-blue" />
            <span className="ml-2">Loading documents...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="select" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="mb-2">
              <TabsTrigger value="select">Select Documents</TabsTrigger>
              <TabsTrigger value="selected">Selected Documents ({selectedDocuments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="flex-1 overflow-hidden flex flex-col">
              <div className="space-y-4 flex-1 overflow-auto">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Available Documents</Label>
                    <Button variant="outline" size="sm" onClick={loadDocuments} className="text-xs">
                      Refresh
                    </Button>
                  </div>

                  {documents.length === 0 ? (
                    <div className="text-center p-8 border rounded-md text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p>No documents available for this control</p>
                      <p className="text-sm mt-2">Please upload documents to the control first</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                      {documents
                        .filter((doc) => !selectedDocuments.some((selected) => selected.id === doc.id))
                        .map((doc) => (
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
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDocuments([...selectedDocuments, doc])}
                                  >
                                    Select
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="selected" className="flex-1 overflow-hidden flex flex-col">
              <div className="space-y-4 flex-1 overflow-auto">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Selected Documents</Label>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {selectedDocuments.length} documents selected
                    </Badge>
                  </div>

                  {selectedDocuments.length === 0 ? (
                    <div className="text-center p-4 border rounded-md text-muted-foreground">
                      No documents selected. Select documents from the list.
                    </div>
                  ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="selected-documents">
                        {(provided) => (
                          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                            {selectedDocuments.map((doc, index) => (
                              <Draggable key={doc.id} draggableId={doc.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="flex items-center p-3 border rounded-md bg-muted/20"
                                  >
                                    <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{doc.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {doc.fileType?.split("/")[1] || doc.fileType || "Unknown"}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{doc.fileSize}</p>
                                    </div>
                                    <div className="flex items-center ml-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => window.open(`/api/documents/${doc.fileData}`, "_blank")}
                                        className="h-8 w-8 mr-1"
                                        title="View document"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setSelectedDocuments(selectedDocuments.filter((_, i) => i !== index))
                                        }}
                                        className="h-8 w-8"
                                        title="Remove document"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    <ArrowUpDown className="h-4 w-4 inline mr-1" />
                    Drag and drop documents to change their order. The order determines how they will be passed to the
                    script.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedDocuments.length === 0}
            className="bg-acasa-blue hover:bg-acasa-darkBlue"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              "Execute Script"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
