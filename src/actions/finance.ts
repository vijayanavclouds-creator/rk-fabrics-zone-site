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
        userId: true,
        totalAmount: true,
        shippingAmount: true,
        platformFeeAmount: true,
        discountAmount: true,
        createdAt: true,
        status: true,
        paymentStatus: true,
        transactionId: true,
        transactionDetails: true,
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

      let txStatus = order.paymentStatus;
      let txDate = order.createdAt;
      
      try {
        if (order.transactionDetails) {
          const details = JSON.parse(order.transactionDetails);
          if (details.state) txStatus = details.state;
          else if (details.code) txStatus = details.code;
          // You could potentially extract date from transactionDetails if it exists, but typically order.createdAt or updatedAt is fine
        }
      } catch (e) {
        // ignore parse error
      }

      return {
        id: order.id,
        userId: order.userId,
        date: txDate,
        amount: order.totalAmount,
        shipping: order.shippingAmount,
        fee: order.platformFeeAmount,
        discount: order.discountAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        transactionId: order.transactionId,
        transactionStatus: txStatus,
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
