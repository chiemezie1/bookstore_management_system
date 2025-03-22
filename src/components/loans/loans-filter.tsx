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
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Search, SlidersHorizontal, X, CalendarIcon } from 'lucide-react'
import { format, parseISO } from "date-fns"
import { cn, debounce } from "@/lib/utils"

export default function LoansFilter({
  status,
  dueDate,
  search,
  sortBy,
  sortOrder,
}: {
  status: string
  dueDate: string
  search: string
  sortBy: string
  sortOrder: "asc" | "desc"
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [searchValue, setSearchValue] = useState(search)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dueDate ? parseISO(dueDate) : undefined
  )
  const [showFilters, setShowFilters] = useState(false)

  // Update URL with filters
  const updateFilters = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams()

    // Add current params
    if (status) searchParams.set("status", status)
    if (dueDate) searchParams.set("dueDate", dueDate)
    if (search) searchParams.set("search", search)
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

  // Handle filter changes
  const handleStatusChange = (value: string) => {
    updateFilters({ status: value })
  }

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date)
    updateFilters({ dueDate: date ? format(date, "yyyy-MM-dd") : "" })
  }

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-")
    updateFilters({ sort, order })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchValue("")
    setSelectedDate(undefined)
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search borrower or book..."
            className="pl-8"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {(status || dueDate || sortBy !== "created_at" || sortOrder !== "desc") && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2" />
          )}
        </Button>
        {(search || status || dueDate || sortBy !== "created_at" || sortOrder !== "desc") && (
          <Button variant="ghost" onClick={clearFilters} className="md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Loans</SelectItem>
                <SelectItem value="active">Active Loans</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
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

