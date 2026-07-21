"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from "@/lib/email"

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
      platformFeeAmount,
      subtotalAmount,
      shippingAddress,
      phone,
      email,
      paymentMethod,
      couponCode,
      discountAmount,
    } = data

    // Server-side validation of the coupon to prevent tampering
    let validatedDiscount = 0
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (!coupon || coupon.isUsed || coupon.validForUserId !== session.user.id || coupon.expiresAt < new Date()) {
        return { success: false, error: "Invalid or expired promo code" }
      }
      
      // Calculate the actual discount expected
      if (coupon.discountType === "PERCENTAGE") {
        validatedDiscount = (subtotalAmount * coupon.discountValue) / 100
      } else {
        validatedDiscount = coupon.discountValue
      }
      
      // Make sure the frontend isn't lying about the discount
      if (Math.abs(validatedDiscount - discountAmount) > 1) {
        return { success: false, error: "Promo code discount mismatch" }
      }
    }

    // Verify stock before proceeding
    for (const item of items) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variant.id },
        select: { stock: true }
      });
      
      if (!variant) {
        return { success: false, error: `Variant for ${item.product.name} no longer exists.` };
      }
      
      if (variant.stock < item.quantity) {
        return { success: false, error: `Not enough stock for ${item.product.name} (${item.variant.color} - ${item.variant.size}). Only ${variant.stock} left.` };
      }
    }

    // Use a transaction to create the order and decrement stock atomically
    const order = await prisma.$transaction(async (tx) => {
      // Create the order in the database
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          totalAmount,
          shippingAmount,
          platformFeeAmount: platformFeeAmount || 0,
          subtotalAmount,
          shippingAddress,
          phone,
          email,
          paymentMethod,
          couponCode,
          discountAmount: validatedDiscount,
          paymentStatus: paymentMethod === "PHONEPE" || paymentMethod === "COD" ? "PENDING" : "PAID", 
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
      });

      // Decrement stock for each item
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variant.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Mark the coupon as used if one was applied
      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: { isUsed: true }
        });
      }

      return newOrder;
    });

    // Send email confirmation immediately for COD orders
    if (paymentMethod === "COD") {
      // Re-fetch order with items to match email template structure
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true }
      });
      if (orderWithItems) {
        // We don't await this so it doesn't block the UI response
        sendOrderConfirmationEmail(orderWithItems).catch(console.error);
      }
    }

    // Revalidate paths so the shop shows updated stock
    revalidatePath("/shop");
    revalidatePath("/admin");
    revalidatePath(`/product/${items[0]?.product?.slug}`);

    // Create an Admin Notification
    try {
      await prisma.adminNotification.create({
        data: {
          type: "ORDER",
          message: `New order placed by ${session.user.name || email} for ₹${totalAmount.toLocaleString()}`,
          link: `/admin/orders/user/${session.user.id}`
        }
      });
    } catch (e) {
      console.error("Failed to create admin notification:", e);
    }

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
        user: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    })

    return { success: true, orders }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function getAdminUserOrders(userIdOrEmail: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: userIdOrEmail },
          { email: userIdOrEmail }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, createdAt: true } },
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

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true } // Need items for the email
    })

    if (status === "SHIPPED") {
      // Don't await to avoid blocking response
      sendOrderShippedEmail(updatedOrder).catch(console.error);
    }

    revalidatePath("/admin")
    revalidatePath("/account")
    
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to update order status" }
  }
}
