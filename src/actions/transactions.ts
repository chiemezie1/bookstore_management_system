"use server"

import { supabase } from "@/lib/supabase"
import { createAuditLog } from "./audit-log"
import { revalidatePath } from "next/cache"
import { updateInventoryQuantity } from "./inventory"

/**
 * Retrieves transactions with optional filtering and pagination
 *
 * @param options - Options for filtering and pagination
 * @returns The transactions or an error
 */
export async function getTransactions({
  userId = "",
  type = "",
  status = "",
  startDate = "",
  endDate = "",
  sortBy = "created_at",
  sortOrder = "desc",
  limit = 10,
  offset = 0,
}: {
  userId?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
} = {}) {
  try {
    let query = supabase.from("transactions").select(
      `
        *,
        users:user_id (
          id,
          email,
          first_name,
          last_name
        ),
        transaction_items (
          id,
          quantity,
          price,
          books:book_id (
            id,
            title,
            isbn
          )
        )
      `,
      { count: "exact" },
    )

    // Apply user filter
    if (userId) {
      query = query.eq("user_id", userId)
    }

    // Apply transaction type filter
    if (type && ["sale", "loan", "return", "purchase"].includes(type)) {
      query = query.eq("transaction_type", type)
    }

    // Apply status filter
    if (status && ["pending", "completed", "cancelled"].includes(status)) {
      query = query.eq("status", status)
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte("created_at", startDate)
    }
    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    // Apply sorting
    if (["created_at", "total_amount", "due_date"].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === "asc" })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error
    return { data, count, error: null }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { data: null, count: 0, error }
  }
}

/**
 * Retrieves a transaction by ID
 *
 * @param id - The ID of the transaction to retrieve
 * @returns The transaction or an error
 */
export async function getTransactionById(id: string) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        users:user_id (
          id,
          email,
          first_name,
          last_name,
          phone,
          address
        ),
        transaction_items (
          id,
          quantity,
          price,
          books:book_id (
            id,
            title,
            isbn,
            publisher,
            authors:author_id (
              id,
              name
            )
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error(`Error fetching transaction with ID ${id}:`, error)
    return { data: null, error }
  }
}

/**
 * Creates a new transaction
 *
 * @param userId - The ID of the user creating the transaction
 * @param transactionData - The data for the new transaction
 * @returns The created transaction or an error
 */
export async function createTransaction(
  userId: string,
  transactionData: {
    user_id: string
    transaction_type: "sale" | "loan" | "return" | "purchase"
    status?: "pending" | "completed" | "cancelled"
    total_amount: number
    payment_method?: string
    notes?: string
    due_date?: string
    items: Array<{
      book_id: string
      quantity: number
      price: number
    }>
  },
) {
  try {
    // Validate items
    if (!transactionData.items || transactionData.items.length === 0) {
      return { data: null, error: { message: "Transaction must have at least one item" } }
    }

    // Check inventory for sales and loans
    if (["sale", "loan"].includes(transactionData.transaction_type)) {
      for (const item of transactionData.items) {
        const { data: inventory, error: inventoryError } = await supabase
          .from("inventory")
          .select("quantity")
          .eq("book_id", item.book_id)
          .single()

        if (inventoryError) throw inventoryError

        if (inventory.quantity < item.quantity) {
          // Get book details for error message
          const { data: book, error: bookError } = await supabase
            .from("books")
            .select("title")
            .eq("id", item.book_id)
            .single()

          if (bookError) throw bookError

          return {
            data: null,
            error: {
              message: `Insufficient inventory for "${book.title}". Available: ${inventory.quantity}, Requested: ${item.quantity}`,
            },
          }
        }
      }
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: transactionData.user_id,
        transaction_type: transactionData.transaction_type,
        status: transactionData.status || "pending",
        total_amount: transactionData.total_amount,
        payment_method: transactionData.payment_method || null,
        notes: transactionData.notes || null,
        due_date: transactionData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Create transaction items
    const transactionItems = transactionData.items.map((item) => ({
      transaction_id: transaction.id,
      book_id: item.book_id,
      quantity: item.quantity,
      price: item.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    const { error: itemsError } = await supabase.from("transaction_items").insert(transactionItems)

    if (itemsError) throw itemsError

    // Update inventory if transaction is completed
    if (transaction.status === "completed") {
      await updateInventoryForTransaction(userId, transaction.id, transaction.transaction_type)
    }

    // Create audit log
    await createAuditLog(userId, "create_transaction", "transaction", transaction.id, {
      transaction_type: transaction.transaction_type,
      total_amount: transaction.total_amount,
      items_count: transactionData.items.length,
    })

    revalidatePath("/transactions")

    return { data: transaction, error: null }
  } catch (error) {
    console.error("Error creating transaction:", error)
    return { data: null, error }
  }
}

/**
 * Updates a transaction's status
 *
 * @param userId - The ID of the user updating the transaction
 * @param id - The ID of the transaction to update
 * @param status - The new status
 * @returns The updated transaction or an error
 */
export async function updateTransactionStatus(
  userId: string,
  id: string,
  status: "pending" | "completed" | "cancelled",
) {
  try {
    // Get current transaction
    const { data: currentTransaction, error: fetchError } = await supabase
      .from("transactions")
      .select("status, transaction_type")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Update transaction
    const { data: transaction, error } = await supabase
      .from("transactions")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Update inventory if status changed to or from 'completed'
    if (
      (currentTransaction.status !== "completed" && status === "completed") ||
      (currentTransaction.status === "completed" && status !== "completed")
    ) {
      await updateInventoryForTransaction(userId, id, transaction.transaction_type, status === "completed")
    }

    // Create audit log
    await createAuditLog(userId, "update_transaction_status", "transaction", id, {
      previous_status: currentTransaction.status,
      new_status: status,
    })

    revalidatePath("/transactions")
    revalidatePath(`/transactions/${id}`)

    return { data: transaction, error: null }
  } catch (error) {
    console.error(`Error updating transaction status for ID ${id}:`, error)
    return { data: null, error }
  }
}

/**
 * Updates inventory based on transaction
 *
 * @param userId - The ID of the user updating the inventory
 * @param transactionId - The ID of the transaction
 * @param transactionType - The type of transaction
 * @param isCompleted - Whether the transaction is being completed or reversed
 */
async function updateInventoryForTransaction(
  userId: string,
  transactionId: string,
  transactionType: "sale" | "loan" | "return" | "purchase",
  isCompleted = true,
) {
  try {
    // Get transaction items
    const { data: items, error: itemsError } = await supabase
      .from("transaction_items")
      .select(`
        book_id,
        quantity,
        books:book_id (
          title
        )
      `)
      .eq("transaction_id", transactionId)

    if (itemsError) throw itemsError

    // Update inventory for each item
    for (const item of items) {
      // Get current inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from("inventory")
        .select("quantity")
        .eq("book_id", item.book_id)
        .single()

      if (inventoryError) throw inventoryError

      let newQuantity = inventory.quantity

      // Calculate new quantity based on transaction type and completion status
      if (isCompleted) {
        // Transaction is being completed
        switch (transactionType) {
          case "sale":
          case "loan":
            newQuantity -= item.quantity
            break
          case "return":
          case "purchase":
            newQuantity += item.quantity
            break
        }
      } else {
        // Transaction is being reversed (from completed to something else)
        switch (transactionType) {
          case "sale":
          case "loan":
            newQuantity += item.quantity
            break
          case "return":
          case "purchase":
            newQuantity -= item.quantity
            break
        }
      }

      // Ensure quantity doesn't go below zero
      newQuantity = Math.max(0, newQuantity)

      // Update inventory
      await updateInventoryQuantity(
        userId,
        item.book_id,
        newQuantity,
        `Inventory updated due to ${transactionType} transaction #${transactionId}`,
      )
    }
  } catch (error) {
    console.error(`Error updating inventory for transaction ${transactionId}:`, error)
    throw error
  }
}

