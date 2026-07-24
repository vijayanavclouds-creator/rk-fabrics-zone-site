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

