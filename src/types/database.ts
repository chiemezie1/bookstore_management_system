export type Book = {
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

export type Author = {
  id: string
  name: string
  biography: string
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type BookCategory = {
  book_id: string
  category_id: string
}

export type InventoryItem = {
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

export type User = {
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

export type Transaction = {
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

export type TransactionItem = {
  id: string
  transaction_id: string
  book_id: string
  quantity: number
  price: number
  created_at: string
  updated_at: string
}

export type AuditLog = {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  details: any
  ip_address: string
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

