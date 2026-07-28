"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Helper function to log an admin activity.
 * Should be called inside other server actions after successful execution.
 */
export async function logAdminActivity(action: string, details?: string) {
  try {
    const fs = require('fs');
    fs.appendFileSync('./debug.log', `[logAdminActivity] called with action: ${action}\n`);
    
    const session = await getServerSession(authOptions);
    const adminName = session?.user?.name || session?.user?.email || "System";
    fs.appendFileSync('./debug.log', `[logAdminActivity] adminName resolved to: ${adminName}\n`);
    
    const newAct = await prisma.adminActivity.create({
      data: {
        adminName,
        action,
        details,
      }
    });
    fs.appendFileSync('./debug.log', `[logAdminActivity] success! inserted id: ${newAct.id}\n`);
  } catch (error: any) {
    const fs = require('fs');
    fs.appendFileSync('./debug.log', `[logAdminActivity] ERROR: ${error.message}\n${error.stack}\n`);
    console.error("Failed to log admin activity:", error);
    // We intentionally don't throw to prevent crashing the parent operation
  }
}

/**
 * Fetch the latest N admin activities for the dashboard feed.
 */
export async function getRecentAdminActivity(limit = 10) {
  try {
    const activities = await prisma.adminActivity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, activities };
  } catch (error) {
    console.error("Failed to fetch admin activities:", error);
    return { success: false, activities: [] };
  }
}

/**
 * Fetch all admin activities with pagination.
 */
export async function getAllAdminActivities(page = 1, limit = 50) {
  try {
    const skip = (page - 1) * limit;
    const [activities, total] = await Promise.all([
      prisma.adminActivity.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.adminActivity.count()
    ]);
    return { success: true, activities, total, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error("Failed to fetch all admin activities:", error);
    return { success: false, activities: [], total: 0, totalPages: 0 };
  }
}

/**
 * Delete admin activities within a specific date range.
 * Restricts deletion of activities from the last 3 months.
 */
export async function deleteAdminActivitiesByDateRange(startDateStr: string, endDateStr: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Set endDate to end of the day to include the whole day
    endDate.setHours(23, 59, 59, 999);

    // Validate that endDate is not within the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    if (endDate > threeMonthsAgo) {
      return { success: false, error: "Cannot delete activities from the last 3 months" };
    }

    if (startDate > endDate) {
      return { success: false, error: "Start date must be before end date" };
    }

    const result = await prisma.adminActivity.deleteMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    await logAdminActivity("cleared activity history", `deleted ${result.count} logs from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`);

    return { success: true, count: result.count };
  } catch (error: any) {
    console.error("Failed to delete admin activities:", error);
    return { success: false, error: error.message };
  }
}

