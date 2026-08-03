"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { sendReturnAcceptedEmail, sendReturnRejectedEmail, sendReturnInquiryEmail } from "@/lib/email"
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

export async function markReturnsAsRead(returnIds: string[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.returnRequest.updateMany({
      where: { id: { in: returnIds } },
      data: { isReadByAdmin: true }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    console.error("Error marking returns as read:", error)
    return { success: false, error: "Failed to mark returns as read" }
  }
}

export async function startReturnInquiry(returnId: string, initialMessage: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { 
        order: { include: { user: true } },
        user: true 
      }
    })

    if (!returnRequest || !returnRequest.orderId) {
      return { success: false, error: "Return request not found" }
    }

    const subject = `Return Inquiry for Order #${returnRequest.orderId.slice(-8).toUpperCase()}`;

    let query = await prisma.contactQuery.findFirst({
      where: { 
        orderId: returnRequest.orderId,
        subject: subject
      }
    });

    if (!query) {
      query = await prisma.contactQuery.create({
        data: {
          name: returnRequest.user?.name || "Customer",
          email: returnRequest.user?.email || "",
          phone: returnRequest.user?.phone || null,
          subject: subject,
          orderId: returnRequest.orderId,
          userId: returnRequest.userId,
          isRead: true,
          isReadByUser: false,
          status: "OPEN",
          messages: {
            create: {
              senderType: "ADMIN",
              message: initialMessage
            }
          }
        }
      });
      
      await sendReturnInquiryEmail(returnRequest.order, query.id);
    } else {
      await prisma.queryMessage.create({
        data: {
          queryId: query.id,
          senderType: "ADMIN",
          message: initialMessage
        }
      });
      
      await prisma.contactQuery.update({
        where: { id: query.id },
        data: { 
          isReadByUser: false, 
          status: "OPEN" 
        }
      });
    }

    if (returnRequest.userId) {
      await prisma.notification.create({
        data: {
          userId: returnRequest.userId,
          title: "New Message from Admin",
          message: `Admin sent you a message regarding your return for Order #${returnRequest.orderId.slice(-8).toUpperCase()}`,
          link: `/account/queries/${query.id}`,
          isRead: false,
        }
      });
    }
    
    await logAdminActivity(`started an inquiry for return request of order #${returnRequest.orderId.slice(-8).toUpperCase()}`);
    revalidatePath("/admin");

    return { success: true, queryId: query.id }
  } catch (error: any) {
    console.error("Error starting return inquiry:", error)
    return { success: false, error: error.message || "Failed to start return inquiry" }
  }
}

