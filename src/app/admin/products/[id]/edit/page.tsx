import prisma from "@/lib/prisma"
import { getStoreTaxonomy } from "@/actions/system"
import { ProductEditor } from "@/app/admin/admin-dashboard"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const { id } = await params
  
  const [product, { categories, fabrics }, products] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true }
    }),
    getStoreTaxonomy(),
    prisma.product.findMany({ select: { id: true, name: true } }) 
  ])

  if (!product) {
    redirect("/admin")
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="w-full mx-auto md:p-8 space-y-4 pb-24 md:pb-8">
        <ProductEditor 
        product={product} 
        products={products}
        storeCategories={categories}
        storeFabrics={fabrics}
      />
      </div>
    </div>
  )
}
