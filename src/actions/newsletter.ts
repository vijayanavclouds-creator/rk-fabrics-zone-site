"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { logAdminActivity } from "./admin-activity"
import { GoogleGenAI } from "@google/genai"

export async function subscribeToNewsletter(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: "Invalid email address" }
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existing) {
      return { success: false, error: "You are already subscribed!" }
    }

    await prisma.newsletterSubscriber.create({
      data: { email }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error)
    return { success: false, error: "Something went wrong" }
  }
}

export async function sendNewsletter(subject: string, content: string, targetUserIds?: string[], couponCode?: string, targetUsers?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    if (!subject || !content) {
      return { success: false, error: "Subject and content are required" }
    }
    
    // Default the targetUsers label if not provided
    let finalTargetUsers = targetUsers
    if (!finalTargetUsers) {
      if (targetUserIds && targetUserIds.length > 0) {
        finalTargetUsers = "Selected Users"
      } else {
        finalTargetUsers = "All Users"
      }
    }

    // 1. Create the newsletter record
    const newsletter = await prisma.newsletter.create({
      data: { subject, content, couponCode, targetUsers: finalTargetUsers }
    })

    // 2. Fetch users to deliver it to their portal
    let users: { id: string }[] = []
    
    if (targetUserIds && targetUserIds.length > 0) {
      users = targetUserIds.map(id => ({ id }))
    } else {
      users = await prisma.user.findMany({ select: { id: true } })
    }
    
    if (users.length > 0) {
      const userNewsletters = users.map(user => ({
        userId: user.id,
        newsletterId: newsletter.id
      }))
      
      await Promise.all(
        userNewsletters.map(data => 
          prisma.userNewsletter.create({ data })
        )
      )

      const notifications = users.map(user => ({
        userId: user.id,
        title: "New Newsletter!",
        message: subject,
        link: "/account/newsletters"
      }))

      await Promise.all(
        notifications.map(data => 
          prisma.notification.create({ data })
        )
      )
    }

    // TODO: In a real app, you would also use an email service (SendGrid, AWS SES) 
    // to email all `NewsletterSubscriber` records.

    // 3. Send Web Push Notification to subscribers
    const { sendPushToNewsletterSubscribers } = await import("./push");
    sendPushToNewsletterSubscribers(subject, "You have a new newsletter from RK Fabrics Zone!").catch(console.error);

    await logAdminActivity(`sent newsletter <b>${subject}</b>`, `Delivered to ${users.length} users`);

    return { success: true }
  } catch (error: any) {
    console.error("Error sending newsletter:", error)
    return { success: false, error: "Failed to send newsletter: " + (error.message || String(error)) }
  }
}

export async function getUserNewsletters() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { newsletters: [] }

    const newsletters = await prisma.userNewsletter.findMany({
      where: { userId: session.user.id },
      include: { newsletter: true },
      orderBy: { createdAt: 'desc' }
    })

    return { newsletters }
  } catch (error) {
    console.error("Error getting user newsletters:", error)
    return { newsletters: [] }
  }
}

export async function deleteUserNewsletter(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return { success: false, error: "Unauthorized" }

    await prisma.userNewsletter.delete({
      where: { 
        id,
        userId: session.user.id // ensure they can only delete their own
      }
    })

    revalidatePath("/account/newsletters")
    return { success: true }
  } catch (error) {
    console.error("Error deleting newsletter:", error)
    return { success: false, error: "Failed to delete" }
  }
}

export async function getAdminNewsletters() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, newsletters: [] }
    }

    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { recipients: true }
        }
      }
    })

    // Format the count properly for the frontend
    const formattedNewsletters = newsletters.map(n => ({
      ...n,
      _count: {
        users: n._count.recipients
      }
    }))

    return { success: true, newsletters: formattedNewsletters }
  } catch (error) {
    console.error("Error fetching admin newsletters:", error)
    return { success: false, newsletters: [] }
  }
}

export async function generateNewsletterWithAI(prompt: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY is not configured on the server." }
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const systemInstruction = `You are an expert marketing copywriter for RK Fabrics Zone.
Generate a promotional email newsletter based on the user's prompt.
CRITICAL RULES:
1. Do NOT use any Markdown formatting like **bold** or *italics*. The output will be placed in a standard plain-text HTML textarea, so use plain text only. Do not use [link text](url) markdown syntax either, just write out URLs if needed.
2. If a specific coupon code is provided in the prompt, you MUST use that exact code. Do NOT invent a different code.
3. Keep the tone enthusiastic, professional, and persuasive.
4. The response MUST be split into a Subject line and the Message Content. Format your response exactly like this:
SUBJECT: [Your creative subject line here]
CONTENT:
[Your plain text newsletter content here]`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        { role: "user", parts: [{ text: systemInstruction }, { text: `User Prompt: ${prompt}` }] }
      ]
    });

    const text = response.text || "";
    let subject = "Special Offer from RK Fabrics Zone";
    let content = text;

    const subjectMatch = text.match(/SUBJECT:\s*([\s\S]*?)\nCONTENT:/);
    if (subjectMatch) {
      subject = subjectMatch[1].trim();
      content = text.split("CONTENT:")[1].trim();
    } else {
      // Fallback if AI doesn't follow strict formatting
      const lines = text.split('\n');
      if (lines[0].toUpperCase().startsWith("SUBJECT:")) {
        subject = lines[0].replace(/SUBJECT:/i, '').trim();
        content = lines.slice(1).join('\n').trim();
      }
    }

    // Strip out any accidental markdown asterisks just in case
    content = content.replace(/\*\*/g, '').replace(/\*/g, '');
    subject = subject.replace(/\*\*/g, '').replace(/\*/g, '');

    return { success: true, subject, content }

  } catch (error) {
    console.error("Error generating AI newsletter:", error)
    return { success: false, error: "Failed to connect to AI service" }
  }
}

export async function deleteAdminNewsletter(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    const oldNewsletter = await prisma.newsletter.findUnique({ where: { id } });

    await prisma.newsletter.delete({
      where: { id }
    })

    if (oldNewsletter) {
      await logAdminActivity(`deleted newsletter <b>${oldNewsletter.subject}</b>`);
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting admin newsletter:", error)
    return { success: false, error: "Failed to delete newsletter" }
  }
}
