"use client"

import { useState } from "react"
import { fetchUserProfile } from "@/app/actions/user"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, FileText, ArrowLeft } from "lucide-react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { importControls } from "@/app/actions/import"
import { useToast } from "@/hooks/use-toast"
import { useModal } from "@/components/ui/modal-provider"

interface ControlsImportDialogProps {
  onOpenChange: (open: boolean) => void
  onImport: (data: any[], warning?: string) => void
}

export function ControlsImportDialog({ onOpenChange, onImport }: ControlsImportDialogProps) {
  const [controlFile, setControlFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()
  const { goBack, hideModal } = useModal()

  const handleClose = () => {
    hideModal()
    onOpenChange(false)
  }

  // Dropzone for controls
  const controlsDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      setControlFile(file)

      // Optionally, use PapaParse for a preview of the parsed CSV.
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setErrorMessage(results.errors[0].message)
            setParsedData([])
          } else {
            setParsedData(results.data)
            setErrorMessage(null)
          }
        },
        error: (error) => {
          setErrorMessage(error.message)
          setParsedData([])
        },
      })
    },
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  })

  const handleImportControls = async () => {
    if (!controlFile) return

    // Read the full CSV file as text.
    const csvContent = await controlFile.text()

    // Fetch user details (placeholder values can be replaced with real data)
    const userDetails = await fetchUserProfile()
    const userId = userDetails.data?._id.toString() || ""
    const userName = userDetails.data?.name || ""

    // Call the server action.
    const result = await importControls(csvContent, userId, userName)
    if (result.success) {
      onImport(result.data ?? [], result.warning)
      if (result.warning) {
        toast({
          title: "Import Warning",
          description: result.warning,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Import Successful",
          description: "Controls imported successfully.",
        })
      }
    } else {
      console.error("Import failed:", result.error)
      toast({
        title: "Import Failed",
        description: result.error || "Failed to import controls",
        variant: "destructive",
      })
    }
    handleClose()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 border-acasa-blue/20">
        <DialogHeader className="flex flex-col space-y-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goBack} className="mr-2 h-8 w-8" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-xl text-acasa-blue">Import Controls</DialogTitle>
              <DialogDescription>Import controls from a CSV file.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            {...controlsDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              controlsDropzone.isDragActive
                ? "border-acasa-blue bg-acasa-blue/10"
                : "border-gray-300 hover:border-acasa-blue hover:bg-acasa-blue/5 dark:border-gray-700"
            }`}
          >
            <input {...controlsDropzone.getInputProps()} />
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-center text-muted-foreground">
              Drag and drop a CSV file here, or click to select a file
            </p>
            <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
            <a
              href="/api/controls/template"
              className="text-xs text-acasa-blue hover:underline mt-2"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Download template
            </a>
          </div>

          {controlFile && (
            <div className="flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-acasa-blue" />
                <span className="text-sm font-medium">{controlFile.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setControlFile(null)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {errorMessage && <div className="text-sm text-red-500 mt-2">Error: {errorMessage}</div>}

          {parsedData.length > 0 && (
            <div className="text-sm text-muted-foreground mt-2">Parsed {parsedData.length} rows.</div>
          )}
        </div>

        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose} className="border-gray-200 dark:border-gray-800">
            Cancel
          </Button>
          <Button
            onClick={handleImportControls}
            disabled={!controlFile || parsedData.length === 0}
            className="bg-acasa-blue hover:bg-acasa-darkBlue"
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
