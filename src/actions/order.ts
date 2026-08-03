"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendOrderConfirmationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail, sendOrderCancelledEmail } from "@/lib/email"
import { logAdminActivity } from "./admin-activity"
import { getGSTRates } from "./system"

interface OrderItemInput {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variant: any;
  quantity: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product?: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createOrder(data: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "CUSTOMER" && session.user.role !== "ADMIN")) {
      return { success: false, error: "You must be logged in as a customer to place an order." }
    }

    const {
      items,
      totalAmount,
      shippingAmount,
      platformFeeAmount,
      subtotalAmount,
      shippingAddress,
      addressDetails, // Accept this for strict validation
      phone,
      email,
      paymentMethod,
      couponCode,
      discountAmount,
      shippingMode = "Surface",
    } = data

    // Required payment methods validation
    if (paymentMethod !== "COD" && paymentMethod !== "PHONEPE") {
      return { success: false, error: "Invalid payment method selected." }
    }

    // Required address fields validation
    if (
      !addressDetails ||
      !addressDetails.firstName ||
      !addressDetails.address ||
      !addressDetails.city ||
      !addressDetails.state ||
      !addressDetails.pincode ||
      !phone
    ) {
      return { success: false, error: "Delivery address is missing required fields (name, phone, address, city, state, or pincode)." }
    }

    // Server-side validation of the coupon to prevent tampering
    let validatedDiscount = 0
    let isSpecificCoupon = false;

    if (couponCode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coupon: any = await prisma.coupon.findUnique({ where: { code: couponCode } })
      
      // Use the exact same validation logic we built in validateCoupon
      if (!coupon || !coupon.isActive) {
        return { success: false, error: "Invalid or inactive promo code" }
      }

      if (coupon.expiresAt < new Date()) {
        return { success: false, error: "This promo code has expired" }
      }

      if (coupon.validForUserId) {
        if (coupon.isUsed) return { success: false, error: "This promo code has already been used" }
        if (coupon.validForUserId !== session.user.id) return { success: false, error: "This promo code is not valid for your account" }
        isSpecificCoupon = true;
      } else {
        const existingOrder = await prisma.order.findFirst({
          where: { userId: session.user.id, couponCode, status: { not: "CANCELLED" } }
        })
        if (existingOrder) return { success: false, error: "You have already used this promo code" }

        if (coupon.isForNewUsersOnly) {
          const pastOrder = await prisma.order.findFirst({
            where: { userId: session.user.id, status: "DELIVERED" }
          })
          if (pastOrder) return { success: false, error: "This promo code is only valid for new users" }
        }
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

      // Calculate GST based on the latest rates
      let calculatedGst = 0
      const rates = await getGSTRates()
      
      if (subtotalAmount > 0) {
        items.forEach((item: OrderItemInput) => {
          const originalPrice = item.variant.salePrice || item.variant.price
          const itemTotal = originalPrice * item.quantity
          const itemWeight = itemTotal / subtotalAmount
          const itemDiscount = validatedDiscount * itemWeight
          const finalItemTotal = itemTotal - itemDiscount
          const finalItemPrice = finalItemTotal / item.quantity
          
          const rate = finalItemPrice <= (rates.threshold ?? 2500) ? rates.belowThreshold : rates.aboveThreshold
          calculatedGst += finalItemTotal - (finalItemTotal / (1 + (rate / 100)))
        })
      }
      calculatedGst += ((platformFeeAmount || 0) + shippingAmount) - (((platformFeeAmount || 0) + shippingAmount) / 1.18)
      calculatedGst = Math.round(calculatedGst * 100) / 100

      // Securely recalculate the total (inclusive GST is already in subtotal/shipping/platformFee)
      const secureTotalAmount = Math.max(0, subtotalAmount + shippingAmount + (platformFeeAmount || 0) - validatedDiscount)
      
      // Make sure the frontend isn't lying about the total amount
      if (Math.abs(secureTotalAmount - totalAmount) > 2) {
        return { success: false, error: "Order total mismatch" }
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
          totalAmount: secureTotalAmount,
          shippingAmount,
          platformFeeAmount: platformFeeAmount || 0,
          gstAmount: calculatedGst,
          subtotalAmount,
          shippingAddress,
          phone,
          email,
          paymentMethod,
          couponCode,
          discountAmount: validatedDiscount,
          shippingMode,
          paymentStatus: paymentMethod === "PHONEPE" || paymentMethod === "COD" ? "PENDING" : "PAID", 
          items: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: items.map((item: any) => ({
              productId: item.product.id,
              variantId: item.variant.id,
              productName: item.product.name,
              variantName: `${item.variant.color} - ${item.variant.size}`,
              quantity: item.quantity,
              price: item.variant.salePrice || item.variant.price,
              image: item.variant.images?.[0]?.url || item.product.images?.[0]?.url || null,
              isReturnable: item.product.isReturnable ?? true,
            })),
          },
        },
      });

      // Decrement stock for each item
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const item of items as any[]) {
        await tx.productVariant.update({
          where: { id: item.variant.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Mark the coupon as used ONLY if it is a personal coupon
      if (couponCode && isSpecificCoupon) {
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
        // Await this to ensure the Node event loop handles it properly before returning
        await sendOrderConfirmationEmail(orderWithItems).catch(console.error);
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
          link: `/admin/orders/user/${session.user.id}?expanded=${order.id}#${order.id}`
        }
      });
    } catch (e) {
      console.error("Failed to create admin notification:", e);
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error("Error creating order:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create order" }
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
  } catch {
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function getAllOrders() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
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
  } catch {
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function getAdminUserOrders(userIdOrEmail: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
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
  } catch {
    return { success: false, error: "Failed to fetch orders" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.order.delete({
      where: { id: orderId }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error" }
  }
}

export async function updateOrderShippingMode(orderId: string, shippingMode: "Surface" | "Express") {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return { success: false, error: "Order not found" }
    }

    const rates = await getGSTRates()
    
    // Recalculate shipping amount
    let newShippingAmount = 0
    if (shippingMode === "Express") {
      newShippingAmount = rates.expressShippingFee ?? 150
    } else {
      newShippingAmount = existingOrder.subtotalAmount >= 999 ? 0 : (rates.shippingFee ?? 79)
    }

    const shippingDiff = newShippingAmount - existingOrder.shippingAmount
    const newTotalAmount = existingOrder.totalAmount + shippingDiff

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        shippingMode,
        shippingAmount: newShippingAmount,
        totalAmount: newTotalAmount
      }
    })

    revalidatePath("/admin")
    return { success: true, order }
  } catch {
    return { success: false, error: "Failed to update shipping mode" }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return { success: false, error: "Order not found" }
    }

    if (existingOrder.status === "DELIVERED" || existingOrder.status === "CANCELLED") {
      return { success: false, error: "Order status cannot be changed once delivered or cancelled" }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status }
    if (status === "SHIPPED") {
      updateData.shippedAt = new Date()
    } else if (status === "DELIVERED") {
      updateData.deliveredAt = new Date()
    } else if (status === "CANCELLED") {
      updateData.cancelledAt = new Date()
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { 
        items: true,
        user: { select: { receiveOrderEmails: true } } 
      }
    })

    if (updatedOrder.user.receiveOrderEmails) {
      if (status === "SHIPPED") {
        sendOrderShippedEmail(updatedOrder).catch(console.error);
      } else if (status === "DELIVERED") {
        sendOrderDeliveredEmail(updatedOrder).catch(console.error);
      } else if (status === "CANCELLED") {
        sendOrderCancelledEmail(updatedOrder).catch(console.error);
      }
    }

    revalidatePath("/admin")
    revalidatePath("/account")
    
    const diff = `changed status from <i>${existingOrder.status}</i> to <i>${status}</i>`;
    await logAdminActivity(`updated Order <b>#${updatedOrder.id.slice(-6).toUpperCase()}</b> status`, diff);
    
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update order status" }
  }
}

export async function cancelCustomerOrder(orderId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id }
    })

    if (!existingOrder) {
      return { success: false, error: "Order not found" }
    }

    if (existingOrder.status !== "CONFIRMED" && existingOrder.status !== "PROCESSING") {
      return { success: false, error: "This order cannot be cancelled anymore" }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: "CANCELLED",
        cancelledAt: new Date()
      },
      include: { 
        items: true,
        user: { select: { receiveOrderEmails: true } } 
      }
    })

    if (updatedOrder.user.receiveOrderEmails) {
      sendOrderCancelledEmail(updatedOrder).catch(console.error);
    }

    // Increment stock since order is cancelled
    await prisma.$transaction(
      updatedOrder.items.map(item => 
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } }
        })
      )
    );

    revalidatePath("/admin")
    revalidatePath("/account")
    
    return { success: true }
  } catch (error) {
    console.error("Error cancelling order:", error)
    return { success: false, error: "Failed to cancel order" }
  }
}

export async function toggleUserOrdersReadStatus(userIdOrEmail: string, isRead: boolean) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.order.updateMany({
      where: {
        OR: [
          { userId: userIdOrEmail },
          { email: userIdOrEmail }
        ]
      },
      data: { isReadByAdmin: isRead }
    })

    revalidatePath("/admin")
    
    return { success: true }
  } catch (error) {
    console.error("toggleUserOrdersReadStatus Error:", error)
    return { success: false, error: "Failed to update read status: " + (error instanceof Error ? error.message : "") }
  }
}
