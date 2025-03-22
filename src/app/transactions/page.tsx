import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import TransactionsList from "@/components/transactions/transactions-list"
import TransactionsFilter from "@/components/transactions/transactions-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    search?: string
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    sort?: string
    order?: "asc" | "desc"
    page?: string
  }
}) {
  // Parse search params
  const search = searchParams.search || ""
  const type = searchParams.type || ""
  const status = searchParams.status || ""
  const startDate = searchParams.startDate || ""
  const endDate = searchParams.endDate || ""
  const sortBy = searchParams.sort || "created_at"
  const sortOrder = searchParams.order || "desc"
  const page = Number.parseInt(searchParams.page || "1", 10)
  const limit = 10
  const offset = (page - 1) * limit

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/transactions/new?type=sale">Record Sale</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/transactions/new?type=loan">Record Loan</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/transactions/new?type=return">Record Return</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/transactions/new?type=purchase">Record Purchase</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        <TransactionsFilter 
          type={type}
          status={status}
          startDate={startDate}
          endDate={endDate}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <Suspense
          key={`transactions-${type}-${status}-${startDate}-${endDate}-${sortBy}-${sortOrder}-${page}`}
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <TransactionsList
            type={type}
            status={status}
            startDate={startDate}
            endDate={endDate}
            sortBy={sortBy}
            sortOrder={sortOrder}
            limit={limit}
            offset={offset}
            page={page}
          />
        </Suspense>
      </div>
    </div>
  )
}

