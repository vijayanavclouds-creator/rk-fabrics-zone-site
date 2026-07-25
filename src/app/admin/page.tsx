import prisma from "@/lib/prisma"
import { AdminDashboard } from "@/app/admin/admin-dashboard"
import { getStoreTaxonomy } from "@/actions/system"
import { getContactQueries } from "@/actions/contact"
import { getDashboardAnalytics } from "@/actions/analytics"
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/account")
  }

  const [products, banners] = await Promise.all([
    prisma.product.findMany({
      include: { variants: true, images: true }
    }),
    prisma.banner.findMany({
      orderBy: { order: 'asc' }
    })
  ]);
  const [{ categories, fabrics }, queries, analyticsRes] = await Promise.all([
    getStoreTaxonomy(),
    getContactQueries(),
    getDashboardAnalytics()
  ]);
  const analyticsData = analyticsRes.success ? analyticsRes.data : null

  return (
    <Suspense fallback={null}>
      <AdminDashboard 
        products={products} 
        initialBanners={banners} 
        storeCategories={categories}
        storeFabrics={fabrics}
        queries={queries}
        analyticsData={analyticsData}
      />
    </Suspense>
  )
}
