"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendReturnAcceptedEmail, sendReturnRejectedEmail } from "@/lib/email"
import { logAdminActivity } from "./admin-activity"

export async function markReturnCompleted(returnId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: { include: { user: true } } }
    })

    if (!returnRequest) {
      return { success: false, error: "Return request not found" }
    }

    // Update return request status
    await prisma.returnRequest.update({
      where: { id: returnId },
      data: { status: "RETURNED" }
    })

    // Update order status
    await prisma.order.update({
      where: { id: returnRequest.orderId },
      data: { status: "RETURNED" }
    })

    // Log admin activity
    await logAdminActivity(session.user.name || "Admin", `Accepted return for order #${returnRequest.orderId.slice(-8).toUpperCase()}`)

    // Send email to customer
    await sendReturnAcceptedEmail(returnRequest.order)

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Error marking return completed:", error)
    return { success: false, error: error.message || "Failed to mark return as completed" }
  }
}

export async function rejectReturn(returnId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: { include: { user: true } } }
    })

    if (!returnRequest) {
      return { success: false, error: "Return request not found" }
    }

    // Update return request status
    await prisma.returnRequest.update({
      where: { id: returnId },
      data: { status: "RETURN_REJECTED" }
    })

    // Revert order status back to DELIVERED
    await prisma.order.update({
      where: { id: returnRequest.orderId },
      data: { status: "DELIVERED" }
    })

    // Log admin activity
    await logAdminActivity(session.user.name || "Admin", `Rejected return for order #${returnRequest.orderId.slice(-8).toUpperCase()}`)

    // Send email to customer
    await sendReturnRejectedEmail(returnRequest.order, reason)

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Error rejecting return:", error)
    return { success: false, error: error.message || "Failed to reject return" }
  }
}
