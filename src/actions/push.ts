"use server";

import webpush from "web-push";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.NEXT_PUBLIC_APP_URL || "mailto:admin@rkfabricszone.com";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

/**
 * Save a push subscription securely to the database
 */
export async function savePushSubscription(subscription: webpush.PushSubscription) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (existing) {
      if (userId && existing.userId !== userId) {
        // Update user ID if it was guest before
        await prisma.pushSubscription.update({
          where: { endpoint: subscription.endpoint },
          data: { userId }
        });
      }
      return { success: true };
    }

    await prisma.pushSubscription.create({
      data: {
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userId: userId || null
      }
    });

    return { success: true };
  } catch (error: unknown) {
    console.error("Error saving push subscription:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send a push notification to a specific user
 */
export async function sendPushToUser(userId: string, title: string, body: string, url: string = "/") {
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subs.length === 0) return { success: true, sent: 0 };

    const payload = JSON.stringify({
      title,
      body,
      data: { url }
    });

    const sendPromises = subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          },
          payload
        );
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription has expired or is no longer valid
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        } else {
          console.error("Error sending push to endpoint", sub.endpoint, err);
        }
      }
    });

    await Promise.all(sendPromises);
    return { success: true, sent: subs.length };
  } catch (error: unknown) {
    console.error("Error sending push to user:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Send a push notification to ALL newsletter subscribers
 * Note: Should only be called by ADMIN
 */
export async function sendPushToNewsletterSubscribers(title: string, body: string, url: string = "/") {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, error: "Unauthorized" };

    // Get all users who are subscribed to the newsletter
    const subscribers = await prisma.userNewsletter.findMany({
      select: { userId: true }
    });

    const userIds = subscribers.map(s => s.userId);
    
    // Get all push subscriptions for those users
    const pushSubs = await prisma.pushSubscription.findMany({
      where: {
        userId: {
          in: userIds
        }
      }
    });

    if (pushSubs.length === 0) return { success: true, sent: 0 };

    const payload = JSON.stringify({ title, body, data: { url } });
    let sentCount = 0;

    // Send in batches to avoid rate limits/timeouts
    for (let i = 0; i < pushSubs.length; i += 50) {
      const batch = pushSubs.slice(i, i + 50);
      const promises = batch.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sentCount++;
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
          }
        }
      });
      await Promise.all(promises);
    }

    return { success: true, sent: sentCount };
  } catch (error: unknown) {
    console.error("Error sending newsletter push:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
