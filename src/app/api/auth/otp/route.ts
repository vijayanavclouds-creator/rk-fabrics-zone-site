import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { sendOTPEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email: rawEmail, requiredRole } = body
    const email = rawEmail ? rawEmail.trim().toLowerCase() : ''

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ success: false, error: "Account not found or unauthorized for this portal" }, { status: 401 })
    }

    if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: Administrator privileges required" }, { status: 403 })
    }
    if (requiredRole === "SUPPORT" && user.role !== "SUPPORT" && user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized: Staff privileges required" }, { status: 403 })
    }
    if (user.isActive === false) {
      return NextResponse.json({ success: false, error: "Account is deactivated" }, { status: 403 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    const otpType = requiredRole === "ADMIN" ? "EXECUTIVE_LOGIN" : "SUPPORT_LOGIN"

    await prisma.otp.deleteMany({
      where: { email, type: otpType }
    })

    await prisma.otp.create({
      data: {
        email,
        otp,
        type: otpType,
        expiresAt
      }
    })

    const emailRes = await sendOTPEmail(email, otp, otpType as any)
    if (!emailRes.success) {
      return NextResponse.json({ success: false, error: "Failed to send verification code email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("OTP API Error:", error)
    return NextResponse.json({ success: false, error: error.message || "Failed to generate security code" }, { status: 500 })
  }
}
