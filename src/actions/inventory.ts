"use server"

import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getInventory({
  search = "",
  status = "",
  sortBy = "updated_at",
  sortOrder = "desc",
  limit = 10,
  offset = 0,
}: {
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase.from("inventory").select(
      `
        *,
        books (
          id,
          title,
          isbn,
          author_id,
          publisher,
          price
        )
      `,
      { count: "exact" },
    )

    // Apply status filter
    if (status) {
      query = query.eq("status", status)
    }

    // Apply search filter to book title or ISBN
    if (search) {
      query = query.or(`books.title.ilike.%${search}%,books.isbn.ilike.%${search}%`)
    }

    // Apply sorting
    const validSortColumns = ["quantity", "updated_at", "last_restock_date"]
    const column = validSortColumns.includes(sortBy) ? sortBy : "updated_at"
    query = query.order(column, { ascending: sortOrder === "asc" })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error
    return { data, count, error: null }
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return { data: null, count: 0, error }
  }
}

export async function getLowStockItems(limit = 5) {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select(`
        *,
        books (
          id,
          title,
          isbn,
          author_id,
          publisher,
          price,
          cover_image_url
        )
      `)
      .eq("status", "low_stock")
      .order("quantity", { ascending: true })
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    return { data: null, error }
  }
}

export async function updateInventoryItem({
  id,
  quantity,
  location,
  threshold,
}: {
  id: string
  quantity: number
  location: string
  threshold: number
}) {
  try {
    // Calculate status based on quantity and threshold
    let status = "available"
    if (quantity <= 0) {
      status = "out_of_stock"
    } else if (quantity <= threshold) {
      status = "low_stock"
    }

    const { data, error } = await supabase
      .from("inventory")
      .update({
        quantity,
        location,
        threshold,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    // Revalidate the inventory page to reflect changes
    revalidatePath("/inventory")
    return { data, error: null }
  } catch (error) {
    console.error("Error updating inventory item:", error)
    return { data: null, error }
  }
}

export async function restockInventoryItem({
  id,
  quantity,
}: {
  id: string
  quantity: number
}) {
  try {
    // First, get the current inventory item
    const { data: currentItem, error: fetchError } = await supabase.from("inventory").select("*").eq("id", id).single()

    if (fetchError) throw fetchError

    // Calculate new quantity and status
    const newQuantity = currentItem.quantity + quantity
    let status = "available"
    if (newQuantity <= 0) {
      status = "out_of_stock"
    } else if (newQuantity <= currentItem.threshold) {
      status = "low_stock"
    }

    // Update the inventory item
    const { data, error } = await supabase
      .from("inventory")
      .update({
        quantity: newQuantity,
        status,
        last_restock_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    // Revalidate the inventory page to reflect changes
    revalidatePath("/inventory")
    return { data, error: null }
  } catch (error) {
    console.error("Error restocking inventory item:", error)
    return { data: null, error }
  }
}

export async function updateInventoryQuantity({
  id,
  quantity,
}: {
  id: string
  quantity: number
}) {
  try {
    // First, get the current inventory item
    const { data: currentItem, error: fetchError } = await supabase.from("inventory").select("*").eq("id", id).single()

    if (fetchError) throw fetchError

    // Calculate status based on quantity and threshold
    let status = "available"
    if (quantity <= 0) {
      status = "out_of_stock"
    } else if (quantity <= currentItem.threshold) {
      status = "low_stock"
    }

    // Update the inventory item
    const { data, error } = await supabase
      .from("inventory")
      .update({
        quantity,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) throw error

    // Revalidate the inventory page to reflect changes
    revalidatePath("/inventory")
    return { data, error: null }
  } catch (error) {
    console.error("Error updating inventory quantity:", error)
    return { data: null, error }
  }
}

