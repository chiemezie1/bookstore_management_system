"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

// Sample data for inventory analytics - in a real app, this would be fetched from the database
const inventoryStatusData = [
  { name: "In Stock", value: 65, color: "#4ade80" },
  { name: "Low Stock", value: 25, color: "#fbbf24" },
  { name: "Out of Stock", value: 10, color: "#f87171" },
]

const turnoverRateData = [
  { name: "Fiction", rate: 3.2 },
  { name: "Non-Fiction", rate: 2.1 },
  { name: "Science Fiction", rate: 2.8 },
  { name: "Mystery", rate: 3.5 },
  { name: "Biography", rate: 1.9 },
  { name: "Self-Help", rate: 2.5 },
  { name: "Children's Books", rate: 4.2 },
]

const restockingData = [
  { name: "Jan", count: 12 },
  { name: "Feb", count: 15 },
  { name: "Mar", count: 10 },
  { name: "Apr", count: 8 },
  { name: "May", count: 14 },
  { name: "Jun", count: 20 },
  { name: "Jul", count: 18 },
  { name: "Aug", count: 12 },
  { name: "Sep", count: 15 },
  { name: "Oct", count: 17 },
  { name: "Nov", count: 22 },
  { name: "Dec", count: 28 },
]

export default function InventoryAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
            <CardDescription>Current status of inventory items</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Inventory Turnover Rate</CardTitle>
            <CardDescription>How quickly inventory is sold by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={turnoverRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Turnover Rate', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} times/year`, "Turnover Rate"]} />
                <Legend />
                <Bar dataKey="rate" name="Turnover Rate" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restocking Frequency</CardTitle>
          <CardDescription>Number of restocking events per month</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={restockingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} events`, "Restocking Events"]} />
              <Legend />
              <Bar dataKey="count" name="Restocking Events" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

