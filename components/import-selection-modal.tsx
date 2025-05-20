"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, UserPlus, Database, Code, ArrowLeft } from "lucide-react"
import { useModal } from "@/components/ui/modal-provider"

interface ImportSelectionModalProps {
  onOpenChange: (open: boolean) => void
  onSelect: (option: "upload" | "user-input" | "database" | "no-input" | "documents") => void
}

export function ImportSelectionModal({ onOpenChange, onSelect }: ImportSelectionModalProps) {
  const { goBack, hideModal } = useModal()

  const handleClose = () => {
    hideModal()
    onOpenChange(false)
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] p-6 bg-white dark:bg-gray-950 border-acasa-blue/20">
        <DialogHeader className="flex flex-col space-y-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goBack} className="mr-2 h-8 w-8" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-xl text-acasa-blue">Import Script</DialogTitle>
              <DialogDescription>Choose how you want to provide inputs for your script.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-6 px-4 gap-2 hover:bg-acasa-blue/5 hover:border-acasa-blue border-gray-200 dark:border-gray-800"
            onClick={() => onSelect("documents")}
          >
            <Upload className="h-10 w-10 text-acasa-blue" />
            <span className="font-medium">Upload Documents</span>
            <span className="text-xs text-muted-foreground text-center w-full break-words">
              Use document files as input for your script
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-6 px-4 gap-2 hover:bg-acasa-blue/5 hover:border-acasa-blue border-gray-200 dark:border-gray-800"
            onClick={() => onSelect("user-input")}
          >
            <UserPlus className="h-10 w-10 text-acasa-blue" />
            <span className="font-medium">User Input</span>
            <span className="text-xs text-muted-foreground text-center w-full break-words">
              Define input parameters for your script
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-6 px-4 gap-2 hover:bg-acasa-blue/5 hover:border-acasa-blue border-gray-200 dark:border-gray-800"
            onClick={() => onSelect("database")}
          >
            <Database className="h-10 w-10 text-acasa-blue" />
            <span className="font-medium">From Database</span>
            <span className="text-xs text-muted-foreground text-center w-full break-words">
              Use saved state data from the database
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-6 px-4 gap-2 hover:bg-acasa-blue/5 hover:border-acasa-blue border-gray-200 dark:border-gray-800"
            onClick={() => onSelect("no-input")}
          >
            <Code className="h-10 w-10 text-acasa-blue" />
            <span className="font-medium">No Input</span>
            <span className="text-xs text-muted-foreground text-center w-full break-words">
              Script runs without any input parameters
            </span>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="border-gray-200 dark:border-gray-800">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
