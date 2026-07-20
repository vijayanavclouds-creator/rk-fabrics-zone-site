"use server"

import { v2 as cloudinary } from 'cloudinary'
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadProductImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const productId = formData.get("productId") as string
    const replacePrimary = formData.get("replacePrimary") === "true"
    
    if (!file || !productId) {
      return { success: false, error: "Missing file or product ID" }
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return { success: false, error: "Cloudinary credentials not configured in .env file" }
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`

    // Upload to cloudinary with automatic compression and resizing
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: "rk-fabrics/products",
      transformation: [
        { width: 1500, crop: "limit" }, // Don't allow images wider than 1500px
        { quality: "auto:good" },       // Automatically compress without visible quality loss
        { fetch_format: "auto" }        // Automatically convert to WebP/AVIF for modern browsers
      ]
    })

    // If replace primary, we need to mark old primary images as non-primary
    if (replacePrimary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false }
      })
    }

    await prisma.productImage.create({
      data: {
        url: result.secure_url,
        alt: file.name || "Product Image",
        isPrimary: replacePrimary,
        productId
      }
    })
    
    await syncDatabaseToStatic()

    revalidatePath("/admin")
    revalidatePath(`/product/[slug]`, "page")
    revalidatePath("/shop")

    return { success: true, url: result.secure_url }
  } catch (error: any) {
    console.error("Upload error:", error)
    return { success: false, error: error.message || "Upload failed" }
  }
}

export async function deleteProductImage(imageId: string) {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } })
    if (!image) return { success: false, error: "Image not found" }

    // If it's a cloudinary image, we can try to extract public_id and delete it
    // But for simplicity in this demo, we'll just delete from our database
    if (image.url.includes("cloudinary.com")) {
      const parts = image.url.split("/")
      const publicIdWithExt = parts[parts.length - 1]
      const publicId = publicIdWithExt.split(".")[0]
      await cloudinary.uploader.destroy(`rk-fabrics/products/${publicId}`)
    }

    await prisma.productImage.delete({ where: { id: imageId } })
    await syncDatabaseToStatic()
    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Delete error:", error)
    return { success: false, error: "Failed to delete image" }
  }
}

export async function setPrimaryProductImage(imageId: string, productId: string) {
  try {
    // Unset all
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false }
    })
    
    // Set new primary
    await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true }
    })
    
    await syncDatabaseToStatic()
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Set primary error:", error)
    return { success: false, error: "Failed to set primary image" }
  }
}

import fs from "fs"
import path from "path"

async function syncDatabaseToStatic() {
  try {
    const allProducts = await prisma.product.findMany({
      include: { variants: true, images: true, reviews: true }
    })
    
    const formattedProducts = allProducts.map(p => ({
      ...p,
      occasion: JSON.parse(p.occasion as string),
      tags: JSON.parse(p.tags as string),
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
