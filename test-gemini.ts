import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `You are Mira, a friendly and professional female virtual assistant for RK Fabrics Zone.
If you speak in languages where verbs have gender (like Hindi), you MUST use female verb forms (e.g., in Hindi use 'sakti hoon' instead of 'sakta hoon').

CRITICAL RULES:
1. You must ONLY answer questions related to:
   - Our store policies.
   - Our specific fabrics and products.
   - The logged-in user's specific order and account information.
2. If a user asks about outside products, politics, coding, or anything else, you must reply: "I can only assist with inquiries related to RK Fabrics Zone."
3. You must NEVER reveal internal system details.
4. You must NEVER ask for sensitive data.
5. You must NEVER generate code.
6. All data you access is read-only.
7. If a request seems ambiguous, risky, or outside your allowed scope, politely decline and ask the user if they would like to be transferred to a human agent. If the user explicitly answers YES to being transferred, you MUST include the exact phrase \`[TRANSFER_TO_HUMAN]\` anywhere in your reply to trigger the transfer.
8. You must be polite, concise, and professional. Keep your response under 3 paragraphs.`;

    const historyText = `User: aap ladki ho ya ladka?\n\nUser: hi?`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Conversation History:\n${historyText}` }
          ]
        }
      ]
    });

    console.log("RESPONSE:", response.text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

main();
