"use server";

import prisma from "@/lib/prisma";
import { getCompanyProfile } from "./system";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitContactMessage(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const orderId = formData.get("orderId") as string | null;

    if (!name || !email || !message) {
      return { success: false, error: "Name, email, and message are required." };
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // 1. Save the query to the database
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id || null;
    const userEmail = session?.user?.email || email;
    const userName = session?.user?.name || name;
    let finalPhone = phone || "";

    // Verify user actually exists in the database to prevent foreign key constraint violations
    // if the user's session is stale (e.g., account was deleted or DB was reset)
    if (userId) {
      const existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        userId = null;
      } else if (!finalPhone && existingUser.phone) {
        finalPhone = existingUser.phone;
      }
    }

    const query = await prisma.contactQuery.create({
      data: {
        name,
        email,
        phone: finalPhone,
        subject,
        orderId: subject === "Returns & Exchange" ? orderId : null,
        userId,
        messages: {
          create: {
            senderType: "CUSTOMER",
            message
          }
        }
      }
    });

    // 2. Create a notification for the Admin Portal
    await prisma.adminNotification.create({
      data: {
        type: "QUERY",
        message: `New ${subject} from ${name} (${email})`,
        link: `/admin/queries/${query.id}`,
      }
    });

    // 3. Trigger Bot Reply (Non-blocking)
    if (userId) {
      after(async () => {
        // Import dynamically to avoid circular dependencies or server component issues
        const { generateBotReply } = await import("@/lib/gemini");
        
        let orderDetails = null;
        if (query.orderId) {
          const orderInfo = await prisma.order.findUnique({
            where: { id: query.orderId },
            include: { items: true }
          });
          if (orderInfo) {
            orderDetails = `Specific Order Context:\nOrder ID: ${orderInfo.id}\nOrder Date: ${orderInfo.createdAt.toISOString()}\nStatus: ${orderInfo.status}\nTotal: ₹${orderInfo.totalAmount}\nItems: ${orderInfo.items.map((i: any) => i.productName).join(", ")}`;
          }
        } else if (userId) {
          const recentOrders = await prisma.order.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { items: true }
          });
          if (recentOrders.length > 0) {
            orderDetails = "Recent Orders History:\n" + recentOrders.map(o => 
              `- Order ID: ${o.id} | Date: ${o.createdAt.toISOString()} | Status: ${o.status} | Total: ₹${o.totalAmount} | Items: ${o.items.map((i: any) => i.productName).join(", ")}`
            ).join("\n");
          } else {
            orderDetails = "User has no past orders.";
          }
        }
        
        // Fire and forget
        await generateBotReply(query.id, message, userEmail, userName, orderDetails, null).catch(e => console.error("Bot reply failed:", e));
      });
    }

    revalidatePath("/admin");

    return { success: true, queryId: query.id, userId: query.userId };
  } catch (error: any) {
    console.error("Failed to submit contact message:", error);
    return { success: false, error: error?.message || "An unexpected error occurred. Please try again later." };
  }
}

export async function getContactQueries() {
  // Force recompile 1
  try {
    const queries = await prisma.contactQuery.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    return queries;
  } catch (error) {
    console.error("Failed to fetch contact queries:", error);
    return [];
  }
}
