"use server";

import prisma from "@/lib/prisma";
import { getCompanyProfile } from "./system";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitContactMessage(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return { success: false, error: "Name, email, and message are required." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Please enter a valid email address." };
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return { success: false, error: "Please enter a valid 10-digit phone number." };
    }

    // 1. Save the query to the database
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const query = await prisma.contactQuery.create({
      data: {
        name,
        email,
        phone,
        subject,
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
        link: `/account/admin/queries/${query.id}`,
      }
    });

    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to submit contact message:", error);
    return { success: false, error: "An unexpected error occurred. Please try again later." };
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
