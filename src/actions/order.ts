"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createOrder(data: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "You must be logged in to place an order." }
    }

    const {
      items,
      totalAmount,
      shippingAmount,
      subtotalAmount,
      shippingAddress,
      phone,
      email,
      paymentMethod,
    } = data

    // Create the order in the database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        shippingAmount,
        subtotalAmount,
        shippingAddress,
        phone,
        email,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID", // Mock logic
        items: {
          create: items.map((item: any) => ({
            productId: item.product.id,
            variantId: item.variant.id,
            productName: item.product.name,
            variantName: `${item.variant.color} - ${item.variant.size}`,
            quantity: item.quantity,
            price: item.variant.salePrice || item.variant.price,
            image: item.variant.images?.[0]?.url || item.product.images?.[0]?.url || null,
          })),
        },
      },
    })

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error("Error creating order:", error)
    return { success: false, error: error.message || "Failed to create order" }
  }
}

export async function getUserOrders() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    })

    return { success: true, orders }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function getAllOrders() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    })

    return { success: true, orders }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    revalidatePath("/admin")
    revalidatePath("/account")
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update order status" }
  }
}
