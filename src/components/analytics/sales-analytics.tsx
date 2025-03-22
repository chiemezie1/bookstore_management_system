"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { BarChart, LineChart, Legend, Grid, XAxis, YAxis, Bar, Line, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

// Sample data for sales analytics - in a real app, this would be fetched from the database
const sampleData = {
  salesByMonth: [
    { month: "Jan", sales: 4500, transactions: 120 },
    { month: "Feb", sales: 5200, transactions: 145 },
    { month: "Mar", sales: 4800, transactions: 135 },
    { month: "Apr", sales: 6000, transactions: 160 },
    { month: "May", sales: 5500, transactions: 150 },
    { month: "Jun", sales: 6500, transactions: 175 },
    { month: "Jul", sales: 7500, transactions: 200 },
    { month: "Aug", sales: 8000, transactions: 220 },
    { month: "Sep", sales: 7000, transactions: 190 },
    { month: "Oct", sales: 7800, transactions: 210 },
    { month: "Nov", sales: 8500, transactions: 230 },
    { month: "Dec", sales: 9500, transactions: 260 },
  ],
  topCategories: [
    { name: "Fiction", value: 45 },
    { name: "Non-Fiction", value: 28 },
    { name: "Science Fiction", value: 15 },
    { name: "Mystery", value: 12 },
    { name: "Biography", value: 10 },
  ],
  topBooks: [
    { name: "The Great Novel", sales: 120, revenue: 2400 },
    { name: "Science Explained", sales: 95, revenue: 1900 },
    { name: "History of the World", sales: 85, revenue: 1700 },
    { name: "Mystery at Midnight", sales: 75, revenue: 1500 },
    { name: "Biography of a Legend", sales: 60, revenue: 1200 },
  ]
}

export default function SalesAnalytics({ period }: { period: string }) {
  const [salesData, setSalesData] = useState(sampleData)
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [activeSection, setActiveSection] = useState("overview")

  // In a real app, this would fetch actual data from the database
  useEffect(() => {
    // Simulating data fetch based on period
    console.log(`Fetching sales data for period: ${selectedPeriod}`)
    // setSalesData(newData) would be called here
  }, [selectedPeriod])

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h3 className="text-lg font-medium">Sales Analytics</h3>
        <div className="w-full md:w-[200px]">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="top_books">Top Books</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Monthly sales and transaction count</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData.salesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "sales") return [formatCurrency(value), "Revenue"];
                      return [value, "Transactions"];
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sales" 
                    name="Revenue" 
                    stroke="#82ca9d" 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="transactions" 
                    name="Transactions" 
                    stroke="#8884d8" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Percentage of sales by book category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Percentage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top_books" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Books</CardTitle>
              <CardDescription>Books with highest sales volume and revenue</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.topBooks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                  <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === "revenue") return [formatCurrency(value), "Revenue"];
                      return [value, "Units Sold"];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="sales" 
                    name="Units Sold" 
                    fill="#8884d8" 
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#82ca9d" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

