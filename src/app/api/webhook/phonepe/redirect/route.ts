import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const code = formData.get("code") // "PAYMENT_SUCCESS" or "PAYMENT_ERROR"
    const transactionId = formData.get("transactionId")

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    if (code === "PAYMENT_SUCCESS") {
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
