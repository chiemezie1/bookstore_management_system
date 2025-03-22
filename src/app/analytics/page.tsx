import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import SalesAnalytics from "@/components/analytics/sales-analytics"
import InventoryAnalytics from "@/components/analytics/inventory-analytics"
import UserAnalytics from "@/components/analytics/user-analytics"

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: {
    tab?: string
    period?: string
  }
}) {
  const tab = searchParams.tab || "sales"
  const period = searchParams.period || "this_month"

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      <Tabs defaultValue={tab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <SalesAnalytics period={period} />
          </Suspense>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <InventoryAnalytics />
          </Suspense>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <UserAnalytics />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

