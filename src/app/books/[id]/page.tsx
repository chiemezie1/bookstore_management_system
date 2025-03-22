import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getBookById } from "@/actions/books"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash, ArrowLeft, ShoppingCart, BookOpen } from "lucide-react"
import BookInventory from "@/components/books/book-inventory"
import BookTransactions from "@/components/books/book-transactions"

export default async function BookDetailPage({
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
          <Link href="/books">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight flex-1">{book.title}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/books/${book.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-[3/4] relative max-w-md mx-auto md:mx-0">
            <Image
              src={book.cover_image_url || "/placeholder.svg?height=600&width=400"}
              alt={book.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div className="flex justify-center md:justify-start space-x-4">
            <Button asChild>
              <Link href={`/transactions/new?type=sale&book=${book.id}`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Sell
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href={`/transactions/new?type=loan&book=${book.id}`}>
                <BookOpen className="mr-2 h-4 w-4" />
                Loan
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Book Details</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Author</p>
                <p className="font-medium">{book.authors.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ISBN</p>
                <p className="font-medium">{book.isbn}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publisher</p>
                <p className="font-medium">{book.publisher}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publication Date</p>
                <p className="font-medium">{formatDate(book.publication_date, "MMMM d, yyyy")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Language</p>
                <p className="font-medium">{book.language}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages</p>
                <p className="font-medium">{book.page_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">{formatCurrency(book.price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cost Price</p>
                <p className="font-medium">{formatCurrency(book.cost_price)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Categories</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {book.book_categories.map((category) => (
                <Badge key={category.categories.id} variant="secondary">
                  {category.categories.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Description</h3>
            <p className="mt-2 text-muted-foreground">{book.description}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="mt-8">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        <TabsContent value="inventory" className="mt-4">
          <Suspense fallback={<div>Loading inventory...</div>}>
            <BookInventory bookId={book.id} inventory={book.inventory[0]} />
          </Suspense>
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <Suspense fallback={<div>Loading transactions...</div>}>
            <BookTransactions bookId={book.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

