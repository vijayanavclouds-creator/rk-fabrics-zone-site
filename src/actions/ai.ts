"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

export async function generateHtmlWithAI(prompt: string, currentHtml: string, section: "hero" | "carousel") {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY is not configured on the server." };
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const systemInstruction = `You are an expert Frontend Developer who specializes in writing beautiful, pure HTML and Tailwind CSS.
You are generating HTML for the "${section}" section of the e-commerce homepage for "RK Fabrics Zone".
The user will provide a prompt describing how they want the section to look.
I will also provide the CURRENT HTML of that section for context.

CRITICAL RULES:
1. ONLY return valid HTML. Do NOT return markdown formatting (e.g. no \`\`\`html). Do NOT return any explanatory text. The response must be raw HTML that can be directly safely inserted via dangerouslySetInnerHTML.
2. Use Tailwind CSS utility classes extensively for styling, layout, typography, and animations. You can use standard Tailwind classes (like 'bg-red-500', 'animate-pulse', etc.).
3. Do NOT use React components (no <Swiper>, no <motion.div>, no <Image>). Use standard <div>, <img>, <a>, <section>, etc.
4. If the prompt is simple (like "change background to red"), make sure to modify the current HTML rather than writing it from scratch.
5. If writing custom animations or highly custom styles, you can include a <style> block inside the HTML if absolutely necessary, but prefer Tailwind utility classes.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        { role: "user", parts: [
          { text: systemInstruction }, 
          { text: `CURRENT HTML:\n${currentHtml || "(None)"}\n\nUSER PROMPT: ${prompt}` }
        ] }
      ]
    });

    let text = response.text || "";
    // Clean up potential markdown formatting if the AI ignores the prompt
    text = text.replace(/^```html/m, "").replace(/^```/m, "").trim();
    if (text.endsWith("```")) {
      text = text.slice(0, -3).trim();
    }

    return { success: true, html: text };
  } catch (error: any) {
    console.error("Error generating HTML with AI:", error);
    return { success: false, error: error.message || "Failed to generate HTML." };
  }
}
