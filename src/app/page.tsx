import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BookOpen, Package, Users, ShoppingCart, TrendingUp, BookCopy } from "lucide-react"
import DashboardChart from "@/components/dashboard/dashboard-chart"
import RecentTransactions from "@/components/dashboard/recent-transactions"
import LowStockAlert from "@/components/dashboard/low-stock-alert"
import StatsCards from "@/components/dashboard/stats-cards"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Reports</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<div>Loading stats...</div>}>
            <StatsCards />
          </Suspense>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <DashboardChart />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Items that need to be restocked soon</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading low stock items...</div>}>
                  <LowStockAlert />
                </Suspense>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/inventory?status=low_stock">View All Low Stock Items</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest sales and loans</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading recent transactions...</div>}>
                  <RecentTransactions />
                </Suspense>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/transactions">View All Transactions</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button className="w-full justify-start" asChild>
                  <Link href="/books/new">
                    <BookCopy className="mr-2 h-4 w-4" />
                    Add New Book
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/transactions/new?type=sale">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Record Sale
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/transactions/new?type=loan">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Record Loan
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/transactions/new?type=purchase">
                    <Package className="mr-2 h-4 w-4" />
                    Record Purchase
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/users/new">
                    <Users className="mr-2 h-4 w-4" />
                    Add New User
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Books Sold</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">+201 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <BookCopy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+89</div>
                <p className="text-xs text-muted-foreground">+7 from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* More analytics content would go here */}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sales Report</CardTitle>
                <CardDescription>Detailed sales analysis by period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive sales reports with filtering by date range, category, and more.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Report</CardTitle>
                <CardDescription>Stock levels and valuation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Track inventory levels, identify slow-moving items, and calculate total inventory value.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Report</CardTitle>
                <CardDescription>Customer activity and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Analyze customer purchasing patterns, loan history, and preferred genres.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

