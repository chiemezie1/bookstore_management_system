"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function SeedDatabase() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const seedDatabase = async () => {
    setIsLoading(true)
    setProgress("Starting database seeding...")
    setError(null)
    setSuccess(false)

    try {
      // Step 1: Add authors
      setProgress("Adding authors...")
      const authors = [
        {
          name: "J.K. Rowling",
          biography: "British author best known for the Harry Potter series.",
          photo_url: "https://example.com/jk_rowling.jpg",
        },
        {
          name: "George R.R. Martin",
          biography: "American novelist best known for A Song of Ice and Fire.",
          photo_url: "https://example.com/grrm.jpg",
        },
        {
          name: "Jane Austen",
          biography: "English novelist known for her six major novels.",
          photo_url: "https://example.com/jane_austen.jpg",
        },
        {
          name: "Stephen King",
          biography: "American author of horror, supernatural fiction, suspense, and fantasy novels.",
          photo_url: "https://example.com/stephen_king.jpg",
        },
        {
          name: "Agatha Christie",
          biography: "English writer known for her detective novels.",
          photo_url: "https://example.com/agatha_christie.jpg",
        },
        {
          name: "Toni Morrison",
          biography: "American novelist, essayist, book editor, and college professor.",
          photo_url: "https://example.com/toni_morrison.jpg",
        },
        {
          name: "Haruki Murakami",
          biography: "Japanese writer whose books and stories have been bestsellers in Japan and internationally.",
          photo_url: "https://example.com/haruki_murakami.jpg",
        },
        {
          name: "Gabriel García Márquez",
          biography: "Colombian novelist, short-story writer, screenwriter, and journalist.",
          photo_url: "https://example.com/gabriel_garcia_marquez.jpg",
        },
      ]

      const { data: authorData, error: authorError } = await supabase.from("authors").insert(authors).select()
      if (authorError) throw new Error(`Error adding authors: ${authorError.message}`)

      // Step 2: Add categories
      setProgress("Adding categories...")
      const categories = [
        { name: "Fiction", description: "Literary works created from the imagination" },
        { name: "Non-Fiction", description: "Informational and factual writing" },
        { name: "Science Fiction", description: "Fiction dealing with futuristic concepts" },
        { name: "Fantasy", description: "Fiction with magical or supernatural elements" },
        { name: "Mystery", description: "Fiction dealing with the solution of a crime or puzzle" },
        { name: "Romance", description: "Fiction focused on romantic relationships" },
        { name: "Biography", description: "Non-fiction account of a person's life" },
        { name: "History", description: "Non-fiction about past events" },
        { name: "Self-Help", description: "Books aimed at personal improvement" },
        { name: "Children's", description: "Books for young readers" },
      ]

      const { data: categoryData, error: categoryError } = await supabase.from("categories").insert(categories).select()
      if (categoryError) throw new Error(`Error adding categories: ${categoryError.message}`)

      // Step 3: Add books
      setProgress("Adding books...")
      const books = [
        {
          title: "Harry Potter and the Philosopher's Stone",
          isbn: "9780747532743",
          author_id: authorData[0].id,
          publisher: "Bloomsbury",
          publication_date: "1997-06-26",
          description: "The first novel in the Harry Potter series.",
          cover_image_url: "https://example.com/harry_potter_1.jpg",
          price: 19.99,
          cost_price: 10.0,
          page_count: 223,
          language: "English",
        },
        {
          title: "A Game of Thrones",
          isbn: "9780553103540",
          author_id: authorData[1].id,
          publisher: "Bantam Spectra",
          publication_date: "1996-08-01",
          description: "The first novel in A Song of Ice and Fire series.",
          cover_image_url: "https://example.com/got.jpg",
          price: 24.99,
          cost_price: 12.5,
          page_count: 694,
          language: "English",
        },
        {
          title: "Pride and Prejudice",
          isbn: "9780141439518",
          author_id: authorData[2].id,
          publisher: "Penguin Classics",
          publication_date: "1813-01-28",
          description: "A romantic novel by Jane Austen.",
          cover_image_url: "https://example.com/pride_and_prejudice.jpg",
          price: 14.99,
          cost_price: 7.5,
          page_count: 432,
          language: "English",
        },
        {
          title: "The Shining",
          isbn: "9780385121675",
          author_id: authorData[3].id,
          publisher: "Doubleday",
          publication_date: "1977-01-28",
          description: "A horror novel by Stephen King.",
          cover_image_url: "https://example.com/the_shining.jpg",
          price: 18.99,
          cost_price: 9.5,
          page_count: 447,
          language: "English",
        },
        {
          title: "Murder on the Orient Express",
          isbn: "9780062693662",
          author_id: authorData[4].id,
          publisher: "HarperCollins",
          publication_date: "1934-01-01",
          description: "A detective novel by Agatha Christie.",
          cover_image_url: "https://example.com/murder_orient_express.jpg",
          price: 15.99,
          cost_price: 8.0,
          page_count: 256,
          language: "English",
        },
        {
          title: "Beloved",
          isbn: "9781400033416",
          author_id: authorData[5].id,
          publisher: "Vintage",
          publication_date: "1987-09-02",
          description: "A novel by Toni Morrison.",
          cover_image_url: "https://example.com/beloved.jpg",
          price: 16.99,
          cost_price: 8.5,
          page_count: 324,
          language: "English",
        },
        {
          title: "Norwegian Wood",
          isbn: "9780375704024",
          author_id: authorData[6].id,
          publisher: "Vintage International",
          publication_date: "1987-09-04",
          description: "A novel by Haruki Murakami.",
          cover_image_url: "https://example.com/norwegian_wood.jpg",
          price: 17.99,
          cost_price: 9.0,
          page_count: 296,
          language: "English",
        },
        {
          title: "One Hundred Years of Solitude",
          isbn: "9780060883287",
          author_id: authorData[7].id,
          publisher: "Harper Perennial",
          publication_date: "1967-05-30",
          description: "A novel by Gabriel García Márquez.",
          cover_image_url: "https://example.com/one_hundred_years.jpg",
          price: 18.99,
          cost_price: 9.5,
          page_count: 417,
          language: "English",
        },
        {
          title: "Harry Potter and the Chamber of Secrets",
          isbn: "9780747538486",
          author_id: authorData[0].id,
          publisher: "Bloomsbury",
          publication_date: "1998-07-02",
          description: "The second novel in the Harry Potter series.",
          cover_image_url: "https://example.com/harry_potter_2.jpg",
          price: 19.99,
          cost_price: 10.0,
          page_count: 251,
          language: "English",
        },
        {
          title: "A Clash of Kings",
          isbn: "9780553108033",
          author_id: authorData[1].id,
          publisher: "Bantam Spectra",
          publication_date: "1998-11-16",
          description: "The second novel in A Song of Ice and Fire series.",
          cover_image_url: "https://example.com/clash_of_kings.jpg",
          price: 24.99,
          cost_price: 12.5,
          page_count: 761,
          language: "English",
        },
        {
          title: "Sense and Sensibility",
          isbn: "9780141439662",
          author_id: authorData[2].id,
          publisher: "Penguin Classics",
          publication_date: "1811-10-30",
          description: "A novel by Jane Austen.",
          cover_image_url: "https://example.com/sense_and_sensibility.jpg",
          price: 14.99,
          cost_price: 7.5,
          page_count: 409,
          language: "English",
        },
        {
          title: "It",
          isbn: "9780450411434",
          author_id: authorData[3].id,
          publisher: "Viking Press",
          publication_date: "1986-09-15",
          description: "A horror novel by Stephen King.",
          cover_image_url: "https://example.com/it.jpg",
          price: 22.99,
          cost_price: 11.5,
          page_count: 1138,
          language: "English",
        },
      ]

      const { data: bookData, error: bookError } = await supabase.from("books").insert(books).select()
      if (bookError) throw new Error(`Error adding books: ${bookError.message}`)

      // Step 4: Add book categories
      setProgress("Adding book categories...")
      const bookCategories = [
        { book_id: bookData[0].id, category_id: categoryData[3].id }, // Harry Potter - Fantasy
        { book_id: bookData[0].id, category_id: categoryData[9].id }, // Harry Potter - Children's
        { book_id: bookData[1].id, category_id: categoryData[3].id }, // Game of Thrones - Fantasy
        { book_id: bookData[2].id, category_id: categoryData[0].id }, // Pride and Prejudice - Fiction
        { book_id: bookData[2].id, category_id: categoryData[5].id }, // Pride and Prejudice - Romance
        { book_id: bookData[3].id, category_id: categoryData[0].id }, // The Shining - Fiction
        { book_id: bookData[3].id, category_id: categoryData[4].id }, // The Shining - Mystery
        { book_id: bookData[4].id, category_id: categoryData[4].id }, // Murder on the Orient Express - Mystery
        { book_id: bookData[5].id, category_id: categoryData[0].id }, // Beloved - Fiction
        { book_id: bookData[6].id, category_id: categoryData[0].id }, // Norwegian Wood - Fiction
        { book_id: bookData[7].id, category_id: categoryData[0].id }, // One Hundred Years of Solitude - Fiction
        { book_id: bookData[8].id, category_id: categoryData[3].id }, // Harry Potter 2 - Fantasy
        { book_id: bookData[8].id, category_id: categoryData[9].id }, // Harry Potter 2 - Children's
        { book_id: bookData[9].id, category_id: categoryData[3].id }, // Clash of Kings - Fantasy
        { book_id: bookData[10].id, category_id: categoryData[0].id }, // Sense and Sensibility - Fiction
        { book_id: bookData[10].id, category_id: categoryData[5].id }, // Sense and Sensibility - Romance
        { book_id: bookData[11].id, category_id: categoryData[0].id }, // It - Fiction
        { book_id: bookData[11].id, category_id: categoryData[4].id }, // It - Mystery
      ]

      const { error: bookCategoryError } = await supabase.from("book_categories").insert(bookCategories)
      if (bookCategoryError) throw new Error(`Error adding book categories: ${bookCategoryError.message}`)

      // Step 5: Add inventory
      setProgress("Adding inventory...")
      const inventory = bookData.map((book) => {
        const quantity = Math.floor(Math.random() * 50) + 1 // Random quantity between 1 and 50
        const threshold = Math.floor(Math.random() * 10) + 5 // Random threshold between 5 and 15
        let status = "available"
        if (quantity <= 0) {
          status = "out_of_stock"
        } else if (quantity <= threshold) {
          status = "low_stock"
        }

        return {
          book_id: book.id,
          quantity,
          location: ["Main Shelf", "Back Room", "Display", "Storage"][Math.floor(Math.random() * 4)],
          status,
          threshold,
          last_restock_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(), // Random date in the last 30 days
        }
      })

      const { error: inventoryError } = await supabase.from("inventory").insert(inventory)
      if (inventoryError) throw new Error(`Error adding inventory: ${inventoryError.message}`)

      // Step 6: Add users
      setProgress("Adding users...")
      const users = [
        {
          email: "admin@library.com",
          first_name: "Admin",
          last_name: "User",
          role: "admin",
          phone: "123-456-7890",
          address: "123 Admin St, City, Country",
        },
        {
          email: "staff1@library.com",
          first_name: "Staff",
          last_name: "One",
          role: "staff",
          phone: "123-456-7891",
          address: "124 Staff St, City, Country",
        },
        {
          email: "staff2@library.com",
          first_name: "Staff",
          last_name: "Two",
          role: "staff",
          phone: "123-456-7892",
          address: "125 Staff St, City, Country",
        },
        {
          email: "customer1@example.com",
          first_name: "Customer",
          last_name: "One",
          role: "customer",
          phone: "123-456-7893",
          address: "126 Customer St, City, Country",
        },
        {
          email: "customer2@example.com",
          first_name: "Customer",
          last_name: "Two",
          role: "customer",
          phone: "123-456-7894",
          address: "127 Customer St, City, Country",
        },
        {
          email: "customer3@example.com",
          first_name: "Customer",
          last_name: "Three",
          role: "customer",
          phone: "123-456-7895",
          address: "128 Customer St, City, Country",
        },
        {
          email: "customer4@example.com",
          first_name: "Customer",
          last_name: "Four",
          role: "customer",
          phone: "123-456-7896",
          address: "129 Customer St, City, Country",
        },
        {
          email: "customer5@example.com",
          first_name: "Customer",
          last_name: "Five",
          role: "customer",
          phone: "123-456-7897",
          address: "130 Customer St, City, Country",
        },
      ]

      const { data: userData, error: userError } = await supabase.from("users").insert(users).select()
      if (userError) throw new Error(`Error adding users: ${userError.message}`)

      // Step 7: Add transactions for the past 4 months
      setProgress("Adding transactions...")
      const transactions = []
      const transactionItems = []

      // Get current date and calculate date 4 months ago
      const currentDate = new Date()
      const fourMonthsAgo = new Date()
      fourMonthsAgo.setMonth(currentDate.getMonth() - 4)

      // Generate random transactions for each day in the past 4 months
      for (let d = new Date(fourMonthsAgo); d <= currentDate; d.setDate(d.getDate() + 1)) {
        // Generate 1-5 transactions per day
        const transactionsPerDay = Math.floor(Math.random() * 5) + 1

        for (let i = 0; i < transactionsPerDay; i++) {
          // Randomly select transaction type
          const transactionType = ["sale", "loan", "return", "purchase"][Math.floor(Math.random() * 4)]

          // Randomly select user (customers for sales/loans, staff for purchases)
          let userId
          if (transactionType === "purchase") {
            // Staff or admin for purchases
            userId = userData[Math.floor(Math.random() * 3)].id
          } else {
            // Customers for sales, loans, returns
            userId = userData[Math.floor(Math.random() * 5) + 3].id
          }

          // Generate random transaction date for the current day
          const transactionDate = new Date(d)
          transactionDate.setHours(Math.floor(Math.random() * 12) + 8) // Between 8 AM and 8 PM
          transactionDate.setMinutes(Math.floor(Math.random() * 60))

          // Generate due date for loans (2 weeks from transaction date)
          let dueDate = null
          if (transactionType === "loan") {
            dueDate = new Date(transactionDate)
            dueDate.setDate(dueDate.getDate() + 14) // 2 weeks loan period
          }

          // Create transaction
          const transaction = {
            user_id: userId,
            transaction_type: transactionType,
            status: "completed",
            total_amount: 0, // Will be updated after adding items
            payment_method: ["cash", "credit_card", "debit_card"][Math.floor(Math.random() * 3)],
            notes: `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} transaction`,
            due_date: dueDate ? dueDate.toISOString() : null,
            created_at: transactionDate.toISOString(),
            updated_at: transactionDate.toISOString(),
          }

          transactions.push(transaction)
        }
      }

      // Insert transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .insert(transactions)
        .select()
      if (transactionError) throw new Error(`Error adding transactions: ${transactionError.message}`)

      // Step 8: Add transaction items
      setProgress("Adding transaction items...")

      // For each transaction, add 1-3 items
      for (const transaction of transactionData) {
        const itemCount = Math.floor(Math.random() * 3) + 1
        let totalAmount = 0

        for (let i = 0; i < itemCount; i++) {
          // Randomly select a book
          const randomBookIndex = Math.floor(Math.random() * bookData.length)
          const book = bookData[randomBookIndex]

          // Random quantity between 1 and 3
          const quantity = Math.floor(Math.random() * 3) + 1

          // Calculate price based on transaction type
          let price = book.price
          if (transaction.transaction_type === "purchase") {
            price = book.cost_price
          }

          // Create transaction item
          const transactionItem = {
            transaction_id: transaction.id,
            book_id: book.id,
            quantity,
            price,
            created_at: transaction.created_at,
            updated_at: transaction.created_at,
          }

          transactionItems.push(transactionItem)
          totalAmount += price * quantity
        }

        // Update transaction with total amount
        const { error: updateError } = await supabase
          .from("transactions")
          .update({ total_amount: totalAmount })
          .eq("id", transaction.id)

        if (updateError) throw new Error(`Error updating transaction total: ${updateError.message}`)
      }

      // Insert transaction items
      const { error: transactionItemError } = await supabase.from("transaction_items").insert(transactionItems)
      if (transactionItemError) throw new Error(`Error adding transaction items: ${transactionItemError.message}`)

      // Step 9: Add audit logs
      setProgress("Adding audit logs...")
      const auditLogs = transactionData.map((transaction) => {
        return {
          user_id: transaction.user_id,
          action: `Created ${transaction.transaction_type}`,
          entity_type: "transaction",
          entity_id: transaction.id,
          details: { transaction_id: transaction.id, status: transaction.status },
          ip_address: "127.0.0.1",
          created_at: transaction.created_at,
        }
      })

      const { error: auditLogError } = await supabase.from("audit_logs").insert(auditLogs)
      if (auditLogError) throw new Error(`Error adding audit logs: ${auditLogError.message}`)

      // Step 10: Add notifications
      setProgress("Adding notifications...")
      const notifications = [
        {
          user_id: userData[0].id, // Admin
          title: "Low Stock Alert",
          message: "Several items are running low on stock. Please check the inventory.",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          user_id: userData[0].id, // Admin
          title: "New User Registration",
          message: "A new customer has registered on the platform.",
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        {
          user_id: userData[1].id, // Staff 1
          title: "Overdue Loans",
          message: "There are several overdue loans that need attention.",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          user_id: userData[2].id, // Staff 2
          title: "New Book Arrivals",
          message: "New books have arrived and need to be added to inventory.",
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]

      const { error: notificationError } = await supabase.from("notifications").insert(notifications)
      if (notificationError) throw new Error(`Error adding notifications: ${notificationError.message}`)

      setProgress("Database seeding completed successfully!")
      setSuccess(true)
    } catch (err) {
      console.error("Error seeding database:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Seed Database</CardTitle>
        <CardDescription>
          Populate the database with sample data for testing. This will create authors, categories, books, inventory,
          users, transactions, and more with 4 months of historical data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {progress && (
          <div className="mb-4 p-4 bg-muted rounded-md">
            <p className="text-sm">{progress}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">
            <p className="text-sm">Error: {error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-md">
            <p className="text-sm">Database seeded successfully!</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={seedDatabase} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Database...
            </>
          ) : (
            "Seed Database"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

