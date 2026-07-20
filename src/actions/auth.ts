"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { success: false, error: "All fields are required" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { success: false, error: "User with this email already exists" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // First user becomes ADMIN automatically, others CUSTOMER
    const totalUsers = await prisma.user.count()
    const role = totalUsers === 0 ? "ADMIN" : "CUSTOMER"

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to register" }
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
