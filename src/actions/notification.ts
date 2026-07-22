"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function getUserNotifications() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    // Delete notifications older than 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        createdAt: { lt: oneDayAgo }
      }
    });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, notifications }
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return { success: false, error: "Failed to fetch notifications" }
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const notification = await prisma.notification.findUnique({
      where: { id }
    })

    if (!notification || notification.userId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" }
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error marking notification read:", error)
    return { success: false, error: "Failed to mark as read" }
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error marking all notifications read:", error)
    return { success: false, error: "Failed to mark all as read" }
  }
}

export async function clearAllNotifications() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.notification.deleteMany({
      where: { userId: session.user.id }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error clearing notifications:", error)
    return { success: false, error: "Failed to clear notifications" }
  }
}
