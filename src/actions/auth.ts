"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendOTPEmail } from "@/lib/email"

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendSignupOtp(email: string) {
  try {
    if (!email) return { success: false, error: "Email is required" };
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Remove any existing unused OTPs for this email of this type
    await prisma.otp.deleteMany({
      where: { email, type: "SIGNUP" }
    });

    await prisma.otp.create({
      data: {
        email,
        otp,
        type: "SIGNUP",
        expiresAt
      }
    });

    const emailRes = await sendOTPEmail(email, otp, "SIGNUP");
    if (!emailRes.success) {
      return { success: false, error: "Failed to send OTP email" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send OTP" };
  }
}

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const otp = formData.get("otp") as string
    const phone = formData.get("phone") as string
    const dob = formData.get("dob") as string

    if (!name || !email || !password || !otp) {
      return { success: false, error: "All fields are required" }
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    if (!/^(?!(\d)\1{9})(?!(?:9876543210|8765432109|7654321098|6543210987|9012345678|8901234567|7890123456|6789012345))[6-9]\d{9}$/.test(phone)) {
      return { success: false, error: "Please enter a valid 10-digit phone number starting with 6-9" }
    }

    const dobDate = new Date(dob)
    const age = new Date().getFullYear() - dobDate.getFullYear()
    if (age < 13 || isNaN(dobDate.getTime())) {
      return { success: false, error: "You must be at least 13 years old to register" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    // Verify OTP
    const validOtp = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        type: "SIGNUP",
        expiresAt: { gt: new Date() }
      }
    });

    if (!validOtp) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // First user becomes ADMIN automatically, others CUSTOMER
    const totalUsers = await prisma.user.count()
    const role = totalUsers === 0 ? "ADMIN" : "CUSTOMER"

    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        dob,
        password: hashedPassword,
        role,
        isActive: true
      }
    })

    // Clean up OTP
    await prisma.otp.deleteMany({
      where: { email, type: "SIGNUP" }
    });

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to register" }
  }
}

export async function sendResetPasswordOtp(email: string) {
  try {
    if (!email) return { success: false, error: "Email is required" };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      // Return success anyway to prevent email enumeration
      return { success: true };
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.otp.deleteMany({
      where: { email, type: "RESET_PASSWORD" }
    });

    await prisma.otp.create({
      data: {
        email,
        otp,
        type: "RESET_PASSWORD",
        expiresAt
      }
    });

    await sendOTPEmail(email, otp, "RESET_PASSWORD");

    return { success: true };
  } catch (error: any) {
    console.error("sendResetPasswordOtp error:", error);
    return { success: false, error: error.message || "Failed to send reset OTP" };
  }
}

export async function verifyResetOtp(email: string, otp: string) {
  try {
    if (!email || !otp) {
      return { success: false, error: "Email and OTP are required" };
    }

    const validOtp = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        type: "RESET_PASSWORD",
        expiresAt: { gt: new Date() }
      }
    });

    if (!validOtp) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to verify OTP" };
  }
}

export async function resetPassword(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const otp = formData.get("otp") as string;
    const password = formData.get("password") as string;

    if (!email || !otp || !password) {
      return { success: false, error: "All fields are required" };
    }
    
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const validOtp = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        type: "RESET_PASSWORD",
        expiresAt: { gt: new Date() }
      }
    });

    if (!validOtp) {
      return { success: false, error: "Invalid or expired OTP" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    await prisma.otp.deleteMany({
      where: { email, type: "RESET_PASSWORD" }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to reset password" };
  }
}

export async function promoteToAdmin(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount >= 5) {
      return { success: false, error: "Maximum limit of 5 admin accounts reached." }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: "ADMIN" }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to promote user" }
  }
}

export async function demoteAdmin(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    // Don't let the last admin demote themselves
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount <= 1) {
      return { success: false, error: "Cannot demote the last admin account." }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: "CUSTOMER" }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: "Failed to demote user" }
  }
}

export async function getUsers() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    })

    return { success: true, users }
  } catch (error: any) {
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function sendStaffLoginOtp(email: string, requiredRole: "ADMIN" | "SUPPORT") {
  try {
    if (!email) return { success: false, error: "Email is required" };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "Account not found or unauthorized for this portal" };
    }

    if (requiredRole === "ADMIN" && user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Administrator privileges required" };
    }
    if (requiredRole === "SUPPORT" && user.role !== "SUPPORT" && user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Staff privileges required" };
    }
    if (user.isActive === false) {
      return { success: false, error: "Account is deactivated" };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const otpType = requiredRole === "ADMIN" ? "EXECUTIVE_LOGIN" : "SUPPORT_LOGIN";

    await prisma.otp.deleteMany({
      where: { email, type: otpType }
    });

    await prisma.otp.create({
      data: {
        email,
        otp,
        type: otpType,
        expiresAt
      }
    });

    const emailRes = await sendOTPEmail(email, otp, otpType as any);
    if (!emailRes.success) {
      return { success: false, error: "Failed to send verification code email" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate security code" };
  }
}

