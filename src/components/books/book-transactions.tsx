import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

async function getBookTransactions(bookId: string) {
  try {
    const { data, error } = await supabase
      .from("transaction_items")
      .select(`
        id,
        quantity,
        price,
        transactions:transaction_id (
          id,
          transaction_type,
          status,
          created_at,
          users:user_id (
            id,
            first_name,
            last_name
          )
        )
      `)
      .eq("book_id", bookId)
      .order("created_at", { foreignTable: "transactions", ascending: false })
      .limit(10)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error(`Error fetching transactions for book ${bookId}:`, error)
    return { data: null, error }
  }
}

export default async function BookTransactions({
  bookId,
}: {
  bookId: string
}) {
  const { data: transactions, error } = await getBookTransactions(bookId)

  if (error) {
    return <div className="text-red-500">Error loading transactions</div>
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found for this book</p>
        <div className="mt-4 flex justify-center space-x-4">
          <Button asChild>
            <Link href={`/transactions/new?type=sale&book=${bookId}`}>Record Sale</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/transactions/new?type=loan&book=${bookId}`}>Record Loan</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{formatDate(transaction.transactions.created_at, "MMM d, yyyy")}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.transactions.transaction_type === "sale"
                      ? "default"
                      : transaction.transactions.transaction_type === "loan"
                        ? "secondary"
                        : transaction.transactions.transaction_type === "return"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {transaction.transactions.transaction_type.charAt(0).toUpperCase() +
                    transaction.transactions.transaction_type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {transaction.transactions.users.first_name} {transaction.transactions.users.last_name}
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{formatCurrency(transaction.price)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.transactions.status === "completed"
                      ? "default"
                      : transaction.transactions.status === "pending"
                        ? "outline"
                        : "destructive"
                  }
                >
                  {transaction.transactions.status.charAt(0).toUpperCase() + transaction.transactions.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(transaction.quantity * transaction.price)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/transactions/${transaction.transactions.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href={`/transactions?book=${bookId}`}>View All Transactions</Link>
        </Button>
      </div>
    </div>
  )
}

