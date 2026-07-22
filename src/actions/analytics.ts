"use server";

import prisma from "@/lib/prisma";
import { getStoreTaxonomy } from "./system";

export async function getDashboardAnalytics() {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: { not: "ADMIN" } }
    });

    const totalOrders = await prisma.order.count();

    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true, createdAt: true, status: true }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    const taxonomy = await getStoreTaxonomy();
    const totalCategories = taxonomy.categories.length;

    // Generate last 30 days time series data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: {
        totalAmount: true,
        createdAt: true,
        status: true
      }
    });

    // Group by date
    const dateMap = new Map();
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dateMap.set(dateString, { date: dateString, sales: 0, orders: 0, returned: 0, cancelled: 0, delivered: 0 });
    }

    recentOrders.forEach(order => {
      const dateString = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dateMap.has(dateString)) {
        const data = dateMap.get(dateString);
        data.orders += 1;
        
        if (order.status === "CANCELLED") {
          data.cancelled += 1;
        } else {
          data.sales += order.totalAmount;
        }

        if (order.status === "DELIVERED") {
          data.delivered += 1;
        }
        
        if (order.status === "RETURNED") {
          data.returned += 1;
        }
      }
    });

    const chartData = Array.from(dateMap.values());

    return {
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalCategories,
        totalSales,
        chartData
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch analytics:", error);
    return { success: false, error: error.message };
  }
}
