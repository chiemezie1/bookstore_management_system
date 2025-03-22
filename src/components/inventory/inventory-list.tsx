import Link from "next/link"
import { getInventory } from "@/actions/inventory"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, XCircle, Package } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function InventoryList({
  search,
  status,
  sortBy,
  sortOrder,
  limit,
  offset,
  page,
}: {
  search: string
  status: string
  sortBy: string
  sortOrder: "asc" | "desc"
  limit: number
  offset: number
  page: number
}) {
  const {
    data: inventory,
    count,
    error,
  } = await getInventory({
    search,
    status,
    sortBy,
    sortOrder,
    limit,
    offset,
  })

  if (error) {
    return <div className="text-red-500">Error loading inventory: {error.message}</div>
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No inventory items found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link href={`/books/${item.book_id}`} className="hover:underline">
                      {item.books.title}
                    </Link>
                  </TableCell>
                  <TableCell>{item.books.isbn}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {item.status === "available" ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : item.status === "low_stock" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <Badge
                        variant={
                          item.status === "available"
                            ? "default"
                            : item.status === "low_stock"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {item.status === "available"
                          ? "In Stock"
                          : item.status === "low_stock"
                            ? "Low Stock"
                            : "Out of Stock"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(item.last_restock_date, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/inventory/${item.id}/update`}>Update</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`/inventory?search=${search}&status=${status}&sort=${sortBy}&order=${sortOrder}&page=${page - 1}`}
                />
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum = page
              if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={`/inventory?search=${search}&status=${status}&sort=${sortBy}&order=${sortOrder}&page=${pageNum}`}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              return null
            })}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href={`/inventory?search=${search}&status=${status}&sort=${sortBy}&order=${sortOrder}&page=${page + 1}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

