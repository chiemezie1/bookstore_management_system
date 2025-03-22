import Link from "next/link"
import { getTransactions } from "@/actions/transactions"
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
import { ShoppingCart, BookOpen, Package, RotateCcw, ClipboardList } from 'lucide-react'

export default async function TransactionsList({
  type,
  status,
  startDate,
  endDate,
  sortBy,
  sortOrder,
  limit,
  offset,
  page,
}: {
  type: string
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
    data: transactions,
    count,
    error,
  } = await getTransactions({
    type,
    status,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    limit,
    offset,
  })

  if (error) {
    return <div className="text-red-500">Error loading transactions: {error.message}</div>
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No transactions found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or create a new transaction.</p>
        <div className="flex space-x-4 mt-6">
          <Button asChild>
            <Link href="/transactions/new?type=sale">Record Sale</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/transactions/new?type=loan">Record Loan</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / limit)

  const getTransactionIcon = (transactionType: string) => {
    switch (transactionType) {
      case "sale":
        return <ShoppingCart className="h-4 w-4" />
      case "loan":
        return <BookOpen className="h-4 w-4" />
      case "return":
        return <RotateCcw className="h-4 w-4" />
      case "purchase":
        return <Package className="h-4 w-4" />
      default:
        return <ClipboardList className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at, "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{transaction.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.transaction_type === "sale"
                          ? "default"
                          : transaction.transaction_type === "loan"
                            ? "secondary"
                            : transaction.transaction_type === "return"
                              ? "outline"
                              : "destructive"
                      }
                      className="flex items-center space-x-1 w-fit"
                    >
                      {getTransactionIcon(transaction.transaction_type)}
                      <span>
                        {transaction.transaction_type.charAt(0).toUpperCase() +
                          transaction.transaction_type.slice(1)}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {transaction.users.first_name} {transaction.users.last_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "pending"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.transaction_items.length}</TableCell>
                  <TableCell>{formatCurrency(transaction.total_amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/transactions/${transaction.id}`}>View</Link>
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
                  href={`/transactions?type=${type}&status=${status}&startDate=${startDate}&endDate=${endDate}&sort=${sortBy}&order=${sortOrder}&page=${page - 1}`}
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
                      href={`/transactions?type=${type}&status=${status}&startDate=${startDate}&endDate=${endDate}&sort=${sortBy}&order=${sortOrder}&page=${pageNum}`}
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
                  href={`/transactions?type=${type}&status=${status}&startDate=${startDate}&endDate=${endDate}&sort=${sortBy}&order=${sortOrder}&page=${page + 1}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

