import prisma from "@/lib/prisma"
import { AdminDashboard } from "@/app/admin/admin-dashboard"
import { getStoreTaxonomy } from "@/actions/system"
import { getContactQueries } from "@/actions/contact"
import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AccountAdminPage() {
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

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">

      <Suspense fallback={<div className="animate-pulse h-96 bg-charcoal/5 rounded-3xl"></div>}>
        <AdminDashboard 
          products={products} 
          initialBanners={banners} 
          storeCategories={categories}
          storeFabrics={fabrics}
          queries={queries}
        />
      </Suspense>
    </div>
  )
}
