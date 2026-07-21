"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendCouponEmail } from "@/lib/email"

export async function createCoupon(data: {
  discountValue: number;
  discountType: "PERCENTAGE" | "FIXED";
  validForUserId: string;
  expiresInDays: number;
  sendEmail: boolean;
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const { discountValue, discountType, validForUserId, expiresInDays, sendEmail } = data
    
    // Generate a unique 8-character code
    const code = "RK" + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const user = await prisma.user.findUnique({ where: { id: validForUserId } })
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountValue,
        discountType,
        validForUserId,
        expiresAt,
      }
    })

    if (sendEmail && user.email) {
      await sendCouponEmail(user.email, user.name || "Customer", code, discountValue, discountType, expiresAt)
    } else {
      // If we don't send an email, always send an in-app notification
      const discountText = discountType === "PERCENTAGE" ? `${discountValue}% OFF` : `₹${discountValue} OFF`
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "You have a new offer!",
          message: `Get ${discountText} on your next order with promo code: ${code}. Valid until ${expiresAt.toLocaleDateString()}.`
        }
      })
    }

    return { success: true, coupon }
  } catch (error: any) {
    console.error("Error creating coupon:", error)
    return { success: false, error: error.message || "Failed to create coupon" }
  }
}

export async function validateCoupon(code: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code }
    })

    if (!coupon) {
      return { success: false, error: "Invalid promo code" }
    }

    if (coupon.isUsed) {
      return { success: false, error: "This promo code has already been used" }
    }

    if (coupon.expiresAt < new Date()) {
      return { success: false, error: "This promo code has expired" }
    }

    if (coupon.validForUserId !== session.user.id) {
      return { success: false, error: "This promo code is not valid for your account" }
    }

    return { 
      success: true, 
      coupon: {
        code: coupon.code,
        discountValue: coupon.discountValue,
        discountType: coupon.discountType
      }
    }
  } catch (error: any) {
    return { success: false, error: "Failed to validate coupon" }
  }
}
