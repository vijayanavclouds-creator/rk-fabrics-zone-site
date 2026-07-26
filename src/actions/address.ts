"use server"

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function getUserAddresses() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return []

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })
    
    return addresses
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return []
  }
}

export async function saveAddress(data: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const addressCount = await prisma.address.count({
      where: { userId: session.user.id }
    })

    let isDefault = data.isDefault || false

    if (!data.id && addressCount === 0) {
      isDefault = true
    } else if (data.id && addressCount === 1) {
      isDefault = true
    }

    if (isDefault) {
      // Remove default from all other addresses
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      })
    }

    let address
    if (data.id) {
      // Update existing
      address = await prisma.address.update({
        where: { id: data.id, userId: session.user.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          isDefault: isDefault
        }
      })
    } else {
      // Create new
      address = await prisma.address.create({
        data: {
          ...data,
          isDefault: isDefault,
          userId: session.user.id
        }
      })
    }

    revalidatePath("/checkout/address")
    revalidatePath("/account")
    return { success: true, address }
  } catch (error) {
    console.error("Error saving address:", error)
    return { success: false, error: "Failed to save address" }
  }
}

export async function deleteAddress(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" }
    }

    const addressToDelete = await prisma.address.findUnique({
      where: { id, userId: session.user.id }
    })

    if (!addressToDelete) {
      return { success: false, error: "Address not found" }
    }

    await prisma.address.delete({
      where: { id, userId: session.user.id }
    })

    const remainingAddresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    if (remainingAddresses.length > 0) {
      if (addressToDelete.isDefault || remainingAddresses.length === 1) {
        await prisma.address.update({
          where: { id: remainingAddresses[0].id },
          data: { isDefault: true }
        })
      }
    }

    revalidatePath("/checkout/address")
    revalidatePath("/account")
    return { success: true }
  } catch (error) {
    console.error("Error deleting address:", error)
    return { success: false, error: "Failed to delete address" }
  }
}
