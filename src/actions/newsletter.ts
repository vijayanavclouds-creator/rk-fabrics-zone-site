"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

export async function sendNewsletter(subject: string, content: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" }
    }

    if (!subject || !content) {
      return { success: false, error: "Subject and content are required" }
    }

    // 1. Create the newsletter record
    const newsletter = await prisma.newsletter.create({
      data: { subject, content }
    })

    // 2. Fetch all registered users to deliver it to their portal
    // (We also have `NewsletterSubscriber` which contains guest emails, 
    // but the requirement is for customers to see it on their portal).
    // Let's create a UserNewsletter for every user.
    const users = await prisma.user.findMany({ select: { id: true } })
    
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
