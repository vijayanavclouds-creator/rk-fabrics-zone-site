"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendCouponEmail } from "@/lib/email"
import { logAdminActivity } from "./admin-activity"

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

    const diff = `assigned to user <b>${user.name || user.email}</b>, type: <i>${discountType}</i>, expires in <i>${expiresInDays} days</i>`;
    await logAdminActivity(`created coupon <b>${code}</b> for <b>${discountValue}</b> off`, diff);

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

    if (!coupon.isActive) {
      return { success: false, error: "This promo code is no longer active" }
    }

    if (coupon.expiresAt < new Date()) {
      return { success: false, error: "This promo code has expired" }
    }

    if (coupon.validForUserId) {
      // Personal coupon logic
      if (coupon.isUsed) {
        return { success: false, error: "This promo code has already been used" }
      }
      if (coupon.validForUserId !== session.user.id) {
        return { success: false, error: "This promo code is not valid for your account" }
      }
    } else {
      // Global coupon logic
      const existingOrder = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          couponCode: code,
          status: { not: "CANCELLED" }
        }
      })
      if (existingOrder) {
        return { success: false, error: "You have already used this promo code" }
      }

      if (coupon.isForNewUsersOnly) {
        const pastOrder = await prisma.order.findFirst({
          where: {
            userId: session.user.id,
            status: "DELIVERED"
          }
        })
        if (pastOrder) {
          return { success: false, error: "This promo code is only valid for new users" }
        }
      }
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

export async function createGlobalCoupon(data: {
  discountValue: number;
  discountType: "PERCENTAGE" | "FIXED";
  expiresInDays: number;
  isForNewUsersOnly: boolean;
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const { discountValue, discountType, expiresInDays, isForNewUsersOnly } = data
    
    // Generate a unique 8-character code
    const code = "G" + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountValue,
        discountType,
        isForNewUsersOnly,
        expiresAt,
        isActive: true,
      }
    })

    const diff = `type: <i>${discountType}</i>, expires in <i>${expiresInDays} days</i>, new users only: <i>${isForNewUsersOnly}</i>`;
    await logAdminActivity(`created global coupon <b>${code}</b> for <b>${discountValue}</b> off`, diff);

    return { success: true, coupon }
  } catch (error: any) {
    console.error("Error creating global coupon:", error)
    return { success: false, error: error.message || "Failed to create global coupon" }
  }
}

export async function getGlobalCoupons() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        validForUserId: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, coupons }
  } catch (error: any) {
    console.error("Error getting global coupons:", error)
    return { success: false, error: "Failed to load global coupons" }
  }
}

export async function getAllAdminCoupons() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { success: true, coupons }
  } catch (error: any) {
    console.error("Error getting all coupons:", error)
    return { success: false, error: "Failed to load coupons" }
  }
}

export async function deactivateGlobalCoupon(couponId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false }
    })

    await logAdminActivity(`deactivated global coupon <b>${coupon.code}</b>`);

    return { success: true, coupon }
  } catch (error: any) {
    console.error("Error deactivating coupon:", error)
    return { success: false, error: "Failed to deactivate coupon" }
  }
}

export async function getGlobalCouponStats() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const globalCoupons = await prisma.coupon.findMany({
      where: { validForUserId: null }
    })

    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } })

    const usersWithDeliveredOrders = await prisma.order.groupBy({
      by: ['userId'],
      where: { status: "DELIVERED" }
    })
    
    const newUsersCount = totalUsers - usersWithDeliveredOrders.length

    const allUsedOrders = await prisma.order.findMany({
      where: { 
        couponCode: { not: null },
        status: { not: "CANCELLED" }
      },
      select: { userId: true, couponCode: true }
    })

    const stats: Record<string, { usedCount: number, eligibleCount: number }> = {}

    for (const coupon of globalCoupons) {
      const eligibleCount = coupon.isForNewUsersOnly ? newUsersCount : totalUsers
      
      const uniqueUsersUsed = new Set(
        allUsedOrders
          .filter(o => o.couponCode === coupon.code)
          .map(o => o.userId)
      ).size

      stats[coupon.code] = {
        usedCount: uniqueUsersUsed,
        eligibleCount: eligibleCount > 0 ? eligibleCount : 0
      }
    }

    return { success: true, stats }
  } catch (error: any) {
    console.error("Error getting coupon stats:", error)
    return { success: false, error: "Failed to load coupon stats" }
  }
}

export async function getCouponUsageDetails(couponCode: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
    if (!coupon) return { success: false, error: "Coupon not found" }

    const usedOrders = await prisma.order.findMany({
      where: { couponCode: couponCode, status: { not: "CANCELLED" } },
      select: { userId: true }
    })
    const usedUserIds = new Set(usedOrders.map(o => o.userId))

    let deliveredUserIds = new Set<string>()
    if (coupon.isForNewUsersOnly) {
      const deliveredOrders = await prisma.order.findMany({
        where: { status: "DELIVERED" },
        select: { userId: true }
      })
      deliveredUserIds = new Set(deliveredOrders.map(o => o.userId))
    }

    return { 
      success: true, 
      usedUserIds: Array.from(usedUserIds),
      ineligibleUserIds: Array.from(deliveredUserIds),
      isForNewUsersOnly: coupon.isForNewUsersOnly
    }
  } catch (error: any) {
    console.error("Error getting coupon usage details:", error)
    return { success: false, error: "Failed to load usage details" }
  }
}
