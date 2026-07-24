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

  const products = await prisma.product.findMany({
    include: { variants: true, images: true }
  })
  const banners = await prisma.banner.findMany({
    orderBy: { order: 'asc' }
  })
  const { categories, fabrics } = await getStoreTaxonomy()
  const queries = await getContactQueries()
  const analyticsRes = await getDashboardAnalytics()
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
