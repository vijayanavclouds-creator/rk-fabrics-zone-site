"use server"

import crypto from "crypto"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT"
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1"
const PHONEPE_ENV = process.env.PHONEPE_ENV || "UAT"

const PHONEPE_URL = PHONEPE_ENV === "PROD" 
  ? "https://api.phonepe.com/apis/hermes/pg/v1/pay"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"

export async function initiatePhonePePayment(orderId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: "Unauthorized" }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: session.user.id }
    })

    if (!order) {
      return { success: false, error: "Order not found" }
    }

    if (order.paymentStatus === "PAID") {
      return { success: false, error: "Order is already paid" }
    }

    // Prepare Payload
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: order.id,
      merchantUserId: order.userId,
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      redirectUrl: `${process.env.NEXTAUTH_URL}/api/webhook/phonepe/redirect`,
      redirectMode: "POST",
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhook/phonepe`,
      mobileNumber: order.phone || "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    }

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64")
    
    // Generate Checksum: SHA256(base64Payload + "/pg/v1/pay" + saltKey) + "###" + saltIndex
    const stringToHash = base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY
    const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex")
    const checksum = `${sha256}###${PHONEPE_SALT_INDEX}`

    // Send request to PhonePe
    const response = await fetch(PHONEPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      body: JSON.stringify({ request: base64Payload })
    })

    const data = await response.json()

    if (data.success && data.data && data.data.instrumentResponse && data.data.instrumentResponse.redirectInfo) {
      return { 
        success: true, 
        redirectUrl: data.data.instrumentResponse.redirectInfo.url 
      }
    } else {
      console.error("PhonePe Initiation Failed:", data)
      return { success: false, error: data.message || "Failed to initiate payment" }
    }

  } catch (error: any) {
    console.error("Payment Initiation Error:", error)
    return { success: false, error: "An error occurred while initiating payment" }
  }
}
