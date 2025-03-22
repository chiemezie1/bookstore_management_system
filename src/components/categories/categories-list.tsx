import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Tag, Trash } from 'lucide-react'
import { formatDate } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

// Function to fetch categories data
async function getCategories() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        *,
        book_categories (
          count
        )
      `)
      .order("name")

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return { data: null, error }
  }
}

export default async function CategoriesList() {
  const { data: categories, error } = await getCategories()

  if (error) {
    return <div className="text-red-500">Error loading categories: {error.message}</div>
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Tag className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No categories found</h3>
        <p className="text-muted-foreground mt-2">Create a new category to get started.</p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/categories/new">Add Category</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        // Count the number of books in this category
        const bookCount = category.book_categories ? category.book_categories.length : 0
        
        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>
                {bookCount} {bookCount === 1 ? "book" : "books"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {category.description || "No description provided."}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Created on {formatDate(category.created_at, "MMMM d, yyyy")}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/books?category=${category.id}`}>View Books</Link>
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/categories/${category.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Link>
                </Button>
                <Button variant="outline" size="icon" className="text-destructive">
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

