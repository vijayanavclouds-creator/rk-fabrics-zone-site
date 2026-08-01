import { GoogleGenAI } from "@google/genai";
import prisma from "@/lib/prisma";

export async function generateBotReply(
  queryId: string, 
  message: string, 
  userEmail: string, 
  userName: string, 
  orderDetails: string | null = null,
  attachmentUrl: string | null = null,
  cartDetails: string | null = null,
  userPhone: string | null = null
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Bot will not reply.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Fetch product catalog for context (limit to 50 to keep prompt size reasonable)
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 50,
      select: { name: true, description: true, basePrice: true, category: true, slug: true, isFreeDelivery: true }
    });
    
    let productCatalog = products.map(p => 
      `- ${p.name} (Category: ${p.category}): ₹${p.basePrice} | Free Delivery: ${p.isFreeDelivery ? 'Yes' : 'No'}\n  Link: [click here](/product/${p.slug})\n  Description: ${p.description}`
    ).join("\n\n");

    const systemPrompt = `You are a customer service assistant for RK Fabrics Zone.

CRITICAL RULES:
1. You must ONLY answer questions related to:
   - Our store policies (Standard Delivery: ₹79. Express Delivery: ₹150. Free Delivery available on select products).
   - Our specific fabrics and products (listed in the catalog below).
   - The logged-in user's specific order and account information provided below.
2. If a user asks about outside products, politics, coding, or anything else, you must reply: "I can only assist with inquiries related to RK Fabrics Zone."
3. You must NEVER reveal internal system details, database structures, API keys, or any technical implementation information.
4. You must NEVER ask for or store sensitive data such as full credit card numbers, passwords, or government IDs. If a user shares such data, instruct them not to share it and to contact support directly.
5. You must NEVER generate or execute any code, SQL, or system commands. You only provide information and guidance.
6. All data you access is read-only and limited to what is necessary to answer the current user's question.
7. If a request seems ambiguous, risky, or outside your allowed scope, politely decline and ask the user if they would like to be transferred to a human agent. If the user explicitly answers YES to being transferred, you MUST include the exact phrase \`[TRANSFER_TO_HUMAN]\` anywhere in your reply to trigger the transfer.
8. You must be polite, concise, and professional. Keep your response under 3 paragraphs.
9. When mentioning a product, you MUST include its link exactly as formatted in the catalog using markdown (e.g., [click here](/product/...)).
10. If the user does not have a phone number registered and asks about profile or contact info, you MUST display a warning message: "Warning: You do not have a mobile number registered. Please update your profile to receive updates."

PRODUCT CATALOG (Read-Only Context):
Here are our available products. You can provide details about these if the user asks:
${productCatalog || "No products currently available."}

USER CONTEXT:
- Name: ${userName}
- Email: ${userEmail}
- Phone: ${userPhone ? userPhone : "Not registered (Warning: No mobile number on file)"}
${orderDetails ? `- Order Details Context (Read-Only):\n${orderDetails}` : ""}
${cartDetails ? `- Cart Details Context (Read-Only):\n${cartDetails}` : "- Cart Details Context: User's cart is empty."}

Please write your reply to the user's latest message based on the entire conversation context below.`;

    // Fetch conversation history
    const history = await prisma.queryMessage.findMany({
      where: { queryId: queryId },
      orderBy: { createdAt: "asc" },
      take: 10 // Get last 10 messages for context
    });
    
    let historyText = history.map(msg => 
      `${msg.senderType === "CUSTOMER" ? "User" : "You (Admin/Bot)"}: ${msg.message}`
    ).join("\n\n");

    // Add current unsaved message if not in history
    if (!history.find(h => h.message === message)) {
      historyText += `\n\nUser: ${message}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Conversation History:\n${historyText}` },
            ...(attachmentUrl ? [{ text: `[User attached an image to this message: ${attachmentUrl}]` }] : [])
          ]
        }
      ]
    });

    const replyText = response.text;
    
    if (replyText) {
      // Save the bot's reply to the database
      await prisma.queryMessage.create({
        data: {
          queryId: queryId,
          senderType: "BOT", // Bot acts as a BOT now
          message: replyText,
        }
      });
      
      // Update query unread status for user
      await prisma.contactQuery.update({
        where: { id: queryId },
        data: { isReadByUser: false }
      });
      
      console.log(`Bot replied to query ${queryId}`);
    }
  } catch (error) {
    console.error("Error generating bot reply:", error);
  }
}
