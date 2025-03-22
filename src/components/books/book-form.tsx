"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBook, updateBook } from "@/actions/books"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { Book } from "@/types/database"

// Form schema
const bookFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  isbn: z.string().min(1, "ISBN is required"),
  author_id: z.string().min(1, "Author is required"),
  publisher: z.string().min(1, "Publisher is required"),
  publication_date: z.date(),
  description: z.string().min(1, "Description is required"),
  cover_image_url: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  cost_price: z.coerce.number().min(0, "Cost price must be 0 or greater"),
  page_count: z.coerce.number().int().min(1, "Page count must be at least 1"),
  language: z.string().min(1, "Language is required"),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  inventory: z.object({
    quantity: z.coerce.number().int().min(0, "Quantity must be 0 or greater"),
    location: z.string().min(1, "Locationion is required"),
    threshold: z.coerce.number().int().min(1, "Threshold must be at least 1"),
  }),
})

type BookFormProps = {
  book?: Book
  bookCategories?: { category_id: string }[]
  inventory?: {
    quantity: number
    location: string
    threshold: number
  }
}

export default function BookForm({ book, bookCategories, inventory }: BookFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: book?.title || "",
      isbn: book?.isbn || "",
      author_id: book?.author_id || "",
      publisher: book?.publisher || "",
      publication_date: book?.publication_date ? new Date(book.publication_date) : new Date(),
      description: book?.description || "",
      cover_image_url: book?.cover_image_url || "",
      price: book?.price || 0,
      cost_price: book?.cost_price || 0,
      page_count: book?.page_count || 1,
      language: book?.language || "English",
      categories: bookCategories?.map((bc) => bc.category_id) || [],
      inventory: {
        quantity: inventory?.quantity || 0,
        location: inventory?.location || "",
        threshold: inventory?.threshold || 5,
      },
    },
  })

  // Fetch authors and categories
  useEffect(() => {
    const fetchData = async () => {
      // Fetch authors
      const { data: authorsData } = await supabase.from("authors").select("id, name").order("name")

      if (authorsData) {
        setAuthors(authorsData)
      }

      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("id, name").order("name")

      if (categoriesData) {
        setCategories(categoriesData)
      }
    }

    fetchData()
  }, [])

  // Form submission
  const onSubmit = async (values: z.infer<typeof bookFormSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (book) {
        // Update existing book
        const { data, error } = await updateBook(user.id, book.id, {
          title: values.title,
          isbn: values.isbn,
          author_id: values.author_id,
          publisher: values.publisher,
          publication_date: values.publication_date.toISOString(),
          description: values.description,
          cover_image_url: values.cover_image_url,
          price: values.price,
          cost_price: values.cost_price,
          page_count: values.page_count,
          language: values.language,
          categories: values.categories,
          inventory: {
            quantity: values.inventory.quantity,
            location: values.inventory.location,
            threshold: values.inventory.threshold,
          },
        })

        if (error) {
          throw error
        }

        toast({
          title: "Book updated",
          description: `"${values.title}" has been updated successfully`,
        })

        router.push(`/books/${book.id}`)
      } else {
        // Create new book
        const { data, error } = await createBook(user.id, {
          title: values.title,
          isbn: values.isbn,
          author_id: values.author_id,
          publisher: values.publisher,
          publication_date: values.publication_date.toISOString(),
          description: values.description,
          cover_image_url: values.cover_image_url,
          price: values.price,
          cost_price: values.cost_price,
          page_count: values.page_count,
          language: values.language,
          categories: values.categories,
          inventory: {
            quantity: values.inventory.quantity,
            location: values.inventory.location,
            threshold: values.inventory.threshold,
          },
        })

        if (error) {
          throw error
        }

        toast({
          title: "Book created",
          description: `"${values.title}" has been added to your collection`,
        })

        router.push(`/books/${data.id}`)
      }
    } catch (error: any) {
      console.error("Error saving book:", error)
      toast({
        title: "Error saving book",
        description: error.message || "An error occurred while saving the book",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Book title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isbn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISBN</FormLabel>
                <FormControl>
                  <Input placeholder="ISBN" {...field} />
                </FormControl>
                <FormDescription>Enter ISBN-10 or ISBN-13 format</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publisher"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publisher</FormLabel>
                <FormControl>
                  <Input placeholder="Publisher" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="publication_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Publication Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <FormControl>
                  <Input placeholder="Language" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="page_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Count</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cover_image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/cover.jpg" {...field} />
                </FormControl>
                <FormDescription>Enter a URL for the book cover image</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={field.value.includes(category.id)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        if (checked) {
                          field.onChange([...field.value, category.id])
                        } else {
                          field.onChange(field.value.filter((id) => id !== category.id))
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Book description" className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border rounded-lg p-4">
          <h3 className="text-lg font-medium">Inventory Information</h3>

          <div className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="inventory.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inventory.location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Shelf A-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="inventory.threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Low Stock Threshold</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>Alert when stock falls below this number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {book ? "Update Book" : "Add Book"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

