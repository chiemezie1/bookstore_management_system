"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tabs,
  TabsContent,
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Search, SlidersHorizontal, X, CalendarIcon } from 'lucide-react'
import { format, parseISO, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { cn, debounce } from "@/lib/utils"

export default function SalesFilter({
  period,
  search,
  status,
  startDate,
  endDate,
  sortBy,
  sortOrder,
}: {
  period: string
  search: string
  status: string
  startDate: string
  endDate: string
  sortBy: string
  sortOrder: "asc" | "desc"
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [searchValue, setSearchValue] = useState(search)
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: startDate ? parseISO(startDate) : undefined,
    to: endDate ? parseISO(endDate) : undefined,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Update URL with filters
  const updateFilters = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams()

    // Add current params
    if (period) searchParams.set("period", period)
    if (search) searchParams.set("search", search)
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

  // Debounced search
  const debouncedSearch = debounce((value: string) => {
    updateFilters({ search: value })
  }, 500)

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchValue(value)
    debouncedSearch(value)
  }

  // Handle period change
  const handlePeriodChange = (value: string) => {
    const today = new Date()
    let newStartDate: Date | undefined
    let newEndDate: Date | undefined

    switch (value) {
      case "today":
        newStartDate = today
        newEndDate = today
        break
      case "yesterday":
        newStartDate = subDays(today, 1)
        newEndDate = subDays(today, 1)
        break
      case "this_week":
        newStartDate = startOfWeek(today, { weekStartsOn: 1 })
        newEndDate = endOfWeek(today, { weekStartsOn: 1 })
        break
      case "this_month":
        newStartDate = startOfMonth(today)
        newEndDate = endOfMonth(today)
        break
      case "this_year":
        newStartDate = startOfYear(today)
        newEndDate = endOfYear(today)
        break
      case "last_7_days":
        newStartDate = subDays(today, 7)
        newEndDate = today
        break
      case "last_30_days":
        newStartDate = subDays(today, 30)
        newEndDate = today
        break
      case "custom":
        // Keep existing date range
        newStartDate = dateRange.from
        newEndDate = dateRange.to
        break
      default:
        // "all" or any other value
        newStartDate = undefined
        newEndDate = undefined
        break
    }

    setDateRange({
      from: newStartDate,
      to: newEndDate,
    })

    updateFilters({
      period: value,
      startDate: newStartDate ? format(newStartDate, "yyyy-MM-dd") : "",
      endDate: newEndDate ? format(newEndDate, "yyyy-MM-dd") : "",
    })
  }

  // Handle date range change
  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    
    // Only update if we're in custom period mode
    if (period === "custom") {
      updateFilters({
        startDate: range.from ? format(range.from, "yyyy-MM-dd") : "",
        endDate: range.to ? format(range.to, "yyyy-MM-dd") : "",
      })
    }
  }

  // Handle status change
  const handleStatusChange = (value: string) => {
    updateFilters({ status: value })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-")
    updateFilters({ sort, order })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchValue("")
    setDateRange({ from: undefined, to: undefined })
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue={period} onValueChange={handlePeriodChange}>
        <TabsList className="mb-2">
          <TabsTrigger value="all">All Time</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="this_week">This Week</TabsTrigger>
          <TabsTrigger value="this_month">This Month</TabsTrigger>
          <TabsTrigger value="last_30_days">Last 30 Days</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
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
        </TabsContent>
      </Tabs>

      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customer or product..."
            className="pl-8"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {(status || sortBy !== "created_at" || sortOrder !== "desc") && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2" />
          )}
        </Button>
        {(search || status || sortBy !== "created_at" || sortOrder !== "desc") && (
          <Button variant="ghost" onClick={clearFilters} className="md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

