import prisma from "@/lib/prisma"
import { AdminDashboard } from "@/app/admin/admin-dashboard"
import { getStoreTaxonomy } from "@/actions/system"
import { getContactQueries } from "@/actions/contact"
import { getDashboardAnalytics } from "@/actions/analytics"
import { Suspense } from "react"
import { AdminMobileHeader } from "@/components/layout/admin-mobile-header"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard | RK Fabrics",
  description: "RK Fabrics Administration Panel",
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const [
    products,
    banners,
    { categories, fabrics },
    queries,
    analyticsRes,
    returnRequests
  ] = await Promise.all([
    prisma.product.findMany({
      include: { variants: true, images: true }
    }),
    prisma.banner.findMany({
      orderBy: { order: 'asc' }
    }),
    getStoreTaxonomy(),
    getContactQueries(),
    getDashboardAnalytics(),
    prisma.returnRequest.findMany({
      include: { 
        order: { include: { items: true } }, 
        user: true 
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);
  const analyticsData = analyticsRes.success ? analyticsRes.data : null

  return (
    <>
      <AdminMobileHeader />
      <Suspense fallback={null}>
        <AdminDashboard 
          products={products} 
          initialBanners={banners} 
          storeCategories={categories}
          storeFabrics={fabrics}
          queries={queries}
          returnRequests={returnRequests}
          analyticsData={analyticsData}
        />
      </Suspense>
    </>
  )
}
