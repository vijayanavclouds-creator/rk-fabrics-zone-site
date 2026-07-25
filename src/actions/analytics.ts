"use server";

import prisma from "@/lib/prisma";
import { getStoreTaxonomy } from "./system";
import { getRecentAdminActivity } from "./admin-activity";

export async function getDashboardAnalytics() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sixteenDaysAgo = new Date();
    sixteenDaysAgo.setDate(sixteenDaysAgo.getDate() - 16);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Batch 1: Orders, Users, and Open Queries (limited concurrency to prevent connection limit issues)
    const [allOrders, allUsers, recentUnsolvedQueries, totalSubscribers] = await Promise.all([
      prisma.order.findMany({
        select: { totalAmount: true, createdAt: true, status: true, discountAmount: true }
      }),
      prisma.user.findMany({
        where: { role: { not: "ADMIN" } },
        select: { createdAt: true }
      }),
      prisma.contactQuery.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 5
      }),
      prisma.newsletterSubscriber.count()
    ]);

    // Batch 2: Products, Taxonomy, and Activity logs
    const [allProducts, taxonomy, activitiesRes] = await Promise.all([
      prisma.product.findMany({
        select: { createdAt: true, variants: { select: { stock: true } } }
      }),
      getStoreTaxonomy(),
      getRecentAdminActivity(15)
    ]);

    // Derive aggregations in-memory to eliminate 6 redundant database connections!
    const totalUsers = allUsers.length;
    const newUsersLast7Days = allUsers.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;

    const totalOrders = allOrders.length;
    const orderStatusCounts = allOrders.reduce((acc, curr) => {
      const status = curr.status.toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const validOrders = allOrders.filter(o => o.status !== "CANCELLED");
    const totalSales = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalDiscounts = validOrders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    const platformFees = totalSales * 0.02;

    const totalProducts = allProducts.length;
    const recentProducts = allProducts.filter(p => new Date(p.createdAt) >= sixteenDaysAgo).length;
    const outOfStockProducts = allProducts.filter(p => p.variants && p.variants.every((v: any) => v.stock <= 0)).length;

    const totalCategories = taxonomy.categories.length;
    const recentOrders = allOrders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);

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
        totalProducts,
        outOfStockProducts,
        totalCategories,
        recentProducts,
        totalSales,
        totalDiscounts,
        platformFees,
        totalSubscribers,
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
