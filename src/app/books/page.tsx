import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import BooksList from "@/components/books/books-list"
import BooksFilter from "@/components/books/books-filter"
import { Skeleton } from "@/components/ui/skeleton"

export default function BooksPage({
  searchParams,
}: {
  searchParams: {
    search?: string
    category?: string
    author?: string
    sort?: string
    order?: "asc" | "desc"
    page?: string
  }
}) {
  // Parse search params
  const search = searchParams.search || ""
  const categoryId = searchParams.category || ""
  const authorId = searchParams.author || ""
  const sortBy = searchParams.sort || "title"
  const sortOrder = searchParams.order || "asc"
  const page = Number.parseInt(searchParams.page || "1", 10)
  const limit = 10
  const offset = (page - 1) * limit

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Books</h2>
        <Button asChild>
          <Link href="/books/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Book
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <BooksFilter
          search={search}
          categoryId={categoryId}
          authorId={authorId}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <Suspense
          key={`books-${search}-${categoryId}-${authorId}-${sortBy}-${sortOrder}-${page}`}
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
          <BooksList
            search={search}
            categoryId={categoryId}
            authorId={authorId}
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

