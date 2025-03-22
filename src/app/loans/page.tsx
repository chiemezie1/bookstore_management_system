import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import LoansList from "@/components/loans/loans-list"
import LoansFilter from "@/components/loans/loans-filter"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoansPage({
  searchParams,
}: {
  searchParams: {
    status?: string
    dueDate?: string
    search?: string
    sort?: string
    order?: "asc" | "desc"
    page?: string
  }
}) {
  // Parse search params
  const status = searchParams.status || ""
  const dueDate = searchParams.dueDate || ""
  const search = searchParams.search || ""
  const sortBy = searchParams.sort || "created_at"
  const sortOrder = searchParams.order || "desc"
  const page = Number.parseInt(searchParams.page || "1", 10)
  const limit = 10
  const offset = (page - 1) * limit

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Book Loans</h2>
        <Button asChild>
          <Link href="/transactions/new?type=loan">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Loan
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <LoansFilter 
          status={status}
          dueDate={dueDate}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <Suspense
          key={`loans-${status}-${dueDate}-${search}-${sortBy}-${sortOrder}-${page}`}
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
          <LoansList
            status={status}
            dueDate={dueDate}
            search={search}
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

