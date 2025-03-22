import SeedDatabase from "@/scripts/seed-database"

export default function SeedPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Database Seed Tool</h1>
      <SeedDatabase />
    </div>
  )
}

