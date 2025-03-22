import Link from "next/link"
import { formatDate } from "@/lib/utils"
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
import { BookOpen, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase } from "@/lib/supabase"

// Function to fetch loans (filtered transactions of type "loan")
async function getLoans({
  status,
  dueDate,
  search,
  sortBy,
  sortOrder,
  limit,
  offset,
}: {
  status: string
  dueDate: string
  search: string
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
        transaction_type,
        status,
        total_amount,
        due_date,
        created_at,
        updated_at,
        notes,
        users:user_id (
          id,
          email,
          first_name,
          last_name,
          phone
        ),
        transaction_items (
          id,
          book_id,
          quantity,
          price,
          books:book_id (
            id,
            title,
            isbn,
            authors:author_id (
              id,
              name
            )
          )
        )
      `,
        { count: "exact" }
      )
      .eq("transaction_type", "loan")

    // Filter by status
    if (status === "active") {
      query = query.eq("status", "completed").is("due_date", null)
    } else if (status === "overdue") {
      const today = new Date().toISOString().split("T")[0]
      query = query.eq("status", "completed").lt("due_date", today)
    } else if (status === "returned") {
      // For returned loans, we need to find loans that have a corresponding return transaction
      // This is a simplification - in a real app you would probably have a more sophisticated way
      // to mark loans as returned, possibly with a status field
      query = query.eq("status", "completed").not("due_date", "is", null)
    }

    // Filter by due date
    if (dueDate) {
      query = query.eq("due_date", dueDate)
    }

    // Apply search filter (on user name or book title)
    if (search) {
      // This is a simplification - in a real app you would need a more sophisticated search
      query = query.or(
        `users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%,transaction_items.books.title.ilike.%${search}%`
      )
    }

    // Apply sorting
    if (sortBy === "due_date") {
      query = query.order(sortBy, { ascending: sortOrder === "asc", nullsFirst: false })
    } else {
      query = query.order(sortBy, { ascending: sortOrder === "asc" })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error
    return { data, count, error: null }
  } catch (error) {
    console.error("Error fetching loans:", error)
    return { data: null, count: 0, error }
  }
}

export default async function LoansList({
  status,
  dueDate,
  search,
  sortBy,
  sortOrder,
  limit,
  offset,
  page,
}: {
  status: string
  dueDate: string
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
  limit: number
  offset: number
  page: number
}) {
  const {
    data: loans,
    count,
    error,
  } = await getLoans({
    status,
    dueDate,
    search,
    sortBy,
    sortOrder,
    limit,
    offset,
  })

  if (error) {
    return <div className="text-red-500">Error loading loans: {error.message}</div>
  }

  if (!loans || loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No loans found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or create a new loan.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/transactions/new?type=loan">New Loan</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / limit)

  // Function to determine if a loan is overdue
  const isOverdue = (loan: any) => {
    if (!loan.due_date) return false
    const today = new Date()
    const dueDate = new Date(loan.due_date)
    return today > dueDate
  }

  // Function to get status badge for a loan
  const getLoanStatus = (loan: any) => {
    if (loan.status !== "completed") {
      return { label: "Pending", variant: "outline" as const, icon: <ClipboardList className="h-4 w-4 mr-1" /> }
    }
    
    if (isOverdue(loan)) {
      return { label: "Overdue", variant: "destructive" as const, icon: <AlertTriangle className="h-4 w-4 mr-1" /> }
    }
    
    if (!loan.due_date) {
      return { label: "Active", variant: "default" as const, icon: <BookOpen className="h-4 w-4 mr-1" /> }
    }
    
    return { label: "Returned", variant: "secondary" as const, icon: <CheckCircle className="h-4 w-4 mr-1" /> }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Borrower</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Loan Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((loan) => {
                const loanStatus = getLoanStatus(loan)
                const bookItem = loan.transaction_items[0] // Assuming first item is the main book
                
                return (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{loan.users.first_name} {loan.users.last_name}</div>
                        <div className="text-sm text-muted-foreground">{loan.users.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {bookItem ? (
                        <div>
                          <Link href={`/books/${bookItem.book_id}`} className="font-medium hover:underline">
                            {bookItem.books.title}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            by {bookItem.books.authors.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No book details</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(loan.created_at, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {loan.due_date ? formatDate(loan.due_date, "MMM d, yyyy") : "Not returned yet"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={loanStatus.variant} className="flex items-center w-fit">
                        {loanStatus.icon}
                        {loanStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/transactions/${loan.id}`}>View</Link>
                        </Button>
                        {loanStatus.label === "Active" && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/transactions/new?type=return&loan=${loan.id}`}>Return</Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
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
                  href={`/loans?status=${status}&dueDate=${dueDate}&search=${search}&sort=${sortBy}&order=${sortOrder}&page=${page - 1}`}
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
                      href={`/loans?status=${status}&dueDate=${dueDate}&search=${search}&sort=${sortBy}&order=${sortOrder}&page=${pageNum}`}
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
                  href={`/loans?status=${status}&dueDate=${dueDate}&search=${search}&sort=${sortBy}&order=${sortOrder}&page=${page + 1}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

