"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample data - in a real app, this would come from the database
const data = [
  { name: "Jan", sales: 4000, loans: 2400 },
  { name: "Feb", sales: 3000, loans: 1398 },
  { name: "Mar", sales: 2000, loans: 9800 },
  { name: "Apr", sales: 2780, loans: 3908 },
  { name: "May", sales: 1890, loans: 4800 },
  { name: "Jun", sales: 2390, loans: 3800 },
  { name: "Jul", sales: 3490, loans: 4300 },
]

export default function DashboardChart() {
  return (
    <ChartContainer
      config={{
        sales: {
          label: "Sales",
          color: "hsl(var(--chart-1))",
        },
        loans: {
          label: "Loans",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} />
          <Line type="monotone" dataKey="loans" stroke="var(--color-loans)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

