"use server";

import prisma from "@/lib/prisma";
import { getStoreTaxonomy } from "./system";
import { getRecentAdminActivity } from "./admin-activity";

export async function getDashboardAnalytics() {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: { not: "ADMIN" } }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersLast7Days = await prisma.user.count({
      where: { role: { not: "ADMIN" }, createdAt: { gte: sevenDaysAgo } }
    });

    const recentUnsolvedQueries = await prisma.contactQuery.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const totalOrders = await prisma.order.count();

    const orderStatuses = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    const orderStatusCounts = orderStatuses.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalProducts = await prisma.product.count();
    const outOfStockProducts = await prisma.product.count({
      where: {
        variants: {
          every: {
            stock: { lte: 0 }
          }
        }
      }
    });

    const sixteenDaysAgo = new Date();
    sixteenDaysAgo.setDate(sixteenDaysAgo.getDate() - 16);
    
    const recentProducts = await prisma.product.count({
      where: {
        createdAt: { gte: sixteenDaysAgo }
      }
    });

    const orders = await prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { totalAmount: true, createdAt: true, status: true, discountAmount: true }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    const platformFees = totalSales * 0.02;

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
    const activitiesRes = await getRecentAdminActivity(15);

    return {
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        outOfStockProducts,
        totalCategories,
        recentProducts,
        totalSales,
        totalDiscounts,
        platformFees,
        newUsersLast7Days,
        recentUnsolvedQueries,
        chartData,
        orderStatusCounts,
        activities: activitiesRes.activities
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch analytics:", error);
    return { success: false, error: error.message };
  }
}

export async function getChartData(days: number) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate }
      },
      select: {
        totalAmount: true,
        createdAt: true,
        status: true
      }
    });

    const dateMap = new Map();
    
    // Determine grouping: by day if <= 90 days, by month if > 90 days
    if (days <= 90) {
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateString = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dateMap.set(dateString, { date: dateString, sales: 0, orders: 0, returned: 0, cancelled: 0, delivered: 0 });
      }

      recentOrders.forEach(order => {
        const dateString = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dateMap.has(dateString)) {
          const data = dateMap.get(dateString);
          data.orders += 1;
          if (order.status === "CANCELLED") data.cancelled += 1;
          else data.sales += order.totalAmount;
          if (order.status === "DELIVERED") data.delivered += 1;
          if (order.status === "RETURNED") data.returned += 1;
        }
      });
    } else {
      // Group by month
      const months = Math.ceil(days / 30);
      for (let i = 0; i <= months; i++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i);
        const dateString = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!dateMap.has(dateString)) {
          dateMap.set(dateString, { date: dateString, sales: 0, orders: 0, returned: 0, cancelled: 0, delivered: 0 });
        }
      }

      recentOrders.forEach(order => {
        const dateString = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (dateMap.has(dateString)) {
          const data = dateMap.get(dateString);
          data.orders += 1;
          if (order.status === "CANCELLED") data.cancelled += 1;
          else data.sales += order.totalAmount;
          if (order.status === "DELIVERED") data.delivered += 1;
          if (order.status === "RETURNED") data.returned += 1;
        }
      });
    }

    return { success: true, chartData: Array.from(dateMap.values()) };
  } catch (error: any) {
    console.error("Failed to fetch chart data:", error);
    return { success: false, error: error.message };
  }
}
