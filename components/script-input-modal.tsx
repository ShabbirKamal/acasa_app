"use client"

import type React from "react"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { executeScriptWithInputs } from "../app/actions/script-execution"
import type { ScriptInputParam } from "../app/types/database"

interface ScriptInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scriptId: string
  scriptName: string
  controlId: string
  inputParams: ScriptInputParam[]
  onExecutionComplete: (result: any) => void
}

export function ScriptInputModal({
  open,
  onOpenChange,
  scriptId,
  scriptName,
  controlId,
  inputParams,
  onExecutionComplete,
}: ScriptInputModalProps) {
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Initialize inputs with default values
  useEffect(() => {
    if (open && inputParams) {
      const defaultInputs: Record<string, any> = {}
      inputParams.forEach((param) => {
        if (param.default !== undefined) {
          defaultInputs[param.key] = param.default
        }
      })
      setInputs(defaultInputs)
    }
  }, [open, inputParams])

  const handleInputChange = (key: string, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required inputs
      const missingInputs = inputParams
        .filter((param) => param.required && (inputs[param.key] === undefined || inputs[param.key] === ""))
        .map((param) => param.label)

      if (missingInputs.length > 0) {
        toast({
          title: "Missing required inputs",
          description: `Please provide values for: ${missingInputs.join(", ")}`,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-acasa-blue" />
            User Inputs: {scriptName}
          </DialogTitle>
          <DialogDescription>Please provide the required inputs for this script to run properly.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {inputParams.map((param) => (
            <div key={param.key} className="space-y-2">
              <Label htmlFor={param.key}>
                {param.label}
                {param.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {param.type === "string" && (
                <Input
                  id={param.key}
                  value={inputs[param.key] || ""}
                  onChange={(e) => handleInputChange(param.key, e.target.value)}
                  placeholder={param.description}
                  required={param.required}
                />
              )}

              {param.type === "number" && (
                <Input
                  id={param.key}
                  type="number"
                  value={inputs[param.key] || ""}
                  onChange={(e) => handleInputChange(param.key, Number.parseFloat(e.target.value))}
                  placeholder={param.description}
                  required={param.required}
                />
              )}

              {param.type === "boolean" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={param.key}
                    checked={!!inputs[param.key]}
                    onCheckedChange={(checked) => handleInputChange(param.key, !!checked)}
                  />
                  <label
                    htmlFor={param.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {param.description || "Enable this option"}
                  </label>
                </div>
              )}

              {param.type === "select" && param.options && (
                <Select value={inputs[param.key] || ""} onValueChange={(value) => handleInputChange(param.key, value)}>
                  <SelectTrigger id={param.key}>
                    <SelectValue placeholder={param.description || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {param.description && param.type !== "boolean" && (
                <p className="text-xs text-muted-foreground">{param.description}</p>
              )}
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-acasa-blue hover:bg-acasa-darkBlue">
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
        </form>
      </DialogContent>
    </Dialog>
  )
}
