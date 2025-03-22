import { getTransactions } from "@/actions/transactions"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function RecentTransactions() {
  const { data: transactions, error } = await getTransactions({
    limit: 5,
    sortBy: "created_at",
    sortOrder: "desc",
  })

  if (error) {
    return <div className="text-red-500">Error loading recent transactions</div>
  }

  if (!transactions || transactions.length === 0) {
    return <div className="text-muted-foreground">No recent transactions found</div>
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href={`/transactions/${transaction.id}`} className="font-medium text-sm hover:underline">
              {transaction.users.first_name} {transaction.users.last_name}
            </Link>
            <div className="flex items-center gap-2">
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
              >
                {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">{formatDate(transaction.created_at, "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="font-medium">{formatCurrency(transaction.total_amount)}</div>
        </div>
      ))}
    </div>
  )
}

