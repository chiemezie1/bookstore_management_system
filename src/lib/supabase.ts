import { createClient } from "@supabase/supabase-js"

// Type definitions for our database
export type Database = {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          isbn: string
          author_id: string
          publisher: string
          publication_date: string
          description: string
          cover_image_url: string
          price: number
          cost_price: number
          page_count: number
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
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
          created_at?: string
          updated_at?: string
        }
      }
      authors: {
        Row: {
          id: string
          name: string
          biography: string
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          biography?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          biography?: string
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      book_categories: {
        Row: {
          book_id: string
          category_id: string
        }
        Insert: {
          book_id: string
          category_id: string
        }
        Update: {
          book_id?: string
          category_id?: string
        }
      }
      inventory: {
        Row: {
          id: string
          book_id: string
          quantity: number
          location: string
          status: "available" | "low_stock" | "out_of_stock"
          threshold: number
          last_restock_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          quantity: number
          location: string
          status?: "available" | "low_stock" | "out_of_stock"
          threshold: number
          last_restock_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          quantity?: number
          location?: string
          status?: "available" | "low_stock" | "out_of_stock"
          threshold?: number
          last_restock_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: "admin" | "staff" | "customer"
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role?: "admin" | "staff" | "customer"
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: "admin" | "staff" | "customer"
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: "sale" | "loan" | "return" | "purchase"
          status: "pending" | "completed" | "cancelled"
          total_amount: number
          payment_method: string | null
          notes: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: "sale" | "loan" | "return" | "purchase"
          status?: "pending" | "completed" | "cancelled"
          total_amount: number
          payment_method?: string | null
          notes?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: "sale" | "loan" | "return" | "purchase"
          status?: "pending" | "completed" | "cancelled"
          total_amount?: number
          payment_method?: string | null
          notes?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          book_id: string
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          book_id: string
          quantity: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          book_id?: string
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details: any
          ip_address: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details: any
          ip_address: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          details?: any
          ip_address?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

