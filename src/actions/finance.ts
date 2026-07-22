"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getFinancialAnalytics() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: {
        id: true,
        totalAmount: true,
        shippingAmount: true,
        platformFeeAmount: true,
        discountAmount: true,
        createdAt: true,
        status: true
      },
      orderBy: { createdAt: "desc" }
    });

    let totalRevenue = 0;
    let totalShipping = 0;
    let totalPlatformFees = 0;
    let totalDiscounts = 0;

    const transactions = orders.map(order => {
      totalRevenue += order.totalAmount;
      totalShipping += order.shippingAmount;
      totalPlatformFees += order.platformFeeAmount;
      totalDiscounts += order.discountAmount;

      return {
        id: order.id,
        date: order.createdAt,
        amount: order.totalAmount,
        shipping: order.shippingAmount,
        fee: order.platformFeeAmount,
        discount: order.discountAmount,
        status: order.status
      };
    });

    return {
      success: true,
      data: {
        totalRevenue,
        totalShipping,
        totalPlatformFees,
        totalDiscounts,
        transactions
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch financial analytics:", error);
    return { success: false, error: error.message };
  }
}
