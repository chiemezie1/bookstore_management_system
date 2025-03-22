import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import SalesList from "@/components/sales/sales-list"
import SalesFilter from "@/components/sales/sales-filter"
import SalesSummary from "@/components/sales/sales-summary"
import { Skeleton } from "@/components/ui/skeleton"

export default function SalesPage({
  searchParams,
}: {
  searchParams: {
    period?: string
    search?: string
    status?: string
    startDate?: string
    endDate?: string
    sort?: string
    order?: "asc" | "desc"
    page?: string
  }
}) {
  // Parse search params
  const period = searchParams.period || "all"
  const search = searchParams.search || ""
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
        <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
        <Button asChild>
          <Link href="/transactions/new?type=sale">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Sale
          </Link>
        </Button>
      </div>

      <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
        <SalesSummary period={period} startDate={startDate} endDate={endDate} />
      </Suspense>

      <div className="space-y-4">
        <SalesFilter 
          period={period}
          search={search}
          status={status}
          startDate={startDate}
          endDate={endDate}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <Suspense
          key={`sales-${period}-${search}-${status}-${startDate}-${endDate}-${sortBy}-${sortOrder}-${page}`}
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
          <SalesList
            search={search}
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

