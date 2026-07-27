"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const checkAdmin = async () => {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function getAdminNotifications() {
  try {
    await checkAdmin()
    const notifications = await prisma.adminNotification.findMany({
      where: { type: { not: "PAYMENT_ALERT" } },
      orderBy: { createdAt: "desc" },
      take: 50 // Limit to recent 50
    })
    return { success: true, notifications }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function markAdminNotificationAsRead(id: string) {
  try {
    await checkAdmin()
    await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function markAllAdminNotificationsAsRead() {
  try {
    await checkAdmin()
    await prisma.adminNotification.updateMany({
      where: { isRead: false, type: { not: "PAYMENT_ALERT" } },
      data: { isRead: true }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function clearAllAdminNotifications() {
  try {
    await checkAdmin()
    await prisma.adminNotification.deleteMany({
      where: { type: { not: "PAYMENT_ALERT" } }
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ---------------- ALERTS & SETTINGS ----------------

export async function getAdminSettings() {
  try {
    await checkAdmin()
    let settings = await prisma.adminSettings.findUnique({
      where: { id: "singleton" }
    })
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: { id: "singleton", lateShippingThresholdHours: 6 }
      })
    }
    return { success: true, settings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateLateShippingThreshold(hours: number) {
  try {
    await checkAdmin()
    const settings = await prisma.adminSettings.upsert({
      where: { id: "singleton" },
      update: { lateShippingThresholdHours: hours },
      create: { id: "singleton", lateShippingThresholdHours: hours }
    })
    revalidatePath("/admin")
    return { success: true, settings }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getLateShippingAlerts() {
  try {
    await checkAdmin()
    let settings = await prisma.adminSettings.findUnique({
      where: { id: "singleton" }
    })
    const thresholdHours = settings?.lateShippingThresholdHours || 6

    const thresholdDate = new Date()
    thresholdDate.setHours(thresholdDate.getHours() - thresholdHours)

    // Find all orders that are not shipped, cancelled or delivered and were created before the threshold date
    const lateOrders = await prisma.order.findMany({
      where: {
        createdAt: { lt: thresholdDate },
        status: "PROCESSING"
      },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "asc" }
    })

    // Find all payment alerts
    const paymentAlerts = await prisma.adminNotification.findMany({
      where: {
        type: "PAYMENT_ALERT",
        isRead: false
      },
      orderBy: { createdAt: "desc" }
    })

    return { success: true, lateOrders, paymentAlerts, thresholdHours }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
