"use server"

import { supabase } from "@/lib/supabase"
import { createAuditLog } from "./audit-log"
import { revalidatePath } from "next/cache"
import { isValidISBN } from "@/lib/utils"

/**
 * Retrieves books with optional filtering and pagination
 *
 * @param options - Options for filtering and pagination
 * @returns The books or an error
 */
export async function getBooks({
  search = "",
  categoryId = "",
  authorId = "",
  sortBy = "title",
  sortOrder = "asc",
  limit = 10,
  offset = 0,
}: {
  search?: string
  categoryId?: string
  authorId?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
} = {}) {
  try {
    let query = supabase.from("books").select(
      `
        *,
        authors:author_id (*),
        book_categories!inner (
          categories:category_id (*)
        ),
        inventory (*)
      `,
      { count: "exact" },
    )

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,isbn.ilike.%${search}%`)
    }

    // Apply author filter
    if (authorId) {
      query = query.eq("author_id", authorId)
    }

    // Apply category filter
    if (categoryId) {
      query = query.eq("book_categories.category_id", categoryId)
    }

    // Apply sorting
    if (sortBy && ["title", "publication_date", "price"].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === "asc" })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error
    return { data, count, error: null }
  } catch (error) {
    console.error("Error fetching books:", error)
    return { data: null, count: 0, error }
  }
}

/**
 * Retrieves a book by ID
 *
 * @param id - The ID of the book to retrieve
 * @returns The book or an error
 */
export async function getBookById(id: string) {
  try {
    const { data, error } = await supabase
      .from("books")
      .select(`
        *,
        authors:author_id (*),
        book_categories (
          categories:category_id (*)
        ),
        inventory (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error)
    return { data: null, error }
  }
}

/**
 * Creates a new book
 *
 * @param userId - The ID of the user creating the book
 * @param bookData - The data for the new book
 * @returns The created book or an error
 */
export async function createBook(
  userId: string,
  bookData: {
    title: string
    isbn: string
    author_id: string
    publisher: string
    publication_date: string
    description: string
    cover_image_url?: string
    price: number
    cost_price: number
    page_count: number
    language: string
    categories: string[]
    inventory: {
      quantity: number
      location: string
      threshold: number
    }
  },
) {
  try {
    // Validate ISBN
    if (!isValidISBN(bookData.isbn)) {
      return { data: null, error: { message: "Invalid ISBN format" } }
    }

    // Check if ISBN already exists
    const { data: existingBook } = await supabase.from("books").select("id").eq("isbn", bookData.isbn).single()

    if (existingBook) {
      return { data: null, error: { message: "A book with this ISBN already exists" } }
    }

    // Start a transaction
    const { data: book, error: bookError } = await supabase
      .from("books")
      .insert({
        title: bookData.title,
        isbn: bookData.isbn,
        author_id: bookData.author_id,
        publisher: bookData.publisher,
        publication_date: bookData.publication_date,
        description: bookData.description,
        cover_image_url: bookData.cover_image_url || null,
        price: bookData.price,
        cost_price: bookData.cost_price,
        page_count: bookData.page_count,
        language: bookData.language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (bookError) throw bookError

    // Add categories
    if (bookData.categories && bookData.categories.length > 0) {
      const categoryInserts = bookData.categories.map((categoryId) => ({
        book_id: book.id,
        category_id: categoryId,
      }))

      const { error: categoriesError } = await supabase.from("book_categories").insert(categoryInserts)

      if (categoriesError) throw categoriesError
    }

    // Add inventory
    const { error: inventoryError } = await supabase.from("inventory").insert({
      book_id: book.id,
      quantity: bookData.inventory.quantity,
      location: bookData.inventory.location,
      status:
        bookData.inventory.quantity > 0
          ? bookData.inventory.quantity <= bookData.inventory.threshold
            ? "low_stock"
            : "available"
          : "out_of_stock",
      threshold: bookData.inventory.threshold,
      last_restock_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (inventoryError) throw inventoryError

    // Create audit log
    await createAuditLog(userId, "create", "book", book.id, { title: book.title, isbn: book.isbn })

    revalidatePath("/books")
    revalidatePath("/inventory")

    return { data: book, error: null }
  } catch (error) {
    console.error("Error creating book:", error)
    return { data: null, error }
  }
}

/**
 * Updates a book
 *
 * @param userId - The ID of the user updating the book
 * @param id - The ID of the book to update
 * @param bookData - The updated book data
 * @returns The updated book or an error
 */
export async function updateBook(
  userId: string,
  id: string,
  bookData: {
    title?: string
    isbn?: string
    author_id?: string
    publisher?: string
    publication_date?: string
    description?: string
    cover_image_url?: string
    price?: number
    cost_price?: number
    page_count?: number
    language?: string
    categories?: string[]
    inventory?: {
      quantity?: number
      location?: string
      threshold?: number
    }
  },
) {
  try {
    // Validate ISBN if provided
    if (bookData.isbn && !isValidISBN(bookData.isbn)) {
      return { data: null, error: { message: "Invalid ISBN format" } }
    }

    // Check if ISBN already exists (if changing ISBN)
    if (bookData.isbn) {
      const { data: existingBook } = await supabase
        .from("books")
        .select("id")
        .eq("isbn", bookData.isbn)
        .neq("id", id)
        .single()

      if (existingBook) {
        return { data: null, error: { message: "A book with this ISBN already exists" } }
      }
    }

    // Update book
    const { data: book, error: bookError } = await supabase
      .from("books")
      .update({
        ...(bookData.title && { title: bookData.title }),
        ...(bookData.isbn && { isbn: bookData.isbn }),
        ...(bookData.author_id && { author_id: bookData.author_id }),
        ...(bookData.publisher && { publisher: bookData.publisher }),
        ...(bookData.publication_date && { publication_date: bookData.publication_date }),
        ...(bookData.description && { description: bookData.description }),
        ...(bookData.cover_image_url && { cover_image_url: bookData.cover_image_url }),
        ...(bookData.price && { price: bookData.price }),
        ...(bookData.cost_price && { cost_price: bookData.cost_price }),
        ...(bookData.page_count && { page_count: bookData.page_count }),
        ...(bookData.language && { language: bookData.language }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (bookError) throw bookError

    // Update categories if provided
    if (bookData.categories) {
      // First, remove existing categories
      const { error: deleteError } = await supabase.from("book_categories").delete().eq("book_id", id)

      if (deleteError) throw deleteError

      // Then, add new categories
      if (bookData.categories.length > 0) {
        const categoryInserts = bookData.categories.map((categoryId) => ({
          book_id: id,
          category_id: categoryId,
        }))

        const { error: categoriesError } = await supabase.from("book_categories").insert(categoryInserts)

        if (categoriesError) throw categoriesError
      }
    }

    // Update inventory if provided
    if (bookData.inventory) {
      // Get current inventory
      const { data: currentInventory, error: inventoryFetchError } = await supabase
        .from("inventory")
        .select("*")
        .eq("book_id", id)
        .single()

      if (inventoryFetchError) throw inventoryFetchError

      const newQuantity = bookData.inventory.quantity ?? currentInventory.quantity
      const newThreshold = bookData.inventory.threshold ?? currentInventory.threshold

      const { error: inventoryError } = await supabase
        .from("inventory")
        .update({
          ...(bookData.inventory.quantity !== undefined && { quantity: bookData.inventory.quantity }),
          ...(bookData.inventory.location && { location: bookData.inventory.location }),
          ...(bookData.inventory.threshold !== undefined && { threshold: bookData.inventory.threshold }),
          status: newQuantity > 0 ? (newQuantity <= newThreshold ? "low_stock" : "available") : "out_of_stock",
          updated_at: new Date().toISOString(),
          ...(bookData.inventory.quantity !== undefined && { last_restock_date: new Date().toISOString() }),
        })
        .eq("book_id", id)

      if (inventoryError) throw inventoryError
    }

    // Create audit log
    await createAuditLog(userId, "update", "book", id, { title: book.title, isbn: book.isbn })

    revalidatePath("/books")
    revalidatePath(`/books/${id}`)
    revalidatePath("/inventory")

    return { data: book, error: null }
  } catch (error) {
    console.error(`Error updating book with ID ${id}:`, error)
    return { data: null, error }
  }
}

/**
 * Deletes a book
 *
 * @param userId - The ID of the user deleting the book
 * @param id - The ID of the book to delete
 * @returns Success status or an error
 */
export async function deleteBook(userId: string, id: string) {
  try {
    // Get book details for audit log
    const { data: book, error: bookFetchError } = await supabase
      .from("books")
      .select("title, isbn")
      .eq("id", id)
      .single()

    if (bookFetchError) throw bookFetchError

    // Check if book is referenced in transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("transaction_items")
      .select("id")
      .eq("book_id", id)
      .limit(1)

    if (transactionsError) throw transactionsError

    if (transactions && transactions.length > 0) {
      return {
        success: false,
        error: {
          message: "Cannot delete book as it is referenced in transactions. Consider marking it as inactive instead.",
        },
      }
    }

    // Delete inventory
    const { error: inventoryError } = await supabase.from("inventory").delete().eq("book_id", id)

    if (inventoryError) throw inventoryError

    // Delete book categories
    const { error: categoriesError } = await supabase.from("book_categories").delete().eq("book_id", id)

    if (categoriesError) throw categoriesError

    // Delete book
    const { error: deleteError } = await supabase.from("books").delete().eq("id", id)

    if (deleteError) throw deleteError

    // Create audit log
    await createAuditLog(userId, "delete", "book", id, { title: book.title, isbn: book.isbn })

    revalidatePath("/books")
    revalidatePath("/inventory")

    return { success: true, error: null }
  } catch (error) {
    console.error(`Error deleting book with ID ${id}:`, error)
    return { success: false, error }
  }
}

