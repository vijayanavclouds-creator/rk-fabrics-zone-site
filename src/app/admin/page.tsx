import prisma from "@/lib/prisma"
import { AdminDashboard } from "./admin-dashboard"

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    include: { variants: true, images: true }
  })
  const banners = await prisma.banner.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="container mx-auto px-4 py-12 pt-32">
      <div className="mb-8 border-b pb-4">
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-charcoal">
          Admin Dashboard
        </h1>
        <p className="text-slate mt-2">
          Manage your products, prices, and inventory in real-time. Changes are saved directly to the database.
        </p>
      </div>

      <AdminDashboard products={products} initialBanners={banners} />
    </div>
  )
}
