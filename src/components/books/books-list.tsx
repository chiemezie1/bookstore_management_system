import Link from "next/link"
import Image from "next/image"
import { getBooks } from "@/actions/books"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash, BookOpen } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default async function BooksList({
  search,
  categoryId,
  authorId,
  sortBy,
  sortOrder,
  limit,
  offset,
  page,
}: {
  search: string
  categoryId: string
  authorId: string
  sortBy: string
  sortOrder: "asc" | "desc"
  limit: number
  offset: number
  page: number
}) {
  const {
    data: books,
    count,
    error,
  } = await getBooks({
    search,
    categoryId,
    authorId,
    sortBy,
    sortOrder,
    limit,
    offset,
  })

  if (error) {
    return <div className="text-red-500">Error loading books: {error.message}</div>
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No books found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your search or filters, or add a new book.</p>
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            <div className="aspect-[3/4] relative">
              <Image
                src={book.cover_image_url || "/placeholder.svg?height=300&width=200"}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-1 text-lg">{book.title}</CardTitle>
              <CardDescription className="line-clamp-1">{book.authors.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>
                  <p className="font-medium mt-2">{formatCurrency(book.price)}</p>
                </div>
                <div>
                  <Badge
                    variant={
                      book.inventory[0]?.status === "available"
                        ? "default"
                        : book.inventory[0]?.status === "low_stock"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {book.inventory[0]?.quantity} in stock
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/books/${book.id}`}>View</Link>
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" asChild>
                  <Link href={`/books/${book.id}/edit`}>
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
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`/books?search=${search}&category=${categoryId}&author=${authorId}&sort=${sortBy}&order=${sortOrder}&page=${page - 1}`}
                />
              </PaginationItem>
            )}

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around the current page
              let pageNum = page
              if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }

              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href={`/books?search=${search}&category=${categoryId}&author=${authorId}&sort=${sortBy}&order=${sortOrder}&page=${pageNum}`}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              }
              return null
            })}

            {page < totalPages && (
              <PaginationItem>
                <PaginationNext
                  href={`/books?search=${search}&category=${categoryId}&author=${authorId}&sort=${sortBy}&order=${sortOrder}&page=${page + 1}`}
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

