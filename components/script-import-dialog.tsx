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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload, FileText, Plus, Settings, ArrowLeft } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Checkbox } from "@/components/ui/checkbox"
import { importScript } from "@/app/actions/import-scripts"
import { fetchPlainControls } from "@/app/actions/plain-controls"
import { useToast } from "@/hooks/use-toast"
import type { ScriptInputParam } from "@/app/types/database"
import { DataItemSelector } from "@/components/data-item-selector"
import { useModal } from "@/components/ui/modal-provider"

interface ScriptImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedImportType: "upload" | "user-input" | "database" | "documents" | "no-input"
}

// Update the ScriptInputFormData interface to include the data type and dataItems
interface ScriptInputFormData {
  key: string
  label: string
  type: "string" | "number" | "boolean" | "select" | "data"
  required: boolean
  default: string | number | boolean
  description: string
  options: string[]
  dataItems?: string[] // IDs of selected data items
}

// Define the Control type
interface Control {
  id: string
  name: string
  description?: string
  // Add other properties as needed
}

export function ScriptImportDialog({ open, onOpenChange, selectedImportType }: ScriptImportDialogProps) {
  // State for scripts tab
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [selectedControlId, setSelectedControlId] = useState<string>("")
  const [scriptName, setScriptName] = useState<string>("")
  const [scriptDescription, setScriptDescription] = useState<string>("")
  const [scriptLanguage, setScriptLanguage] = useState<string>("")
  const [controls, setControls] = useState<Control[]>([])
  const [loadingControls, setLoadingControls] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Script input states
  const [scriptInputs, setScriptInputs] = useState<ScriptInputFormData[]>([])
  const [showInputForm, setShowInputForm] = useState(false)
  const [currentInput, setCurrentInput] = useState<ScriptInputFormData>({
    key: "",
    label: "",
    type: "string",
    required: true,
    default: "",
    description: "",
    options: [],
  })
  const [currentOption, setCurrentOption] = useState<string>("")
  const [editingInputIndex, setEditingInputIndex] = useState<number | null>(null)

  const { toast } = useToast()
  const { goBack, hideModal } = useModal()

  const handleClose = () => {
    hideModal()
    onOpenChange(false)
  }

  // Fetch controls when dialog opens
  useEffect(() => {
    fetchControlsForDropdown()
  }, [])

  const fetchControlsForDropdown = async () => {
    setLoadingControls(true)
    try {
      const result = await fetchPlainControls()
      if (result) {
        setControls(result ?? [])
      } else {
        toast({
          title: "Error",
          description: result || "Failed to fetch controls",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching controls:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching controls",
        variant: "destructive",
      })
    } finally {
      setLoadingControls(false)
    }
  }

  // Dropzone for scripts
  const scriptsDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      setScriptFile(file)

      // Auto-set the script name if not already set
      if (!scriptName) {
        setScriptName(file.name.split(".")[0])
      }

      // Auto-detect language based on file extension
      const extension = file.name.split(".").pop()?.toLowerCase()
      switch (extension) {
        case "py":
          setScriptLanguage("python")
          break
        case "js":
          setScriptLanguage("javascript")
          break
        case "sh":
          setScriptLanguage("bash")
          break
        case "ps1":
          setScriptLanguage("powershell")
          break
        default:
          setScriptLanguage("")
      }
    },
    accept: {
      "text/plain": [".py", ".js", ".sh", ".ps1", ".txt"],
    },
    multiple: false,
  })

  // Update the handleImportScript function to include inputSource
  const handleImportScript = async () => {
    if (!scriptFile) {
      setErrorMessage("Please upload a script file")
      return
    }

    if (!selectedControlId) {
      setErrorMessage("Please select a control")
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", scriptFile)
      formData.append("controlId", selectedControlId)
      formData.append("language", scriptLanguage || "other")
      formData.append("name", scriptName)
      formData.append("description", scriptDescription)

      // Add the inputSource based on the selectedImportType
      let inputSource: "user" | "database" | "documents" | "none" = "none"
      switch (selectedImportType) {
        case "user-input":
          inputSource = "user"
          break
        case "database":
          inputSource = "database"
          break
        case "documents":
          inputSource = "documents"
          break
        case "no-input":
        case "upload":
        default:
          inputSource = "none"
          break
      }

      formData.append("inputSource", inputSource)

      // Transform script inputs to match ScriptInputParam interface
      if (scriptInputs.length > 0) {
        const transformedInputs: ScriptInputParam[] = scriptInputs.map((input, index) => ({
          key: input.key || `param${index + 1}`,
          label: input.label,
          type: input.type,
          required: input.required,
          default: input.default,
          description: input.description || `${input.label} parameter`,
          options: input.type === "select" ? input.options : undefined,
          dataItems: input.type === "data" ? input.dataItems : undefined,
          inputSource: inputSource, // Add inputSource to each input
        }))

        formData.append("inputs", JSON.stringify(transformedInputs))
      }

      const result = await importScript(formData)

      if (result.success) {
        toast({
          title: "Script Imported",
          description: result.message || "Script imported successfully",
        })
        handleClose()
      } else {
        setErrorMessage(result.error || "Failed to import script")
        toast({
          title: "Import Failed",
          description: result.error || "Failed to import script",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error importing script:", error)
      setErrorMessage("An unexpected error occurred")
      toast({
        title: "Import Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const resetInputForm = () => {
    setCurrentInput({
      key: "",
      label: "",
      type: "string",
      required: true,
      default: "",
      description: "",
      options: [],
    })
    setCurrentOption("")
    setEditingInputIndex(null)
  }

  // Update the handleInputChange function to handle dataItems
  const handleInputChange = (field: keyof ScriptInputFormData, value: any) => {
    setCurrentInput((prev) => {
      const updated = { ...prev, [field]: value }

      // Reset default value when type changes
      if (field === "type") {
        switch (value) {
          case "string":
            updated.default = ""
            break
          case "number":
            updated.default = 0
            break
          case "boolean":
            updated.default = false
            break
          case "select":
            updated.default = ""
            updated.options = []
            break
          case "data":
            updated.default = ""
            updated.dataItems = []
            break
        }
      }

      return updated
    })
  }

  const addOption = () => {
    if (!currentOption.trim()) return

    if (currentInput.options.includes(currentOption.trim())) {
      toast({
        title: "Duplicate Option",
        description: "This option already exists",
        variant: "destructive",
      })
      return
    }

    setCurrentInput((prev) => ({
      ...prev,
      options: [...prev.options, currentOption.trim()],
    }))
    setCurrentOption("")
  }

  const removeOption = (index: number) => {
    setCurrentInput((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }

  const validateInput = () => {
    if (!currentInput.label.trim()) {
      toast({
        title: "Input Name Required",
        description: "Please provide a name for the input parameter",
        variant: "destructive",
      })
      return false
    }

    // Check for duplicate names (except when editing the same input)
    const isDuplicate = scriptInputs.some(
      (input, index) => input.label.toLowerCase() === currentInput.label.toLowerCase() && index !== editingInputIndex,
    )

    if (isDuplicate) {
      toast({
        title: "Duplicate Input Name",
        description: "An input with this name already exists",
        variant: "destructive",
      })
      return false
    }

    // For select type, ensure there's at least one option
    if (currentInput.type === "select" && currentInput.options.length === 0) {
      toast({
        title: "Options Required",
        description: "Please add at least one option for the select input",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const addOrUpdateInput = () => {
    if (!validateInput()) return

    if (scriptInputs.length >= 5 && editingInputIndex === null) {
      toast({
        title: "Maximum Inputs Reached",
        description: "You can only add up to 5 input parameters",
        variant: "destructive",
      })
      return
    }

    // Generate a key if not provided
    if (!currentInput.key) {
      currentInput.key = `param${scriptInputs.length + 1}`
    }

    if (editingInputIndex !== null) {
      // Update existing input
      const updatedInputs = [...scriptInputs]
      updatedInputs[editingInputIndex] = { ...currentInput }
      setScriptInputs(updatedInputs)
    } else {
      // Add new input
      setScriptInputs([...scriptInputs, { ...currentInput }])
    }

    // Reset form
    resetInputForm()
    setShowInputForm(false)
  }

  const editInput = (index: number) => {
    setCurrentInput({ ...scriptInputs[index] })
    setEditingInputIndex(index)
    setShowInputForm(true)
  }

  const removeInput = (index: number) => {
    const newInputs = [...scriptInputs]
    newInputs.splice(index, 1)
    setScriptInputs(newInputs)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-950 border-acasa-blue/20">
        <DialogHeader className="flex flex-col space-y-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goBack} className="mr-2 h-8 w-8" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-xl text-acasa-blue">Import Script</DialogTitle>
              <DialogDescription>
                {selectedImportType === "upload" && "Upload a script file."}
                {selectedImportType === "user-input" && "Define input parameters for your script."}
                {selectedImportType === "database" && "Use saved state data from the database."}
                {selectedImportType === "documents" && "Use document files as input."}
                {selectedImportType === "no-input" && "Import a script without input parameters."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Always show control selection */}
          <div className="space-y-2">
            <Label htmlFor="control-select">Select Control</Label>
            <Select value={selectedControlId} onValueChange={setSelectedControlId} disabled={loadingControls}>
              <SelectTrigger id="control-select" className="border-gray-200 dark:border-gray-800">
                <SelectValue placeholder="Select a control" />
              </SelectTrigger>
              <SelectContent>
                {loadingControls ? (
                  <SelectItem value="loading">Loading controls...</SelectItem>
                ) : (
                  controls.map((control) => (
                    <SelectItem key={control.id} value={control.id}>
                      {control.id} {control.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Always show file upload section for all options */}
          <div
            {...scriptsDropzone.getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              scriptsDropzone.isDragActive
                ? "border-acasa-blue bg-acasa-blue/10"
                : "border-gray-300 hover:border-acasa-blue hover:bg-acasa-blue/5 dark:border-gray-700"
            }`}
          >
            <input {...scriptsDropzone.getInputProps()} />
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-center text-muted-foreground">
              Drag and drop a script file here, or click to select a file
            </p>
            <p className="text-xs text-muted-foreground mt-1">Supported file types: .py, .js, .sh, .ps1, .txt</p>
          </div>

          {scriptFile && (
            <div className="flex items-center justify-between p-2 border rounded-md border-gray-200 dark:border-gray-800">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2 text-acasa-blue" />
                <span className="text-sm font-medium">{scriptFile.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setScriptFile(null)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="script-name">Script Name</Label>
            <Input
              id="script-name"
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              placeholder="Enter script name"
              className="border-gray-200 dark:border-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="script-description">Description</Label>
            <Textarea
              id="script-description"
              value={scriptDescription}
              onChange={(e) => setScriptDescription(e.target.value)}
              placeholder="Enter script description"
              rows={3}
              className="border-gray-200 dark:border-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="script-language">Language</Label>
            <Select value={scriptLanguage} onValueChange={setScriptLanguage}>
              <SelectTrigger id="script-language" className="border-gray-200 dark:border-gray-800">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
                <SelectItem value="powershell">PowerShell</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show script inputs section only if "user-input" is selected */}
          {selectedImportType === "user-input" && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label>Script Inputs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetInputForm()
                    setShowInputForm(!showInputForm)
                  }}
                  disabled={scriptInputs.length >= 5 && !showInputForm}
                  className="border-gray-200 dark:border-gray-800"
                >
                  {showInputForm ? (
                    "Cancel"
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Input
                    </>
                  )}
                </Button>
              </div>

              {showInputForm && (
                <div className="space-y-4 p-4 border rounded-md bg-muted/30 border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium">
                    {editingInputIndex !== null ? "Edit Input Parameter" : "Add Input Parameter"}
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor="input-label">Parameter Name</Label>
                    <Input
                      id="input-label"
                      value={currentInput.label}
                      onChange={(e) => handleInputChange("label", e.target.value)}
                      placeholder="Enter parameter name"
                      className="border-gray-200 dark:border-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="input-description">Description</Label>
                    <Input
                      id="input-description"
                      value={currentInput.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter parameter description"
                      className="border-gray-200 dark:border-gray-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="input-type">Parameter Type</Label>
                    <Select
                      value={currentInput.type}
                      onValueChange={(value) =>
                        handleInputChange("type", value as "string" | "number" | "boolean" | "select" | "data")
                      }
                    >
                      <SelectTrigger id="input-type" className="border-gray-200 dark:border-gray-800">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="select">Select (Dropdown)</SelectItem>
                        <SelectItem value="data">Choose from Saved State</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="input-required"
                      checked={currentInput.required}
                      onCheckedChange={(checked) => handleInputChange("required", !!checked)}
                    />
                    <Label htmlFor="input-required" className="text-sm">
                      Required parameter
                    </Label>
                  </div>

                  {/* Default value field based on type */}
                  {currentInput.type !== "data" && (
                    <div className="space-y-2">
                      <Label htmlFor="input-default">Default Value</Label>

                      {currentInput.type === "string" && (
                        <Input
                          id="input-default"
                          value={currentInput.default as string}
                          onChange={(e) => handleInputChange("default", e.target.value)}
                          placeholder="Default value (optional)"
                          className="border-gray-200 dark:border-gray-800"
                        />
                      )}

                      {currentInput.type === "number" && (
                        <Input
                          id="input-default"
                          type="number"
                          value={currentInput.default as number}
                          onChange={(e) => handleInputChange("default", Number(e.target.value))}
                          placeholder="Default value (optional)"
                          className="border-gray-200 dark:border-gray-800"
                        />
                      )}

                      {currentInput.type === "boolean" && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="input-default-checkbox"
                            checked={!!currentInput.default}
                            onCheckedChange={(checked) => handleInputChange("default", !!checked)}
                          />
                          <Label htmlFor="input-default-checkbox" className="text-sm">
                            Default to checked
                          </Label>
                        </div>
                      )}

                      {currentInput.type === "select" && currentInput.options.length > 0 && (
                        <Select
                          value={currentInput.default as string}
                          onValueChange={(value) => handleInputChange("default", value)}
                        >
                          <SelectTrigger id="input-default-select" className="border-gray-200 dark:border-gray-800">
                            <SelectValue placeholder="Select default value" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentInput.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {/* Options for select type */}
                  {currentInput.type === "select" && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={currentOption}
                          onChange={(e) => setCurrentOption(e.target.value)}
                          placeholder="Add an option"
                          className="flex-1 border-gray-200 dark:border-gray-800"
                        />
                        <Button
                          type="button"
                          onClick={addOption}
                          variant="outline"
                          size="sm"
                          className="border-gray-200 dark:border-gray-800"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {currentInput.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {currentInput.options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-background rounded-md border border-gray-200 dark:border-gray-800"
                            >
                              <span>{option}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(index)}
                                className="h-6 w-6"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Data items selector for data type */}
                  {currentInput.type === "data" && (
                    <div className="space-y-2">
                      <Label>Select Data Items (max 5)</Label>
                      <DataItemSelector
                        selectedItems={currentInput.dataItems || []}
                        onChange={(selectedIds) => handleInputChange("dataItems", selectedIds)}
                        maxItems={5}
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button type="button" onClick={addOrUpdateInput} className="bg-acasa-blue hover:bg-acasa-darkBlue">
                      {editingInputIndex !== null ? "Update Input" : "Add Input"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Display defined inputs */}
              {scriptInputs.length > 0 && (
                <div className="border rounded-md p-3 mt-2 border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium mb-2">Defined Inputs ({scriptInputs.length}/5):</p>
                  <div className="space-y-2">
                    {scriptInputs.map((input, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-background border rounded-md hover:bg-muted/20 transition-colors border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-sm">{input.label}</span>
                            {!input.required && (
                              <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-1.5 py-0.5 rounded">
                                Optional
                              </span>
                            )}
                            <span className="text-xs px-1.5 py-0.5 rounded bg-acasa-blue/10 text-acasa-blue">
                              {input.type}
                            </span>
                          </div>
                          {input.description && (
                            <p className="text-xs text-muted-foreground mt-1">{input.description}</p>
                          )}
                          {input.type === "select" && input.options.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1">
                              <span>Options:</span>
                              {input.options.map((option, i) => (
                                <span key={i} className="bg-muted px-1.5 rounded">
                                  {option}
                                </span>
                              ))}
                            </div>
                          )}
                          {input.type === "data" && input.dataItems && input.dataItems.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <span>Selected {input.dataItems.length} data item(s)</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editInput(index)}
                            className="h-8 w-8 rounded-full hover:bg-muted"
                            title="Edit input"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInput(index)}
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            title="Remove input"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Define input parameters that your script will require when executed (up to 5 parameters).
              </p>
            </div>
          )}

          {/* Show database selection section only if "database" is selected */}
          {selectedImportType === "database" && (
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <Label>Select Data Items from Database</Label>
              </div>

              <div className="border rounded-md p-4 border-gray-200 dark:border-gray-800">
                <p className="text-sm mb-4">Select up to 5 data items from the database to use as script inputs:</p>

                <DataItemSelector
                  selectedItems={
                    scriptInputs.length > 0 && scriptInputs[0].type === "data" ? scriptInputs[0].dataItems || [] : []
                  }
                  onChange={(selectedIds) => {
                    if (selectedIds.length > 0) {
                      // Create or update a single data input that contains all selected items
                      const existingDataInput = scriptInputs.findIndex((input) => input.type === "data")

                      if (existingDataInput >= 0) {
                        const updatedInputs = [...scriptInputs]
                        updatedInputs[existingDataInput] = {
                          ...updatedInputs[existingDataInput],
                          dataItems: selectedIds,
                        }
                        setScriptInputs(updatedInputs)
                      } else {
                        setScriptInputs([
                          ...scriptInputs,
                          {
                            key: `param${scriptInputs.length + 1}`,
                            label: "Database Data",
                            type: "data",
                            required: true,
                            default: "",
                            description: "Data selected from the database",
                            options: [],
                            dataItems: selectedIds,
                          },
                        ])
                      }
                    } else {
                      // Remove data input if no items are selected
                      setScriptInputs(scriptInputs.filter((input) => input.type !== "data"))
                    }
                  }}
                  maxItems={5}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Selected data items will be passed to your script as parameters when executed.
              </p>
            </div>
          )}

          {errorMessage && <div className="text-sm text-red-500 mt-2">Error: {errorMessage}</div>}
        </div>

        <DialogFooter className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose} className="border-gray-200 dark:border-gray-800">
            Cancel
          </Button>
          <Button
            onClick={handleImportScript}
            disabled={!scriptFile || !selectedControlId}
            className="bg-acasa-blue hover:bg-acasa-darkBlue"
          >
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
