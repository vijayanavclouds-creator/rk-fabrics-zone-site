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

    // Simulate AI thinking delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500))

    const lowerPrompt = prompt.toLowerCase()
    
    // Extract discount if present (e.g., "30% off", "flat 50%", "20 percent")
    const discountMatch = lowerPrompt.match(/(\d+)\s*(?:%|percent)/)
    const discount = discountMatch ? `${discountMatch[1]}% OFF` : "a Special Discount"

    // Extract product keywords
    let product = "our exclusive collection"
    if (lowerPrompt.includes("cotton kurta") || lowerPrompt.includes("cotton kurtas")) product = "Premium Cotton Kurtas"
    else if (lowerPrompt.includes("silk saree") || lowerPrompt.includes("silk sarees")) product = "Pure Silk Sarees"
    else if (lowerPrompt.includes("lehenga")) product = "Designer Lehengas"
    else if (lowerPrompt.includes("fabric")) product = "Luxury Fabrics"
    else if (lowerPrompt.includes("suit")) product = "Elegant Suit Sets"

    // Extract theme/occasion
    let theme = "Special Offer"
    if (lowerPrompt.includes("summer")) theme = "Summer Collection"
    else if (lowerPrompt.includes("festive") || lowerPrompt.includes("diwali") || lowerPrompt.includes("eid")) theme = "Festive Season"
    else if (lowerPrompt.includes("winter")) theme = "Winter Collection"
    else if (lowerPrompt.includes("wedding")) theme = "Wedding Season"

    let subject = `✨ FLAT ${discount} on ${product}! 🎊`
    if (discount === "a Special Discount") {
      subject = `✨ Discover ${product} - ${theme} is Here! 🎊`
    }

    let content = `Dear Customer,\n\nWe are thrilled to announce our latest ${theme} deals!\n\nFor a limited time only, enjoy **${discount}** on our highly sought-after ${product}. Whether you are shopping for a special occasion or upgrading your everyday wardrobe, we have something perfectly tailored for you.\n\n✨ **Why you'll love it:**\n- Premium quality and comfort\n- Stunning, exclusive designs\n- Unbeatable value\n\nDon't miss out on this incredible offer. Use code **OFFER${discountMatch ? discountMatch[1] : "X"}** at checkout to claim your discount!\n\n[Shop the ${product} Collection Now](/shop)\n\nWarm regards,\nThe RK Fabrics Team`

    // Overrides for specific exact templates if they ask for welcome/sale
    if (lowerPrompt.includes("welcome") && !discountMatch) {
      subject = "Welcome to RK Fabrics! 🌟"
      content = "Hello there,\n\nWelcome to the RK Fabrics family! We are thrilled to have you here.\n\nTo celebrate, we are giving you an exclusive first-time buyer discount. Use code **WELCOME10** for 10% off your first order.\n\nHappy Shopping!\n\nBest,\nRK Fabrics Team"
    } else if (lowerPrompt.includes("clearance")) {
      subject = "🚨 MASSIVE CLEARANCE SALE - Up to 70% OFF! 🚨"
      content = "Hey!\n\nIt's time for our biggest Clearance Event! We are making room for new arrivals, which means YOU get absolute steal deals on our premium collections.\n\nEnjoy massive markdowns on fabrics, kurtas, and sarees. Stock is strictly limited, so grab your favorites before they sell out forever!\n\nStay stylish,\nRK Fabrics Team"
    }

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

    await prisma.newsletter.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting admin newsletter:", error)
    return { success: false, error: "Failed to delete newsletter" }
  }
}
