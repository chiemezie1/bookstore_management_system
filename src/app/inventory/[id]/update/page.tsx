import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { InventoryUpdateForm } from "@/components/inventory/inventory-update-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getInventoryItem(id: string) {
  const { data, error } = await supabase
    .from("inventory")
    .select(`
      *,
      books (
        id,
        title,
        isbn,
        author_id,
        publisher,
        price
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching inventory item:", error)
    return null
  }

  return data
}

export default async function InventoryUpdatePage({
  params,
}: {
  params: { id: string }
}) {
  const inventoryItem = await getInventoryItem(params.id)

  if (!inventoryItem) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Update Inventory</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{inventoryItem.books.title}</CardTitle>
          <CardDescription>ISBN: {inventoryItem.books.isbn}</CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryUpdateForm inventoryItem={inventoryItem} />
        </CardContent>
      </Card>
    </div>
  )
}

