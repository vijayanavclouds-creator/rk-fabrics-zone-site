import { NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { sendOrderConfirmationEmail } from "@/lib/email"

const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const xVerify = req.headers.get("x-verify")

    if (!body.response || !xVerify) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }

    // Verify Checksum: sha256(responseBase64String + saltKey) + "###" + saltIndex
    const stringToHash = body.response + PHONEPE_SALT_KEY
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex")
    const expectedChecksum = `${sha256}###${PHONEPE_SALT_INDEX}`

    if (xVerify !== expectedChecksum) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
    }

    // Decode base64 response
    const decodedStr = Buffer.from(body.response, "base64").toString("utf8")
    const responseData = JSON.parse(decodedStr)

    const { merchantTransactionId, state, transactionId } = responseData.data

    if (merchantTransactionId) {
      // Find the order
      const order = await prisma.order.findUnique({
        where: { id: merchantTransactionId },
        include: { items: true }
      })

      if (order && order.paymentStatus !== "PAID") {
        let paymentStatus = "PENDING"
        if (state === "COMPLETED") {
          paymentStatus = "PAID"
        } else if (state === "FAILED") {
          paymentStatus = "FAILED"
        }

        await prisma.order.update({
          where: { id: merchantTransactionId },
          data: { 
            paymentStatus, 
            transactionId: transactionId || null,
            transactionDetails: JSON.stringify(responseData.data)
          }
        })

        // Send order confirmation email if PAID
        if (paymentStatus === "PAID") {
          await sendOrderConfirmationEmail(order)

          // Create a Payment Alert for Admin
          try {
            const user = await prisma.user.findUnique({ where: { id: order.userId }, select: { name: true, email: true } })
            const customerName = user?.name || user?.email || "Customer"
            await prisma.adminNotification.create({
              data: {
                type: "PAYMENT_ALERT",
                message: `Payment received: ₹${order.totalAmount.toLocaleString()} for Order #${order.id.slice(-6).toUpperCase()} from ${customerName}`,
                link: `/admin/orders/user/${order.userId}?expanded=${order.id}#${order.id}`
              }
            })
          } catch (err) {
            console.error("Failed to create payment alert:", err)
          }
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("PhonePe Webhook Error:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
