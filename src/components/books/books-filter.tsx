"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { debounce } from "@/lib/utils"

export default function BooksFilter({
  search,
  categoryId,
  authorId,
  sortBy,
  sortOrder,
}: {
  search: string
  categoryId: string
  authorId: string
  sortBy: string
  sortOrder: "asc" | "desc"
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [searchValue, setSearchValue] = useState(search)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch categories and authors
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("id, name").order("name")

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Fetch authors
      const { data: authorsData } = await supabase.from("authors").select("id, name").order("name")

      if (authorsData) {
        setAuthors(authorsData)
      }
    }

    fetchFilterOptions()
  }, [])

  // Update URL with filters
  const updateFilters = (params: Record<string, string>) => {
    const searchParams = new URLSearchParams()

    // Add current params
    if (search) searchParams.set("search", search)
    if (categoryId) searchParams.set("category", categoryId)
    if (authorId) searchParams.set("author", authorId)
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
  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value })
  }

  const handleAuthorChange = (value: string) => {
    updateFilters({ author: value })
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
            placeholder="Search books..."
            className="pl-8"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:w-auto">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {(categoryId || authorId || sortBy !== "title" || sortOrder !== "asc") && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2" />
          )}
        </Button>
        {(search || categoryId || authorId || sortBy !== "title" || sortOrder !== "asc") && (
          <Button variant="ghost" onClick={clearFilters} className="md:w-auto">
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Author</label>
            <Select value={authorId} onValueChange={handleAuthorChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Authors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Authors</SelectItem>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    {author.name}
                  </SelectItem>
                ))}
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
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="publication_date-desc">Newest First</SelectItem>
                <SelectItem value="publication_date-asc">Oldest First</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

