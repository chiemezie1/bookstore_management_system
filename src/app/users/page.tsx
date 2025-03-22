import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'
import UsersList from "@/components/users/users-list"
import UsersFilter from "@/components/users/users-filter"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersPage({
  searchParams,
}: {
  searchParams: {
    search?: string
    role?: string
    sort?: string
    order?: "asc" | "desc"
    page?: string
  }
}) {
  // Parse search params
  const search = searchParams.search || ""
  const role = searchParams.role || ""
  const sortBy = searchParams.sort || "first_name"
  const sortOrder = searchParams.order || "asc"
  const page = Number.parseInt(searchParams.page || "1", 10)
  const limit = 10
  const offset = (page - 1) * limit

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button asChild>
          <Link href="/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <UsersFilter 
          search={search}
          role={role}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />

        <Suspense
          key={`users-${search}-${role}-${sortBy}-${sortOrder}-${page}`}
          fallback={
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <UsersList
            search={search}
            role={role}
            sortBy={sortBy}
            sortOrder={sortOrder}
            limit={limit}
            offset={offset}
            page={page}
          />
        </Suspense>
      </div>
    </div>
  )
}

