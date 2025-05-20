"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Play, Upload, FileText, Check, X, Download, Search, Filter } from "lucide-react"
import { updateControlStatus } from "@/app/actions/controls"
import { exportControls } from "@/app/actions/export"
import { ImportControlsDialog } from "@/components/import-controls-dialog"
import { fetchUserProfile } from "../app/actions/user"
import { ControlDetailModal } from "@/components/control-detail-modal"
import { ControlAutomationModal } from "@/components/control-automation-modal"
import { uploadControlDocuments, deleteControlDocument } from "@/app/actions/control-documents"
import { fetchPlainControl } from "@/app/actions/serialized-control-documents"
import { fetchPlainControls } from "@/app/actions/plain-controls"
import type { Control } from "../app/types/database"

export function ControlsTable() {
  const [controls, setControls] = useState<Control[]>([])
  const [filteredControls, setFilteredControls] = useState<Control[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [automationModalOpen, setAutomationModalOpen] = useState(false)

  const { toast } = useToast()
  const router = useRouter();

  // Fetch controls from the database
  useEffect(() => {
    async function loadControls() {
      try {
        const result = await fetchPlainControls()
        if (result) {
          if (result) {
            setControls(result)
            setFilteredControls(result)
          } else {
            setControls([]) // Ensure it's never undefined
            setFilteredControls([])
          }
        } else {
          toast({
            title: "Error",
            description: result || "Failed to load controls",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading controls:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading controls",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadControls()
  }, [toast])

  // Filter controls based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredControls(controls)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = controls.filter((control) => {
      const id = control.id ? control.id.toLowerCase() : "";
      const name = control.name ? control.name.toLowerCase() : "";
      const category = control.category ? control.category.toLowerCase() : "";
      return id.includes(query) || name.includes(query) || category.includes(query);
    });
      setFilteredControls(filtered);
    }, [searchQuery, controls]);

  const handleComplianceChange = async (id: string, checked: boolean) => {
    try {
      // Optimistically update the UI
      setControls((prevControls) =>
        prevControls.map((control) => (control.id === id ? { ...control, compliant: checked } : control)),
      )

      const userDetails = await fetchUserProfile()

      const userId = userDetails.data?._id.toString() || "default-user-id"
      const userName = userDetails.data?.name || "Unknown User"

      const result = await updateControlStatus(id, checked, userId, userName)

      if (!result.success) {
        // Revert UI if API request fails
        setControls((prevControls) =>
          prevControls.map((control) => (control.id === id ? { ...control, compliant: !checked } : control)),
        )

        toast({
          title: "Error",
          description: result.error || "Failed to update control status",
          variant: "destructive",
        })
      } else {
        toast({
          title: `Control ${id} ${checked ? "marked as compliant" : "marked as non-compliant"}`,
          description: `Updated compliance status for ${controls.find((c) => c.id === id)?.name}`,
        })
      }
    } catch (error) {
      console.error("Error updating control status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleViewDocuments = async (control: Control) => {
    try {
      // Fetch the control with documents
      // const result = await getControlWithDocuments(control._id?.toString() || "")
      
      console.log("[handleViewDocuments] control argument:", control);
      console.log("[handleViewDocuments] control.id:", control.id);

      if (control) {

        const updatedControl = await fetchPlainControl(control.id);
        setSelectedControl(updatedControl);
        router.refresh();
        setDetailModalOpen(true)
        
      } else {
        toast({
          title: "Error",
          description: control || "Failed to load control details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading control details:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }


  const handleDocumentUpload = async (controlId: string, files: File[], metadata: any): Promise<void> => {
    try {
      const userDetails = await fetchUserProfile();
      const userId = userDetails.data?._id.toString() || "default-user-id";
      const userName = userDetails.data?.name || "Unknown User";
  
      // Convert files to base64
      const filePromises = files.map((file) => {
        return new Promise<{ name: string; type: string; size: number; base64: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              type: file.type,
              size: file.size,
              base64: reader.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      const fileData = await Promise.all(filePromises);
  
      // Upload documents
      const result = await uploadControlDocuments(controlId, fileData, metadata, userId, userName);
  
      if (result.success) {
        // Update the local state to show the control has documents
        setControls(
          controls.map((control) =>
            control.id?.toString() === controlId ? { ...control, hasDocument: true } : control,
          ),
        );
  
        // Refresh the control data in the modal
        const updatedControl = await fetchPlainControl(controlId);
        setSelectedControl(updatedControl as Control);

        
        
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload documents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };


  const handleDocumentDelete = async (controlId: string, documentId: string): Promise<void> => {
    try {
      const result = await deleteControlDocument(controlId, documentId);
  
      if (result.success) {
        // Refresh the control data
        const updatedControl = await fetchPlainControl(controlId);
        if (updatedControl) {
          setSelectedControl(updatedControl as Control);
  
          // Update the controls list if the control no longer has documents
          if (!updatedControl.hasDocument) {
            setControls(
              controls.map((control) =>
                control.id?.toString() === controlId ? { ...control, hasDocument: false } : control,
              ),
            );
          }
        }
      } else {
        toast({
          title: "Delete failed",
          description: result.error || "Failed to delete document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  

  const handleAutomate = (control: Control) => {
    
    // In a real app, this would trigger the automation script
    
    // toast({
    //   title: "Automation started",
    //   description: `Running automation script for control ${control.id}`,
    // })
    
    setSelectedControl(control)
    setAutomationModalOpen(true)

    // // Simulate automation completion after 2 seconds
    // setTimeout(() => {
    //   setControls(controls.map((control) => (control.id === id ? { ...control, compliant: true } : control)))

    //   toast({
    //     title: "Automation completed",
    //     description: `Control ${id} has been automatically verified and marked as compliant`,
    //   })
    // }, 2000)
  }

  const handleExport = async () => {
    try {
      const userDetails = await fetchUserProfile()
      const userId = userDetails.data?._id?.toString() || "default-user-id";
      const userName = userDetails.data?.name || "Unknown User";
      const result = await exportControls(userId, userName)

      if (result.success) {
        // Create a blob from the CSV data
        const blob = new Blob([result.data || ""], { type: "text/csv" })

        // Create a download link and trigger the download
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = "controls.csv"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "Export successful",
          description: "Controls have been exported to CSV",
        })
      } else {
        toast({
          title: "Export failed",
          description: result.error || "Failed to export controls",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error exporting controls:", error)
      toast({
        title: "Export failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleImportSuccess = (importedControls: Control[]) => {
    // Update the controls list with the newly imported controls
    setControls((prevControls) => {
      // Create a map of existing controls by ID for quick lookup
      const existingControlsMap = new Map(prevControls.map((control) => [control.id, control]))

      // Merge imported controls with existing ones, updating existing controls
      importedControls.forEach((importedControl) => {
        existingControlsMap.set(importedControl.id, importedControl)
      })

      // Convert the map back to an array
      return Array.from(existingControlsMap.values())
    })

    setIsImportDialogOpen(false)

    toast({
      title: "Import successful",
      description: `${importedControls.length} controls have been imported`,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-full max-w-sm animate-pulse bg-muted h-10 rounded-md"></div>
          <div className="flex items-center gap-2">
            <div className="animate-pulse bg-muted h-10 w-20 rounded-md"></div>
            <div className="animate-pulse bg-muted h-10 w-20 rounded-md"></div>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="h-[400px] animate-pulse bg-muted"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search controls..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Control ID</TableHead>
              <TableHead>Control Name</TableHead>
              <TableHead className="w-[100px] text-center">Compliant</TableHead>
              <TableHead className="w-[150px] text-center">Documents</TableHead>
              <TableHead className="w-[200px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredControls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchQuery ? "No controls match your search" : "No controls found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredControls.map((control, index) => (
                <TableRow key={`${control.id}-${index}`} className="h-16">
                  <TableCell className="font-medium">{control.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{control.name}</div>
                      {control.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{control.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {control.compliant ? (
                        <div className="flex justify-center">
                          <div className="w-6 h-6 rounded-full bg-acasa-success flex items-center justify-center">
                            <Check className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-6 h-6 rounded-full bg-acasa-danger flex items-center justify-center">
                            <X className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      {control.hasDocument ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDocuments(control)
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDocuments(control)
                            // Focus the upload tab when modal opens
                            setTimeout(() => {
                              document.getElementById("upload-tab-trigger")?.click()
                            }, 100)
                          }}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between px-4">
                      <Checkbox
                        checked={control.compliant}
                        onCheckedChange={(checked) => handleComplianceChange(control.id, checked as boolean)}
                      />
                      {control.canAutomate && (
                        <Button
                          className="bg-acasa-blue hover:bg-acasa-darkBlue w-28"
                          size="sm"
                          onClick={() => handleAutomate(control)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Automate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ImportControlsDialog
      open={isImportDialogOpen}
      onOpenChange={setIsImportDialogOpen}
      onImport={handleImportSuccess}
      />

      <ControlDetailModal
        control={selectedControl}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onDocumentUpload={handleDocumentUpload}
        onDocumentDelete={handleDocumentDelete}
      />

      {selectedControl && (
        <ControlAutomationModal
          open={automationModalOpen}
          onOpenChange={setAutomationModalOpen}
          controlId={selectedControl.id}
          controlName={selectedControl.name}
        />
      )}
      
    </div>
  )
}