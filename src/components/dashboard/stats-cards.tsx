import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Package, Users, ShoppingCart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

async function getStats() {
  try {
    // Get total books count
    const { count: booksCount, error: booksError } = await supabase
      .from("books")
      .select("*", { count: "exact", head: true })

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })

    // Get total sales amount
    const { data: salesData, error: salesError } = await supabase
      .from("transactions")
      .select("total_amount")
      .eq("transaction_type", "sale")
      .eq("status", "completed")

    // Get active loans count
    const { count: loansCount, error: loansError } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("transaction_type", "loan")
      .eq("status", "completed")
      .is("due_date", null)

    // Calculate total sales
    const totalSales = salesData?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0

    return {
      booksCount: booksCount || 0,
      usersCount: usersCount || 0,
      totalSales,
      loansCount: loansCount || 0,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      booksCount: 0,
      usersCount: 0,
      totalSales: 0,
      loansCount: 0,
    }
  }
}

export default async function StatsCards() {
  const { booksCount, usersCount, totalSales, loansCount } = await getStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Books</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{booksCount}</div>
          <p className="text-xs text-muted-foreground">in your collection</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          <p className="text-xs text-muted-foreground">lifetime revenue</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loansCount}</div>
          <p className="text-xs text-muted-foreground">books currently on loan</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{usersCount}</div>
          <p className="text-xs text-muted-foreground">registered in the system</p>
        </CardContent>
      </Card>
    </div>
  )
}

