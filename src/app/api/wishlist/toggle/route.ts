import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await req.json()
    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 })
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      })
      revalidatePath("/wishlist")
      return NextResponse.json({ success: true, added: false })
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId
        }
      })
      revalidatePath("/wishlist")
      return NextResponse.json({ success: true, added: true })
    }
  } catch (error) {
    console.error("Failed to toggle wishlist in DB:", error)
    return NextResponse.json({ success: false, error: "Failed to update wishlist" }, { status: 500 })
  }
}
