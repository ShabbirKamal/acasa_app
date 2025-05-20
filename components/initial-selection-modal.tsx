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
import { FileText, Code } from "lucide-react"
import { useModal } from "@/components/ui/modal-provider"

interface InitialSelectionModalProps {
  onOpenChange: (open: boolean) => void
  onSelect: (option: "controls" | "scripts") => void
}

export function InitialSelectionModal({ onOpenChange, onSelect }: InitialSelectionModalProps) {
  const { hideModal } = useModal()

  const handleClose = () => {
    hideModal()
    onOpenChange(false)
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-white dark:bg-gray-950 border-acasa-blue/20">
        <DialogHeader>
          <DialogTitle className="text-xl text-acasa-blue">Import</DialogTitle>
          <DialogDescription>Choose what you want to import.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-6 px-4 gap-2 hover:bg-acasa-blue/5 hover:border-acasa-blue border-gray-200 dark:border-gray-800"
            onClick={() => onSelect("controls")}
          >
            <FileText className="h-10 w-10 text-acasa-blue" />
            <span className="font-medium">Controls</span>
            <span className="text-xs text-muted-foreground text-center w-full break-words">
              Import controls from a CSV file
            </span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-6 px-4 gap-2 hover:bg-acasa-blue/5 hover:border-acasa-blue border-gray-200 dark:border-gray-800"
            onClick={() => onSelect("scripts")}
          >
            <Code className="h-10 w-10 text-acasa-blue" />
            <span className="font-medium">Scripts</span>
            <span className="text-xs text-muted-foreground text-center w-full break-words">
              Import automation scripts
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
