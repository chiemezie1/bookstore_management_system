"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { SlidersHorizontal, X, CalendarIcon } from 'lucide-react'
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

export default function TransactionsFilter({
  type,
  status,
  startDate,
  endDate,
  sortBy,
  sortOrder,
}: {
  type: string
  status: string
  startDate: string
  endDate: string
  sortBy: string
  sortOrder: "asc" | "desc"
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: startDate ? parseISO(startDate) : undefined,
    to: endDate ? parseISO(endDate) : undefined,
  })

  // Update URL with filters
  const updateFilters = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams()

    // Add current params
    if (type) searchParams.set("type", type)
    if (status) searchParams.set("status", status)
    if (startDate) searchParams.set("startDate", startDate)
    if (endDate) searchParams.set("endDate", endDate)
    if (sortBy) searchParams.set("sort", sortBy)
    if (sortOrder) searchParams.set("order", sortOrder)

    // Update with new params
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value)
      } else {
        searchParams.delete(key)
      }
    })

    router.push(`${pathname}?${searchParams.toString()}`)
  }

  // Handle filter changes
  const handleTypeChange = (value: string) => {
    updateFilters({ type: value })
  }

  const handleStatusChange = (value: string) => {
    updateFilters({ status: value })
  }

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-")
    updateFilters({ sort, order })
  }

  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    
    // Update URL with date range
    const params: Record<string, string> = {}
    if (range.from) {
      params.startDate = format(range.from, "yyyy-MM-dd")
    } else {
      params.startDate = ""
    }
    
    if (range.to) {
      params.endDate = format(range.to, "yyyy-MM-dd")
    } else {
      params.endDate = ""
    }
    
    updateFilters(params)
  }

  // Clear all filters
  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined })
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {(type || status || startDate || endDate || sortBy !== "created_at" || sortOrder !== "desc") && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2" />
          )}
        </Button>
        
        {(type || status || startDate || endDate || sortBy !== "created_at" || sortOrder !== "desc") && (
          <Button variant="ghost" onClick={clearFilters} className="md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Type</label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="loan">Loans</SelectItem>
                <SelectItem value="return">Returns</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="total_amount-desc">Amount (High to Low)</SelectItem>
                <SelectItem value="total_amount-asc">Amount (Low to High)</SelectItem>
                <SelectItem value="due_date-asc">Due Date (Earliest)</SelectItem>
                <SelectItem value="due_date-desc">Due Date (Latest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

