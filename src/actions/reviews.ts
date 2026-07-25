"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function addReview(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { success: false, error: "Unauthorized" }
    }

    const productId = formData.get("productId") as string
    const userName = session.user.name || "Verified Buyer"
    const rating = parseInt(formData.get("rating") as string)
    const comment = formData.get("comment") as string

    if (!productId || isNaN(rating) || !comment) {
      return { success: false, error: "Missing required fields" }
    }

    // Insert review into the database
    await prisma.review.create({
      data: {
        productId,
        userName,
        rating,
        comment,
      }
    })

    // Create an Admin Notification
    try {
      const productForNotification = await prisma.product.findUnique({
        where: { id: productId },
        select: { name: true, slug: true }
      });
      if (productForNotification) {
        await prisma.adminNotification.create({
          data: {
            type: "REVIEW",
            message: `New ${rating}-star review from ${userName} on ${productForNotification.name}`,
            link: `/product/${productForNotification.slug}`
          }
        });
      }
    } catch (e) {
      console.error("Failed to create admin notification:", e);
    }
    
    // Update product rating and review count
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { reviews: true }
    })
    
    if (product) {
      const newCount = product.reviews.length
      const newRating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / newCount
      
      await prisma.product.update({
        where: { id: productId },
        data: {
          rating: newRating,
          reviewCount: newCount
        }
      })
    }

    syncDatabaseToStatic()
    revalidatePath(`/product/[slug]`, "page")
    
    return { success: true }
  } catch (error) {
    console.error("Error adding review:", error)
    return { success: false, error: "Failed to submit review" }
  }
}

async function syncDatabaseToStatic() {
  try {
    const allProducts = await prisma.product.findMany({
      include: { variants: true, images: true, reviews: true }
    })
    
    const formattedProducts = allProducts.map(p => ({
      ...p,
      occasion: p.occasion,
      tags: p.tags,
    }))

    const dataFile = path.join(process.cwd(), 'src', 'lib', 'data.ts')
    const currentData = fs.readFileSync(dataFile, 'utf8')
    
    const updatedData = currentData.replace(
      /export const products: Product\[\] = \[[\s\S]*?\];/,
      `export const products: Product[] = ${JSON.stringify(formattedProducts, null, 2)};`
    )

    fs.writeFileSync(dataFile, updatedData)
  } catch (err) {
    console.error("Sync failed:", err)
  }
}
