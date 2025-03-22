import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import BookForm from "@/components/books/book-form"
import { getBookById } from "@/actions/books"

export default async function EditBookPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: book, error } = await getBookById(params.id)

  if (error || !book) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" asChild className="mr-4">
          <Link href={`/books/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Book</h2>
      </div>

      <div className="space-y-4">
        <BookForm book={book} bookCategories={book.book_categories} inventory={book.inventory[0]} />
      </div>
    </div>
  )
}

