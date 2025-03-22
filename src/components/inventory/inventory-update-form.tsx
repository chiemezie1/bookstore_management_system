"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateInventoryItem, restockInventoryItem } from "@/actions/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function InventoryUpdateForm({ inventoryItem }: { inventoryItem: any }) {
  const router = useRouter()
  const { toast } = useToast()

  // State for update form
  const [quantity, setQuantity] = useState(inventoryItem.quantity.toString())
  const [location, setLocation] = useState(inventoryItem.location)
  const [threshold, setThreshold] = useState(inventoryItem.threshold.toString())
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // State for restock form
  const [restockQuantity, setRestockQuantity] = useState("0")
  const [isRestocking, setIsRestocking] = useState(false)
  const [restockError, setRestockError] = useState<string | null>(null)

  // Handle update form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setUpdateError(null)

    try {
      const parsedQuantity = Number.parseInt(quantity, 10)
      const parsedThreshold = Number.parseInt(threshold, 10)

      if (isNaN(parsedQuantity) || isNaN(parsedThreshold)) {
        throw new Error("Quantity and threshold must be valid numbers")
      }

      const { data, error } = await updateInventoryItem({
        id: inventoryItem.id,
        quantity: parsedQuantity,
        location,
        threshold: parsedThreshold,
      })

      if (error) throw error

      toast({
        title: "Inventory updated",
        description: "The inventory item has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating inventory:", error)
      setUpdateError(error instanceof Error ? error.message : "Failed to update inventory")
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle restock form submission
  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsRestocking(true)
    setRestockError(null)

    try {
      const parsedQuantity = Number.parseInt(restockQuantity, 10)

      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new Error("Restock quantity must be a positive number")
      }

      const { data, error } = await restockInventoryItem({
        id: inventoryItem.id,
        quantity: parsedQuantity,
      })

      if (error) throw error

      toast({
        title: "Inventory restocked",
        description: `Added ${parsedQuantity} items to inventory.`,
      })

      setRestockQuantity("0")
      router.refresh()
    } catch (error) {
      console.error("Error restocking inventory:", error)
      setRestockError(error instanceof Error ? error.message : "Failed to restock inventory")
    } finally {
      setIsRestocking(false)
    }
  }

  return (
    <Tabs defaultValue="update" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="update">Update Details</TabsTrigger>
        <TabsTrigger value="restock">Restock</TabsTrigger>
      </TabsList>

      <TabsContent value="update" className="space-y-4 py-4">
        {updateError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{updateError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Threshold</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Inventory"}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="restock" className="space-y-4 py-4">
        {restockError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{restockError}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-md bg-muted p-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Current Quantity:</div>
            <div className="text-sm">{inventoryItem.quantity}</div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className="text-sm font-medium">Last Restocked:</div>
            <div className="text-sm">{new Date(inventoryItem.last_restock_date).toLocaleDateString()}</div>
          </div>
        </div>

        <form onSubmit={handleRestock} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restock-quantity">Quantity to Add</Label>
            <Input
              id="restock-quantity"
              type="number"
              min="1"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push("/inventory")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isRestocking}>
              {isRestocking ? "Restocking..." : "Restock Inventory"}
            </Button>
          </div>
        </form>
      </TabsContent>
    </Tabs>
  )
}

