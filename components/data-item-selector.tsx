"use client"

import { useState, useEffect } from "react"
import { fetchDataItems } from "@/app/actions/data"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import type { DataItem } from "@/app/types/database"
import { Badge } from "@/components/ui/badge"

interface DataItemSelectorProps {
  selectedItems: string[]
  onChange: (selectedIds: string[]) => void
  maxItems?: number
}

export function DataItemSelector({ selectedItems, onChange, maxItems = 5 }: DataItemSelectorProps) {
  const [dataItems, setDataItems] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadDataItems() {
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

    loadDataItems()
  }, [toast])

  const handleItemChange = (id: string, checked: boolean) => {
    if (checked) {
      if (selectedItems.length >= maxItems) {
        toast({
          title: "Maximum Items Reached",
          description: `You can only select up to ${maxItems} data items`,
          variant: "destructive",
        })
        return
      }
      onChange([...selectedItems, id])
    } else {
      onChange(selectedItems.filter((itemId) => itemId !== id))
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading data items...</div>
  }

  if (dataItems.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">No data items found</div>
  }

  return (
    <ScrollArea className="h-[200px] border rounded-md p-2">
      <div className="space-y-2">
        {dataItems.map((item) => (
          <div key={item._id} className="flex items-start space-x-2 p-2 hover:bg-muted/20 rounded-md">
            <Checkbox
              id={`data-item-${item._id}`}
              checked={selectedItems.includes(item._id)}
              onCheckedChange={(checked) => handleItemChange(item._id, !!checked)}
            />
            <div className="grid gap-1.5">
              <div className="flex items-center gap-2">
                <Label htmlFor={`data-item-${item._id}`} className="font-medium">
                  {item.header}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {item.datatype}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {typeof item.value === "boolean" ? (item.value ? "True" : "False") : String(item.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
