import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"

export default function InventoryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold">Inventory Item Not Found</h2>
      <p className="text-muted-foreground mt-2 mb-6">
        The inventory item you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/inventory">Back to Inventory</Link>
      </Button>
    </div>
  )
}

