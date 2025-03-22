import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, ClipboardList } from 'lucide-react'
import { supabase } from "@/lib/supabase"

// Function to fetch sales data
async function getSales({
  search,
  status,
  startDate,
  endDate,
  sortBy,
  sortOrder,
  limit,
  offset,
}: {
  search: string
  status: string
  startDate: string
  endDate: string
  sortBy: string
  sortOrder: "asc" | "desc"
  limit: number
  offset: number
}) {
  try {
    let query = supabase
      .from("transactions")
      .select(
        `
        id,
        user_id,
        status,
        total_amount,
        payment_method,
        created_at,
        users:user_id (
          id,
          email,
          first_name,
          last_name
        ),
        transaction_items (
          id,
          book_id,
          quantity,
          price,
          books:book_id (
            id,
            title
          )
        )
      `,
        { count: "exact" }
      )
      .eq("transaction_type", "sale")

    // Apply status filter
    if (status) {
      query = query.eq("status", status)
    }

    // Apply date filters
    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00`)
    }
    if (endDate) {
      query = query.lte("created_at", `${endDate}T23:59:59`)
    }

    // Apply search filter
    if (search) {
      query = query.or(
        `users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%,transaction_items.books.title.ilike.%${search}%`
      )
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error
    return { data, count, error: null }
  } catch (error) {
    console.error("Error fetching sales:", error)
    return { data: null, count: 0, error }
  }
}

export default async function SalesList({
  search,
  status,
  startDate,
  endDate,
  sortBy,
  sortOrder,
  limit,
  offset,
  page,
}: {
  search: string
  status: string
  startDate: string
  endDate: string
  sortBy: string
  sortOrder: "asc" | "desc"
  limit: number
  offset: number
  page: number
}) {
  const {
    data: sales,
    count,
    error,
  } = await getSales({
    search,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    limit,
    offset,
  })

  if (error) {
    return <div className="text-red-500">Error loading sales: {error.message}</div>
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No sales found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or create a new sale.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/transactions/new?type=sale">Record Sale</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{formatDate(sale.created_at, "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.users.first_name} {sale.users.last_name}</div>
                      <div className="text-sm text-muted-foreground">{sale.users.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sale.transaction_items.length} {sale.transaction_items.length === 1 ? "item" : "items"}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(sale.total_amount)}</TableCell>
                  <TableCell>{sale.payment_method || "Not specified"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sale.status === "completed"
                          ? "default"
                          : sale.status === "pending"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/transactions/${sale.id}`}>View</Link>
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
                  href={`/sales?search=${search}&status=${status}&startDate=${startDate}&endDate=${endDate}&sort=${sortBy}&order=${sortOrder}&page=${page - 1}`}
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
                      href={`/sales?search=${search}&status=${status}&startDate=${startDate}&endDate=${endDate}&sort=${sortBy}&order=${sortOrder}&page=${pageNum}`}
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
                  href={`/sales?search=${search}&status=${status}&startDate=${startDate}&endDate=${endDate}&sort=${sortBy}&order=${sortOrder}&page=${page + 1}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

