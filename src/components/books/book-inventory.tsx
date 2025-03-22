"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateInventoryItem } from "@/actions/inventory"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

export default function BookInventory({
  bookId,
  inventory,
}: {
  bookId: string
  inventory: {
    id: string
    quantity: number
    location: string
    status: "available" | "low_stock" | "out_of_stock"
    threshold: number
    last_restock_date: string
  }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [quantity, setQuantity] = useState(inventory.quantity.toString())
  const [notes, setNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateQuantity = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update inventory",
        variant: "destructive",
      })
      return
    }

    const newQuantity = Number.parseInt(quantity, 10)
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity (0 or greater)",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const { data, error } = await updateInventoryItem(user.id, bookId, newQuantity, notes)

      if (error) {
        throw error
      }

      toast({
        title: "Inventory updated",
        description: `Quantity updated to ${newQuantity}`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating inventory:", error)
      toast({
        title: "Error updating inventory",
        description: "An error occurred while updating the inventory",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setNotes("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory Status</CardTitle>
          <CardDescription>Last restocked on {formatDate(inventory.last_restock_date, "MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {inventory.status === "available" ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : inventory.status === "low_stock" ? (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {inventory.status === "available"
                    ? "In Stock"
                    : inventory.status === "low_stock"
                      ? "Low Stock"
                      : "Out of Stock"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {inventory.quantity} {inventory.quantity === 1 ? "copy" : "copies"} available
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{inventory.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Threshold</p>
              <p className="font-medium">{inventory.threshold} copies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Inventory</CardTitle>
          <CardDescription>Adjust the quantity of books in stock</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Quantity</label>
              <Input type="number" min="0" value={inventory.quantity} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Quantity</label>
              <Input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              placeholder="Reason for inventory change..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateQuantity} disabled={isUpdating || quantity === inventory.quantity.toString()}>
            {isUpdating ? "Updating..." : "Update Inventory"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

