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
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { debounce } from "@/lib/utils"

export default function UsersFilter({
  search,
  role,
  sortBy,
  sortOrder,
}: {
  search: string
  role: string
  sortBy: string
  sortOrder: "asc" | "desc"
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [searchValue, setSearchValue] = useState(search)
  const [showFilters, setShowFilters] = useState(false)

  // Update URL with filters
  const updateFilters = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams()

    // Add current params
    if (search) searchParams.set("search", search)
    if (role) searchParams.set("role", role)
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
  const handleRoleChange = (value: string) => {
    updateFilters({ role: value })
  }

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-")
    updateFilters({ sort, order })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchValue("")
    router.push(pathname)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {(role || sortBy !== "first_name" || sortOrder !== "asc") && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2" />
          )}
        </Button>
        {(search || role || sortBy !== "first_name" || sortOrder !== "asc") && (
          <Button variant="ghost" onClick={clearFilters} className="md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
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
                <SelectItem value="first_name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="first_name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

