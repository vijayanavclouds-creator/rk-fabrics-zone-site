"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function updateProduct(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const basePrice = parseFloat(formData.get("basePrice") as string)
    const discountPercent = parseInt(formData.get("discountPercent") as string) || 0
    const isFreeDelivery = formData.get("isFreeDelivery") === "true"
    const isNewArrival = formData.get("isNewArrival") === "true"
    const isBestseller = formData.get("isBestseller") === "true"
    const isFeatured = formData.get("isFeatured") === "true"
    const isOnSale = formData.get("isOnSale") === "true"

    if (!id || !name || !category || isNaN(basePrice)) {
      return { success: false, error: `Invalid input. ID: ${id}, Name: ${name}, Category: ${category}, Price: ${basePrice}` }
    }

    const salePrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : null
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4)

    await prisma.product.update({
      where: { id },
      data: { 
        name,
        category,
        slug,
        basePrice,
        salePrice,
        discountPercent,
        isFreeDelivery,
        isNewArrival,
        isBestseller,
        isFeatured,
        isOnSale
      }
    })

    // Update all variants to inherit the new salePrice logic if they relied on the basePrice
    // Actually, to be safe, we let variants maintain their own price/salePrice, but we can update salePrice for them
    const variants = await prisma.productVariant.findMany({ where: { productId: id } })
    for (const v of variants) {
      const vSalePrice = discountPercent > 0 ? v.price * (1 - discountPercent / 100) : null;
      await prisma.productVariant.update({
        where: { id: v.id },
        data: { salePrice: vSalePrice }
      })
    }
    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath("/shop")
    revalidatePath(`/product/[slug]`, "page")
    
    return { success: true }
  } catch (error: any) {
    console.error("Error updating product:", error)
    return { success: false, error: error.message || "Failed to update product" }
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const category = formData.get("category") as string
    const basePrice = parseFloat(formData.get("basePrice") as string)
    const stock = parseInt(formData.get("stock") as string)
    const discountPercent = parseInt(formData.get("discountPercent") as string) || 0
    const isFreeDelivery = formData.get("isFreeDelivery") === "true"
    const isNewArrival = formData.get("isNewArrival") === "true"
    const isBestseller = formData.get("isBestseller") === "true"
    const isFeatured = formData.get("isFeatured") === "true"
    const isOnSale = formData.get("isOnSale") === "true"
    const size = formData.get("size") as string || "Free Size"
    const color = formData.get("color") as string || "Default"

    if (!name || !category || isNaN(basePrice) || isNaN(stock)) {
      return { success: false, error: "Invalid input" }
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4)
    const salePrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : null

    await prisma.product.create({
      data: {
        name,
        slug,
        description: "New product description",
        shortDescription: "Short description",
        category,
        gender: "women",
        type: "readymade",
        basePrice,
        salePrice,
        discountPercent,
        isFreeDelivery,
        isNewArrival,
        isBestseller,
        isFeatured,
        isOnSale,
        fabric: "Cotton",
        occasion: "[]",
        tags: "[]",
        rating: 0,
        reviewCount: 0,
        variants: {
          create: [{
            sku: slug.toUpperCase() + "-01",
            size,
            color,
            colorHex: "#000000",
            price: basePrice,
            salePrice,
            stock
          }]
        }
      }
    })

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath("/shop")
    
    return { success: true }
  } catch (error: any) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message || "Failed to create product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    })

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath("/shop")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}

export async function createProductVariant(formData: FormData) {
  try {
    const productId = formData.get("productId") as string
    const size = formData.get("size") as string
    const color = formData.get("color") as string
    const colorHex = formData.get("colorHex") as string || "#000000"
    const price = parseFloat(formData.get("price") as string)
    const stock = parseInt(formData.get("stock") as string)
    const sku = formData.get("sku") as string || `VAR-${Date.now().toString().slice(-6)}`

    if (!productId || !size || !color || isNaN(price) || isNaN(stock)) {
      return { success: false, error: "Invalid input" }
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    const salePrice = product && product.discountPercent > 0 
      ? price * (1 - product.discountPercent / 100) 
      : null;

    await prisma.productVariant.create({
      data: {
        productId,
        sku,
        size,
        color,
        colorHex,
        price,
        salePrice,
        stock
      }
    })

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath(`/product/[slug]`, "page")
    return { success: true }
  } catch (error: any) {
    console.error("Error creating variant:", error)
    return { success: false, error: error.message || "Failed to create variant" }
  }
}

export async function updateProductVariant(formData: FormData) {
  try {
    const id = formData.get("id") as string
    const size = formData.get("size") as string
    const color = formData.get("color") as string
    const price = parseFloat(formData.get("price") as string)
    const stock = parseInt(formData.get("stock") as string)

    if (!id || !size || !color || isNaN(price) || isNaN(stock)) {
      return { success: false, error: "Invalid input" }
    }

    const variant = await prisma.productVariant.findUnique({ where: { id }, include: { product: true } })
    const salePrice = variant?.product.discountPercent && variant.product.discountPercent > 0 
      ? price * (1 - variant.product.discountPercent / 100) 
      : null;

    await prisma.productVariant.update({
      where: { id },
      data: { size, color, price, salePrice, stock }
    })

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath(`/product/[slug]`, "page")
    return { success: true }
  } catch (error) {
    console.error("Error updating variant:", error)
    return { success: false, error: "Failed to update variant" }
  }
}

export async function deleteProductVariant(id: string) {
  try {
    await prisma.productVariant.delete({ where: { id } })
    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath(`/product/[slug]`, "page")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete variant" }
  }
}

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

export async function bulkUpdateImagesAndVariants(formData: FormData) {
  try {
    const payloadStr = formData.get("payload") as string
    if (!payloadStr) return { success: false, error: "Missing payload" }
    const payload = JSON.parse(payloadStr)
    const { productId, newVariants, updatedVariants, deletedVariantIds, deletedImageIds, primaryImageId, newPrimaryIndex } = payload

    if (!productId) return { success: false, error: "Missing product ID" }
    
    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (deletedVariantIds?.length) {
      await prisma.productVariant.deleteMany({ where: { id: { in: deletedVariantIds } } })
    }

    if (updatedVariants?.length) {
      for (const v of updatedVariants) {
        const salePrice = product && product.discountPercent > 0 
          ? v.price * (1 - product.discountPercent / 100) 
          : null;
        await prisma.productVariant.update({
          where: { id: v.id },
          data: { size: v.size, color: v.color, colorHex: v.colorHex || "#000000", price: v.price, stock: v.stock, salePrice }
        })
      }
    }

    if (newVariants?.length) {
      for (const v of newVariants) {
        const salePrice = product && product.discountPercent > 0 
          ? v.price * (1 - product.discountPercent / 100) 
          : null;
        await prisma.productVariant.create({
          data: {
            productId,
            sku: v.sku || `VAR-${Date.now().toString().slice(-6)}`,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || "#000000",
            price: v.price,
            stock: v.stock,
            salePrice
          }
        })
      }
    }

    if (deletedImageIds?.length) {
      await prisma.productImage.deleteMany({ where: { id: { in: deletedImageIds } } })
    }

    const files = formData.getAll("images") as File[]
    if (files && files.length > 0) {
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
        throw new Error("Cloudinary credentials not configured in .env file")
      }
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`

        const result = await cloudinary.uploader.upload(base64Data, {
          folder: "rk-fabrics/products",
          transformation: [
            { width: 1500, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        })
        
        const isThisPrimary = newPrimaryIndex === i
        await prisma.productImage.create({
          data: {
            url: result.secure_url,
            alt: file.name || "Product Image",
            isPrimary: isThisPrimary,
            productId
          }
        })
      }
    }

    if (primaryImageId && typeof primaryImageId === "string") {
      await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } })
      await prisma.productImage.update({ where: { id: primaryImageId }, data: { isPrimary: true } })
    } else if (newPrimaryIndex !== undefined && newPrimaryIndex !== null) {
      await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } })
      // The new primary was just created as primary above.
    }

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath(`/product/[slug]`, "page")
    
    return { success: true }
  } catch (error: any) {
    console.error("Bulk save error:", error)
    return { success: false, error: error.message || "Failed to save images and variants" }
  }
}

// ========================
// BANNER ACTIONS
// ========================

export async function getBanners() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' }
    })
    return { success: true, banners }
  } catch (error: any) {
    console.error("Error fetching banners:", error)
    return { success: false, error: error.message }
  }
}

export async function uploadBannerImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) return { success: false, error: "No file provided" }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadPromise = new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: "rk-fabrics/banners",
          transformation: [
            { width: 1920, height: 1080, crop: "limit" },
            { quality: "auto:eco" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const result = await uploadPromise as any
    return { success: true, url: result.secure_url }
  } catch (error: any) {
    console.error("Error uploading banner image:", error)
    return { success: false, error: "Upload failed" }
  }
}

export async function createBanner(formData: FormData) {
  try {
    const type = formData.get("type") as string
    const imageUrl = formData.get("imageUrl") as string
    const title = formData.get("title") as string || null
    const subtitle = formData.get("subtitle") as string || null
    const link = formData.get("link") as string || null

    if (!type || !imageUrl) {
      return { success: false, error: "Type and image URL are required" }
    }

    const count = await prisma.banner.count({ where: { type } })
    
    if (count >= 7) {
      return { success: false, error: `Maximum 7 images allowed for ${type} section.` }
    }

    const banner = await prisma.banner.create({
      data: {
        type,
        imageUrl,
        title,
        subtitle,
        link,
        order: count,
      }
    })

    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true, banner }
  } catch (error: any) {
    console.error("Error creating banner:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({ where: { id } })
    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting banner:", error)
    return { success: false, error: error.message }
  }
}

export async function updateBannerOrder(orderedIds: string[]) {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.banner.update({
        where: { id: orderedIds[i] },
        data: { order: i }
      })
    }
    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating banner order:", error)
    return { success: false, error: error.message }
  }
}

export async function getSystemUsage() {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new Error("Cloudinary credentials not configured in .env file")
    }

    const usage = await cloudinary.api.usage()
    
    let vercelData = null;
    const vercelToken = process.env.VERCEL_ACCESS_TOKEN;
    
    if (vercelToken) {
      try {
        const vRes = await fetch("https://api.vercel.com/v2/user", {
          headers: { Authorization: `Bearer ${vercelToken}` }
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          vercelData = {
            username: vData.user.username,
            email: vData.user.email,
            plan: vData.user.billing?.plan || "hobby"
          };
        }
      } catch (e) {
        console.error("Failed to fetch Vercel data", e);
      }
    }

    return {
      success: true,
      data: {
        cloudinary: {
          plan: usage.plan,
          storageUsage: usage.storage?.usage || 0,
          bandwidthUsage: usage.bandwidth?.usage || 0,
          creditsUsage: usage.credits?.usage || 0,
          creditsLimit: usage.credits?.limit || 0,
        },
        vercel: vercelData
      }
    }
  } catch (error: any) {
    console.error("Error fetching system usage:", error)
    return { success: false, error: error.message || "Failed to load usage data" }
  }
}

export async function getFileSize(url: string) {
  try {
    const res = await fetch(url, { method: "HEAD" })
    const bytes = res.headers.get("content-length")
    return bytes ? parseInt(bytes, 10) : null
  } catch (error) {
    return null
  }
}

export async function updateBannerTitle(id: string, title: string) {
  try {
    await prisma.banner.update({
      where: { id },
      data: { title }
    })
    revalidatePath("/")
    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
