import { redirect } from "next/navigation"
import TransactionForm from "@/components/transactions/transaction-form"

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: { type?: string; book?: string }
}) {
  const validTypes = ["sale", "loan", "return", "purchase"]
  const { type = "sale", book } = searchParams

  if (!validTypes.includes(type)) {
    redirect("/transactions/new?type=sale")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          New {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
      </div>

      <TransactionForm type={type as "sale" | "loan" | "return" | "purchase"} bookId={book} />
    </div>
  )
}