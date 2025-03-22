import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign, LineChart, ShoppingCart, TrendingUp } from 'lucide-react'

// Helper function to get period description
function getPeriodDescription(period: string, startDate?: string, endDate?: string): string {
  switch (period) {
    case "today":
      return "Today"
    case "yesterday":
      return "Yesterday"
    case "this_week":
      return "This Week"
    case "this_month":
      return "This Month"
    case "this_year":
      return "This Year"
    case "last_7_days":
      return "Last 7 Days"
    case "last_30_days":
      return "Last 30 Days"
    case "custom":
      if (startDate && endDate) {
        return `${startDate} to ${endDate}`
      }
      return "Custom Period"
    default:
      return "All Time"
  }
}

// Function to fetch sales summary data
async function getSalesSummary(period: string, startDate?: string, endDate?: string) {
  try {
    // Base query for completed sales
    let query = supabase
      .from("transactions")
      .select("id, total_amount, created_at")
      .eq("transaction_type", "sale")
      .eq("status", "completed")

    // Apply date filters
    if (startDate) {
      query = query.gte("created_at", `${startDate}T00:00:00`)
    }
    if (endDate) {
      query = query.lte("created_at", `${endDate}T23:59:59`)
    }

    const { data: sales, error } = await query

    if (error) throw error

    // Calculate summary metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
    const totalSales = sales.length
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0

    // For comparison, let's get data from previous period
    // This is a simplified approach - in a real app, you would need to calculate the previous period more accurately
    let previousQuery = supabase
      .from("transactions")
      .select("id, total_amount")
      .eq("transaction_type", "sale")
      .eq("status", "completed")

    // Apply date filters for previous period (simplified)
    if (startDate && endDate) {
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      const diff = endDateObj.getTime() - startDateObj.getTime()
      const previousStartDate = new Date(startDateObj.getTime() - diff)
      const previousEndDate = new Date(endDateObj.getTime() - diff)
      
      previousQuery = previousQuery
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString())
    }

    const { data: previousSales, error: prevError } = await previousQuery

    if (prevError) throw prevError

    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total_amount, 0)
    
    // Calculate change percentages
    const revenueChange = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    return {
      totalRevenue,
      totalSales,
      averageSale,
      revenueChange,
    }
  } catch (error) {
    console.error("Error fetching sales summary:", error)
    return {
      totalRevenue: 0,
      totalSales: 0,
      averageSale: 0,
      revenueChange: 0,
    }
  }
}

export default async function SalesSummary({
  period,
  startDate,
  endDate,
}: {
  period: string
  startDate?: string
  endDate?: string
}) {
  const { totalRevenue, totalSales, averageSale, revenueChange } = await getSalesSummary(period, startDate, endDate)
  const periodDescription = getPeriodDescription(period, startDate, endDate)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {revenueChange > 0 ? (
              <>
                <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">{revenueChange.toFixed(1)}%</span>
              </>
            ) : revenueChange < 0 ? (
              <>
                <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.abs(revenueChange).toFixed(1)}%</span>
              </>
            ) : (
              <span>No change</span>
            )}
            <span className="ml-1">from previous period</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales Count</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSales}</div>
          <p className="text-xs text-muted-foreground">
            for {periodDescription}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageSale)}</div>
          <p className="text-xs text-muted-foreground">
            per transaction
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

