"use client"

import { useEffect, useState } from "react"
import { useModal } from "@/components/ui/modal-provider"
import { InitialSelectionModal } from "@/components/initial-selection-modal"
import { ImportSelectionModal } from "@/components/import-selection-modal"
import { ControlsImportDialog } from "@/components/controls-import-dialog"
import { ScriptImportDialog } from "@/components/script-import-dialog"

interface ImportControlsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: any[], warning?: string) => void
}

export function ImportControlsDialog({ open, onOpenChange, onImport }: ImportControlsDialogProps) {
  const { currentModal, showModal, hideModal } = useModal()
  const [selectedImportType, setSelectedImportType] = useState<"upload" | "user-input" | "database" | "documents" | "no-input">(
    "upload",
  )

  // Effect to show/hide the modal based on the open prop
  useEffect(() => {
    if (open && currentModal === null) {
      showModal("initial")
    } else if (!open && currentModal !== null) {
      hideModal()
    }
  }, [open, currentModal, showModal, hideModal])

  // Handle initial selection
  const handleInitialSelection = (option: "controls" | "scripts") => {
    if (option === "controls") {
      showModal("controls")
    } else {
      showModal("script-selection")
    }
  }

  // Handle script type selection
  const handleScriptTypeSelection = (option: "upload" | "user-input" | "database" | "documents" | "no-input") => {
    setSelectedImportType(option)
    localStorage.setItem("selectedImportType", option)
    showModal("scripts")
  }

  // Handle dialog close
  const handleDialogClose = () => {
    hideModal()
    onOpenChange(false)
  }

  return (
    <>
      {currentModal === "initial" && (
        <InitialSelectionModal onOpenChange={onOpenChange} onSelect={handleInitialSelection} />
      )}

      {currentModal === "script-selection" && (
        <ImportSelectionModal onOpenChange={onOpenChange} onSelect={handleScriptTypeSelection} />
      )}

      {currentModal === "controls" && <ControlsImportDialog onOpenChange={onOpenChange} onImport={onImport} />}

      {currentModal === "scripts" && (
        <ScriptImportDialog onOpenChange={onOpenChange} open={open} selectedImportType={selectedImportType} />
      )}
    </>
  )
}
