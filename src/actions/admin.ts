"use server"

import prisma from "@/lib/prisma"
import { revalidatePath, unstable_cache, unstable_noStore } from "next/cache";
import fs from "fs"
import path from "path"
import { v2 as cloudinary } from "cloudinary"
import { getBannersData } from "@/lib/data/banners"
import { logAdminActivity } from "./admin-activity"
import { generateDiffString } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
    const isReturnable = formData.get("isReturnable") !== "false" // default true unless explicitly false
    const fabric = formData.get("fabric") as string
    const fabricDetails = formData.get("fabricDetails") as string || null

    if (!id || !name || !category || isNaN(basePrice)) {
      return { success: false, error: `Invalid input. ID: ${id}, Name: ${name}, Category: ${category}, Price: ${basePrice}` }
    }

    const salePrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : null
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4)

    const oldProduct = await prisma.product.findUnique({ where: { id } })
    
    const updateData = { 
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
      isOnSale,
      isReturnable,
      fabric,
      fabricDetails
    };

    await prisma.product.update({
      where: { id },
      data: updateData
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
    
    const diff = generateDiffString(oldProduct || {}, updateData, ['slug']);
    if (diff) {
      await logAdminActivity(`updated product <b>${name}</b>`, diff);
    } else {
      await logAdminActivity(`updated product <b>${name}</b>`);
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Error updating product:", error)
    return { success: false, error: error.message || "Failed to update product" }
  }
}

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const category = formData.get("category") as string || "women-ethnic"
    const basePrice = parseFloat(formData.get("basePrice") as string)
    const discountPercent = parseInt(formData.get("discountPercent") as string) || 0
    const fabric = formData.get("fabric") as string || "Silk"
    const fabricDetails = formData.get("fabricDetails") as string || null
    const isFreeDelivery = formData.get("isFreeDelivery") === "true"
    const isNewArrival = formData.get("isNewArrival") === "true"
    const isBestseller = formData.get("isBestseller") === "true"
    const isFeatured = formData.get("isFeatured") === "true"
    const isOnSale = formData.get("isOnSale") === "true"
    const isReturnable = formData.get("isReturnable") !== "false"

    if (!name || !category || isNaN(basePrice)) {
      return { success: false, error: "Invalid input" }
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4)
    const salePrice = discountPercent > 0 ? basePrice * (1 - discountPercent / 100) : null

    const newProduct = await prisma.product.create({
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
        isReturnable,
        fabric,
        fabricDetails,
        occasion: [],
        tags: [],
        rating: 0,
        reviewCount: 0
      }
    })

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath("/shop")
    
    await logAdminActivity(`created product <b>${name}</b>`);

    return { success: true, product: newProduct }
  } catch (error: any) {
    console.error("Error creating product:", error)
    return { success: false, error: error.message || "Failed to create product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    await prisma.product.delete({
      where: { id }
    })

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath("/shop")
    
    if (product) {
      await logAdminActivity(`deleted product <b>${product.name}</b>`);
    }
    
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
    
    if (product) {
      await logAdminActivity(`added variant to product <b>${product.name}</b>`);
    }
    
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
    
    if (variant?.product) {
      await logAdminActivity(`updated variant in product <b>${variant.product.name}</b>`);
    }
    
    return { success: true }
  } catch (error: any) {
    console.error("Error updating variant:", error)
    return { success: false, error: "Failed to update variant" }
  }
}

export async function deleteProductVariant(id: string) {
  try {
    const variant = await prisma.productVariant.findUnique({ where: { id }, include: { product: true } });
    await prisma.productVariant.delete({ where: { id } })
    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath(`/product/[slug]`, "page")
    
    if (variant?.product) {
      await logAdminActivity(`deleted variant from product <b>${variant.product.name}</b>`);
    }
    
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

export async function bulkUpdateImagesAndVariants(formData: FormData) {
  try {
    const fs = require('fs')
    fs.appendFileSync('./debug.log', `[${new Date().toISOString()}] bulkUpdateImagesAndVariants called\n`)

    const payloadStr = formData.get("payload") as string
    if (!payloadStr) return { success: false, error: "Missing payload" }
    const payload = JSON.parse(payloadStr)
    const { productId, newVariants, updatedVariants, deletedVariantIds, deletedImageIds, primaryImageId, newPrimaryIndex, uploadedImagesUrls } = payload
    
    fs.appendFileSync('./debug.log', `Payload: ${JSON.stringify({updatedVariants})}\n`)

    if (!productId) return { success: false, error: "Missing product ID" }
    
    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (deletedVariantIds?.length) {
      await prisma.productVariant.deleteMany({ where: { id: { in: deletedVariantIds } } })
      await logAdminActivity(`deleted <b>${deletedVariantIds.length} variant(s)</b> from <b>${product?.name}</b>`);
    }

    if (updatedVariants?.length) {
      for (const v of updatedVariants) {
        const oldVariant = await prisma.productVariant.findUnique({ where: { id: v.id } })
        if (oldVariant) {
          const variantName = [oldVariant.size, oldVariant.color].filter(Boolean).join(' / ') || 'Default'
          if (oldVariant.stock !== v.stock) {
            await logAdminActivity(`updated <b>Stock</b> for variant <b>${variantName}</b> in <b>${product?.name}</b> from <b>${oldVariant.stock}</b> to <b>${v.stock}</b>`);
          }
          if (oldVariant.price !== v.price) {
            await logAdminActivity(`updated <b>Price</b> for variant <b>${variantName}</b> in <b>${product?.name}</b> from <b>₹${oldVariant.price}</b> to <b>₹${v.price}</b>`);
          }
          if (oldVariant.size !== v.size) {
            await logAdminActivity(`updated <b>Size</b> for variant <b>${variantName}</b> in <b>${product?.name}</b> from <b>"${oldVariant.size}"</b> to <b>"${v.size}"</b>`);
          }
          if (oldVariant.color !== v.color) {
            await logAdminActivity(`updated <b>Color</b> for variant <b>${variantName}</b> in <b>${product?.name}</b> from <b>"${oldVariant.color}"</b> to <b>"${v.color}"</b>`);
          }
        }

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
      await logAdminActivity(`added <b>${newVariants.length} new variant(s)</b> to <b>${product?.name}</b>`);
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

    if (deletedImageIds && deletedImageIds.length > 0) {
      await prisma.productImage.deleteMany({ where: { id: { in: deletedImageIds } } })
      await logAdminActivity(`deleted <b>${deletedImageIds.length} image(s)</b> from <b>${product?.name}</b>`);
    }

    // Clear out existing primary flags if a new one is selected
    if (primaryImageId || newPrimaryIndex !== null) {
      await prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } })
    }

    const imagesToUpload = uploadedImagesUrls || []
    if (imagesToUpload && imagesToUpload.length > 0) {
      await logAdminActivity(`uploaded <b>${imagesToUpload.length} new image(s)</b> to <b>${product?.name}</b>`);
      for (let i = 0; i < imagesToUpload.length; i++) {
        const imgData = imagesToUpload[i]
        
        const isThisPrimary = newPrimaryIndex === i
        await prisma.productImage.create({
          data: {
            url: imgData.url,
            alt: imgData.name || "Product Image",
            isPrimary: isThisPrimary,
            productId
          }
        })
      }
    }
    
    await prisma.$transaction(async (tx) => {
      if (formData) {
        const category = formData.get("category") as string
        const fabric = formData.get("fabric") as string
        const fabricDetails = formData.get("fabricDetails") as string || null
        if (category || fabric) {
          await tx.product.update({
            where: { id: productId },
            data: { 
              ...(category ? { category } : {}),
              ...(fabric ? { fabric } : {}),
              fabricDetails
            }
          })
          if (product) {
            if (category && product.category !== category) await logAdminActivity(`updated <b>Category</b> in <b>${product.name}</b> from <b>${product.category}</b> to <b>${category}</b>`)
            if (fabric && product.fabric !== fabric) await logAdminActivity(`updated <b>Fabric</b> in <b>${product.name}</b> from <b>${product.fabric || 'none'}</b> to <b>${fabric}</b>`)
            if (fabricDetails && product.fabricDetails !== fabricDetails) await logAdminActivity(`updated <b>Fabric Details</b> in <b>${product.name}</b>`)
          }
        }
      }
    })

    // Assign existing primary image if selected
    if (primaryImageId && typeof primaryImageId === "string") {
      await prisma.productImage.update({ where: { id: primaryImageId }, data: { isPrimary: true } })
    }

    syncDatabaseToStatic()
    revalidatePath("/admin")
    revalidatePath(`/product/[slug]`, "page")
    
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true, images: true }
    })
    
    return { success: true, product: updatedProduct }
  } catch (error: any) {
    const fs = require('fs')
    fs.appendFileSync('./debug.log', `ERROR: ${error.message}\n${error.stack}\n`)
    console.error("Bulk save error:", error)
    return { success: false, error: error.message || "Failed to save images and variants" }
  }
}

// ========================
// BANNER ACTIONS
// ========================

export async function getBanners() {
  return getBannersData();
}

export async function getCloudinarySignature() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: "rk-fabrics/banners",
        use_filename: true,
        unique_filename: true
      },
      process.env.CLOUDINARY_API_SECRET!
    );
    
    return { 
      success: true,
      timestamp, 
      signature, 
      apiKey: process.env.CLOUDINARY_API_KEY, 
      cloudName: process.env.CLOUDINARY_CLOUD_NAME 
    };
  } catch (error: any) {
    console.error("Error generating signature:", error);
    return { success: false, error: "Failed to generate upload signature" };
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


    revalidatePath("/");
    revalidatePath("/admin");
    
    await logAdminActivity(`uploaded new ${type} banner`);
    
    return { success: true, banner }
  } catch (error: any) {
    console.error("Error creating banner:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteBanner(id: string) {
  try {
    await prisma.banner.delete({ where: { id } })

    revalidatePath("/");
    revalidatePath("/admin");
    
    await logAdminActivity(`deleted banner`);
    
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

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true }
  } catch (error: any) {
    console.error("Error updating banner order:", error)
    return { success: false, error: error.message }
  }
}

export async function getSystemUsage() {
  unstable_noStore();
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new Error("Cloudinary credentials not configured in .env file")
    }

    const usage = await cloudinary.api.usage()
    
    let vercelData = null;
    const vercelToken = process.env.API_VERCEL_ACCESS_TOKEN;
    
    if (vercelToken) {
      console.log("Found Vercel Token:", vercelToken.substring(0, 5) + "...");
      try {
        const vRes = await fetch("https://api.vercel.com/v2/user", {
          headers: { Authorization: `Bearer ${vercelToken}` },
          cache: "no-store"
        });
        console.log("Vercel API Status:", vRes.status);
        if (vRes.ok) {
          const vData = await vRes.json();
          console.log("Vercel API Data:", JSON.stringify(vData).substring(0, 50));
          vercelData = {
            username: vData.user.username,
            email: vData.user.email,
            plan: vData.user.billing?.plan || "hobby"
          };
        } else {
          console.error("Vercel API Error:", await vRes.text());
        }
      } catch (e) {
        console.error("Failed to fetch Vercel data", e);
      }
    } else {
      console.log("No Vercel token found in process.env");
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

export async function toggleProductStatus(productId: string, isActive: boolean) {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });
    
    // Revalidate paths where products are listed
    revalidatePath("/admin");
    revalidatePath("/shop");
    revalidatePath("/");
    
    return { success: true, product: updatedProduct };
  } catch (error: any) {
    console.error("Failed to toggle product status:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserRole(userId: string, newRole: "CUSTOMER" | "ADMIN" | "SUPPORT") {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    if (userId === session.user.id) {
      return { success: false, error: "You cannot change your own role" }
    }

    if (newRole === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
      if (adminCount >= 5) {
        return { success: false, error: "Maximum limit of 5 admin accounts reached." }
      }
    }

    const currentUser = await prisma.user.findUnique({ where: { id: userId } })
    if (currentUser?.role === "ADMIN" && newRole !== "ADMIN") {
      return { success: false, error: "Admin accounts cannot be demoted by other admins." }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    revalidatePath("/admin")
    
    const diff = `changed role from <i>${currentUser?.role}</i> to <i>${newRole}</i>`;
    await logAdminActivity(`updated role for user <b>${currentUser?.name || currentUser?.email || userId}</b>`, diff)

    return { success: true }
  } catch (error: any) {
    console.error("Error updating user role:", error)
    return { success: false, error: "Failed to update user role" }
  }
}

export async function globalAdminSearch(query: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    if (!query || query.length < 2) {
      return { success: true, results: { products: [], users: [], orders: [], newsletters: [] } }
    }

    const isRecentOrderQuery = query.toLowerCase() === 'recent order' || query.toLowerCase() === 'recent orders';

    const [products, users, orders, newsletters] = await Promise.all([
      isRecentOrderQuery ? Promise.resolve([]) : prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, name: true, slug: true, category: true, images: { take: 1, select: { url: true } } }
      }),
      isRecentOrderQuery ? Promise.resolve([]) : prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: { id: true, name: true, email: true, image: true, role: true }
      }),
      prisma.order.findMany({
        where: isRecentOrderQuery ? undefined : {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { user: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, status: true, totalAmount: true, createdAt: true, email: true, userId: true, user: { select: { name: true } } }
      }),
      isRecentOrderQuery ? Promise.resolve([]) : prisma.newsletterSubscriber.findMany({
        where: {
          email: { contains: query, mode: 'insensitive' }
        },
        take: 5,
        select: { id: true, email: true }
      })
    ]);

    return {
      success: true,
      results: { products, users, orders, newsletters }
    }
  } catch (error: any) {
    console.error("Global admin search error:", error)
    return { success: false, error: error.message }
  }
}
