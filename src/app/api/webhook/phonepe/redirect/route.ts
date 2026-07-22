import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const code = formData.get("code") // "PAYMENT_SUCCESS" or "PAYMENT_ERROR"
    const transactionId = formData.get("transactionId") as string

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    if (code === "PAYMENT_SUCCESS") {
      // LOCALHOST FALLBACK: PhonePe webhooks cannot reach localhost.
      // In development, we optimistically update the order status here so testing works smoothly.
      if (process.env.NODE_ENV === "development" && transactionId) {
        await prisma.order.update({
          where: { id: transactionId },
          data: { paymentStatus: "PAID" }
        })
        
        const order = await prisma.order.findUnique({ where: { id: transactionId }, include: { user: true } })
        if (order) {
          await prisma.adminNotification.create({
            data: {
              type: "PAYMENT_ALERT",
              message: `Payment received: ₹${order.totalAmount.toLocaleString()} for Order #${order.id.slice(-6).toUpperCase()} from ${order.user?.name || order.user?.email || 'Customer'}`,
              link: `/admin/orders/user/${order.userId}`
            }
          })
        }
      }

      return NextResponse.redirect(`${baseUrl}/checkout/success?orderId=${transactionId}`, 303)
    } else {
      return NextResponse.redirect(`${baseUrl}/checkout/failure?orderId=${transactionId}`, 303)
    }

  } catch (error) {
    console.error("PhonePe Redirect Error:", error)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/checkout/failure`, 303)
  }
}
