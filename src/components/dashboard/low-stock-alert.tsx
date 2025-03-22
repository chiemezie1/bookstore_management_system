import { getLowStockItems } from "@/actions/inventory"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function LowStockAlert() {
  const { data: lowStockItems, error } = await getLowStockItems()

  if (error) {
    return <div className="text-red-500">Error loading low stock items</div>
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
        <div className="text-green-500 mb-2">All items are well-stocked</div>
        <div className="text-sm">No low stock alerts at this time</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {lowStockItems.slice(0, 5).map((item) => (
        <div key={item.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href={`/books/${item.book_id}`} className="font-medium text-sm hover:underline">
              {item.books.title}
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">ISBN: {item.books.isbn}</span>
            </div>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
            <span className="font-medium text-amber-500">{item.quantity} left</span>
          </div>
        </div>
      ))}
    </div>
  )
}

