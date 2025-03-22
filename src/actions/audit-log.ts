"use server"

import { supabase } from "@/lib/supabase"
import { headers } from "next/headers"

/**
 * Creates an audit log entry
 *
 * @param userId - The ID of the user performing the action
 * @param action - The action being performed (e.g., "create", "update", "delete")
 * @param entityType - The type of entity being acted upon (e.g., "book", "user")
 * @param entityId - The ID of the entity being acted upon
 * @param details - Additional details about the action
 * @returns The created audit log entry or an error
 */
export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: any,
) {
  try {
    // Get the client's IP address
    const headersList = headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        ip_address: ip,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error creating audit log:", error)
    return { data: null, error }
  }
}

/**
 * Retrieves audit logs with optional filtering
 *
 * @param options - Options for filtering audit logs
 * @returns The audit logs or an error
 */
export async function getAuditLogs({
  userId,
  entityType,
  entityId,
  action,
  limit = 50,
  offset = 0,
}: {
  userId?: string
  entityType?: string
  entityId?: string
  action?: string
  limit?: number
  offset?: number
}) {
  try {
    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        users:user_id (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (entityType) {
      query = query.eq("entity_type", entityType)
    }

    if (entityId) {
      query = query.eq("entity_id", entityId)
    }

    if (action) {
      query = query.eq("action", action)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return { data: null, error }
  }
}

