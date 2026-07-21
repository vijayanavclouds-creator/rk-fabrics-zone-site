"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function syncWishlist(localProductIds: string[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, items: localProductIds }

    // Get current DB items
    const dbItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: { productId: true }
    })
    
    const dbProductIds = dbItems.map(item => item.productId)
    
    // Items to add to DB (in local but not in DB)
    const newItems = localProductIds.filter(id => !dbProductIds.includes(id))
    
    if (newItems.length > 0) {
      // SQLite doesn't support createMany with skipDuplicates
      // So we'll iterate and create each one safely
      for (const productId of newItems) {
        try {
          await prisma.wishlistItem.create({
            data: {
              userId: session.user.id,
              productId
            }
          })
        } catch (e) {
          // Ignore unique constraint violations
        }
      }
    }

    // Merge for client
    const mergedItems = Array.from(new Set([...dbProductIds, ...localProductIds]))
    return { success: true, items: mergedItems }
  } catch (error) {
    console.error("Failed to sync wishlist:", error)
    return { success: false, items: localProductIds }
  }
}

export async function toggleWishlistDb(productId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

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
      return { success: true, added: false }
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId
        }
      })
      revalidatePath("/wishlist")
      return { success: true, added: true }
    }
  } catch (error) {
    console.error("Failed to toggle wishlist in DB:", error)
    return { success: false, error: "Failed to update wishlist" }
  }
}
