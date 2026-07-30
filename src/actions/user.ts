"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { sendOTPEmail } from "@/lib/email"

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function updateProfile(data: { name?: string, phone?: string, dob?: string, receiveOrderEmails?: boolean }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" }
    }

    if (data.phone && !/^(?!(\d)\1{9})(?!(\d)(\d)\2\3\2\3\2\3\2\3)(?!(?:9876543210|8765432109|7654321098|6543210987|9012345678|8901234567|7890123456|6789012345))[6-9]\d{9}$/.test(data.phone)) {
      return { success: false, error: "Please enter a valid 10-digit phone number starting with 6-9" }
    }

    if (data.dob) {
      const dobDate = new Date(data.dob)
      const age = new Date().getFullYear() - dobDate.getFullYear()
      if (age < 13 || isNaN(dobDate.getTime())) {
        return { success: false, error: "You must be at least 13 years old" }
      }
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.dob && { dob: data.dob }),
        ...(data.receiveOrderEmails !== undefined && { receiveOrderEmails: data.receiveOrderEmails }),
      }
    })

    revalidatePath("/account")
    revalidatePath("/account/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating profile:", error)
    return { success: false, error: error?.message || "Failed to update profile" }
  }
}

export async function updatePassword(password: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        password: hashedPassword,
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating password:", error)
    return { success: false, error: "Failed to update password" }
  }
}

export async function deactivateAccount() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized" }
    }

    // Instead of hard delete, we just deactivate the account
    await prisma.user.update({
      where: { email: session.user.email },
      data: { isActive: false }
    })

    return { success: true }
  } catch (error) {
    console.error("Error deactivating account:", error)
    return { success: false, error: "Failed to deactivate account" }
  }
}

export async function sendReactivationOtp(email: string) {
  try {
    if (!email) return { success: false, error: "Email is required" };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "Account not found" };
    }
    if (user.isActive) {
      return { success: false, error: "Account is already active" };
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.otp.deleteMany({
      where: { email, type: "REACTIVATE" }
    });

    await prisma.otp.create({
      data: {
        email,
        otp,
        type: "REACTIVATE",
        expiresAt
      }
    });

    const emailRes = await sendOTPEmail(email, otp, "REACTIVATE");
    if (!emailRes.success) {
      return { success: false, error: "Failed to send OTP email" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to send reactivation OTP" };
  }
}

export async function reactivateAccount(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;

    if (!email || !otp) {
      return { success: false, error: "Email and OTP are required" };
    }

    const validOtp = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        type: "REACTIVATE",
        expiresAt: { gt: new Date() }
      }
    });

    if (!validOtp) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    await prisma.user.update({
      where: { email },
      data: { isActive: true }
    });

    await prisma.otp.deleteMany({
      where: { email, type: "REACTIVATE" }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to reactivate account" };
  }
}
