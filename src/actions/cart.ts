"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendAbandonedCartEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function syncCartToDb(items: any[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false };

    // Don't sync empty carts or admin carts
    if (session.user.role === "ADMIN") return { success: false };
    
    const cartData = items.length > 0 ? JSON.stringify(items) : null;
    
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        cartData,
        cartUpdatedAt: items.length > 0 ? new Date() : null
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error syncing cart to db:", error);
    return { success: false };
  }
}

export async function fetchUserCart() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return { success: false, items: [] };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { cartData: true }
    });

    if (user?.cartData) {
      return { success: true, items: JSON.parse(user.cartData) };
    }
    return { success: true, items: [] };
  } catch (error) {
    return { success: false, items: [] };
  }
}

export async function getAbandonedCarts() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, data: [] };

    const usersWithCarts = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        cartData: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cartData: true,
        cartUpdatedAt: true,
      },
      orderBy: {
        cartUpdatedAt: "desc"
      }
    });

    // Parse the cart data
    const abandonedCheckouts = usersWithCarts.map(user => {
      let items = [];
      try {
        if (user.cartData) items = JSON.parse(user.cartData);
      } catch (e) {
        console.error("Failed to parse cart for user", user.email);
      }
      
      const totalAmount = items.reduce((sum: number, item: any) => sum + ((item.variant.salePrice || item.variant.price) * item.quantity), 0);

      return {
        ...user,
        items,
        totalAmount
      };
    });

    return { success: true, data: abandonedCheckouts };
  } catch (error: any) {
    console.error("Error fetching abandoned carts:", error);
    return { success: false, error: error.message };
  }
}

export async function validateCartStock(items: any[]) {
  try {
    const variantIds = items.map(i => i.variant.id);
    const variantsInDb = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, stock: true }
    });

    const stockMap = variantsInDb.reduce((acc, v) => {
      acc[v.id] = v.stock;
      return acc;
    }, {} as Record<string, number>);
    
    const outOfStockItems = items.filter(item => {
      const available = stockMap[item.variant.id] || 0;
      return item.quantity > available;
    }).map(item => ({
      variantId: item.variant.id,
      available: stockMap[item.variant.id] || 0
    }));

    return { success: true, outOfStockItems };
  } catch (error) {
    console.error("Error validating cart stock:", error);
    return { success: false, outOfStockItems: [] };
  }
}

export async function sendAbandonedCartReminder(userId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, cartData: true }
    });

    if (!user || !user.cartData) {
      return { success: false, error: "User or cart not found" };
    }

    let items = [];
    try {
      items = JSON.parse(user.cartData);
    } catch(e) {
      return { success: false, error: "Invalid cart data" };
    }

    if (items.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // 1. Send Email
    await sendAbandonedCartEmail(user, items);

    // 2. Create Portal Notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "You left something behind! 🛍️",
        message: "Your cart is waiting for you. Complete your purchase now before items sell out!",
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error sending abandoned cart reminder:", error);
    return { success: false, error: error.message };
  }
}
