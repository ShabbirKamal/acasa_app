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
import { Loader2, Database, ArrowUpDown, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchDataItems } from "@/app/actions/data"
import { executeScriptWithInputs } from "../app/actions/script-execution"
import type { ScriptInputParam, DataItem } from "../app/types/database"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface DatabaseInputModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scriptId: string
  scriptName: string
  controlId: string
  inputParams: ScriptInputParam[]
  onExecutionComplete: (result: any) => void
}

export function DatabaseInputModal({
  open,
  onOpenChange,
  scriptId,
  scriptName,
  controlId,
  inputParams,
  onExecutionComplete,
}: DatabaseInputModalProps) {
  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [selectedItems, setSelectedItems] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch data items when modal opens
  useEffect(() => {
    if (open) {
      loadDataItems()
    }
  }, [open])

  // Initialize selected items from input params
  useEffect(() => {
    if (open && inputParams.length > 0) {
      const dataItemIds = inputParams.filter((param) => param.type === "data").flatMap((param) => param.dataItems || [])

      if (dataItemIds.length > 0 && dataItems.length > 0) {
        const selected = dataItems.filter((item) => dataItemIds.includes(item._id))
        setSelectedItems(selected)
      }
    }
  }, [open, inputParams, dataItems])

  const loadDataItems = async () => {
    setLoading(true)
    try {
      const result = await fetchDataItems()
      if (result.success) {
        setDataItems(result.data || [])
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch data items",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading data items:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching data items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Convert selected items to input format
      const inputs: Record<string, any> = {}

      // Add each selected item as a separate input parameter
      selectedItems.forEach((item, index) => {
        const key = `param${index + 1}`
        inputs[key] = item.value
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

    const items = Array.from(selectedItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSelectedItems(items)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Database Inputs: {scriptName}</DialogTitle>
          <DialogDescription>
            Select and arrange data items from the database to use as inputs for this script.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Selected Data Items</Label>
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {selectedItems.length} items selected
              </Badge>
            </div>

            {loading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedItems.length === 0 ? (
              <div className="text-center p-4 border rounded-md text-muted-foreground">
                No data items selected. Select items from the list below.
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="selected-items">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 border rounded-md p-2"
                    >
                      {selectedItems.map((item, index) => (
                        <Draggable key={item._id} draggableId={item._id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center p-2 border rounded-md bg-muted/20"
                            >
                              <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{item.header}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.datatype}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {typeof item.value === "boolean"
                                    ? item.value
                                      ? "True"
                                      : "False"
                                    : String(item.value)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedItems(selectedItems.filter((_, i) => i !== index))
                                }}
                                className="ml-2"
                              >
                                Remove
                              </Button>
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

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Available Data Items</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const availableItems = dataItems.filter(
                    (item) => !selectedItems.some((selected) => selected._id === item._id),
                  )
                  if (availableItems.length > 0) {
                    setSelectedItems([...selectedItems, availableItems[0]])
                  }
                }}
                disabled={
                  dataItems.filter((item) => !selectedItems.some((selected) => selected._id === item._id)).length === 0
                }
              >
                Add Item
              </Button>
            </div>

            <ScrollArea className="h-[200px] border rounded-md p-2">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : dataItems.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">No data items available</div>
              ) : (
                <div className="space-y-2">
                  {dataItems
                    .filter((item) => !selectedItems.some((selected) => selected._id === item._id))
                    .map((item) => (
                      <Card
                        key={item._id}
                        className="p-2 hover:bg-muted/20 cursor-pointer"
                        onClick={() => {
                          setSelectedItems([...selectedItems, item])
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.header}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.datatype}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {typeof item.value === "boolean" ? (item.value ? "True" : "False") : String(item.value)}
                        </p>
                      </Card>
                    ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <ArrowUpDown className="h-4 w-4 inline mr-1" />
              Drag and drop items to change their order. The order determines how they will be passed to the script.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedItems.length === 0}
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
