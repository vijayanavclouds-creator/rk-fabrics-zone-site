import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Send, User, Building2, Paperclip, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { generateBotReply } from "@/lib/gemini";
import { QueryThread } from "@/components/queries/query-thread";
import { ChatContainer } from "@/components/queries/chat-container";

export default async function CustomerQueryThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const query = await prisma.contactQuery.findUnique({
    where: { 
      id: resolvedParams.id,
      userId: session.user.id // Ensure they only see their own query
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!query) {
    redirect("/account/reviews?tab=queries");
  }

  // Mark as read by user if opened by customer
  if (!query.isReadByUser) {
    await prisma.contactQuery.update({
      where: { id: query.id },
      data: { isReadByUser: true }
    });
  }

  async function replyToQuery(formData: FormData) {
    "use server";
    const message = formData.get("message") as string;
    const attachment = formData.get("attachment") as string;
    if (!message && !attachment) return;

    await prisma.queryMessage.create({
      data: {
        queryId: query!.id,
        senderType: "CUSTOMER",
        message: message || "",
        attachment
      }
    });

    // Notify admin
    await prisma.adminNotification.create({
      data: {
        type: "QUERY",
        message: `New reply from ${query!.name} on ${query!.subject}`,
        link: `/admin/queries/${query!.id}`,
      }
    });

    // Mark query as unread for admin
    await prisma.contactQuery.update({
      where: { id: query!.id },
      data: { isRead: false }
    });

    // Trigger Bot Reply for thread messages
    if (session?.user?.id) {
      const { generateBotReply } = await import("@/lib/gemini");
      let orderDetails = null;
      if (query!.orderId) {
        const orderInfo = await prisma.order.findUnique({
          where: { id: query!.orderId },
          include: { items: true }
        });
        if (orderInfo) {
          orderDetails = `Specific Order Context:\nOrder ID: ${orderInfo.id}\nStatus: ${orderInfo.status}\nTotal: ₹${orderInfo.totalAmount}\nItems: ${orderInfo.items.map((i: any) => i.productName).join(", ")}`;
        }
      } else if (session?.user?.id) {
        const recentOrders = await prisma.order.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { items: true }
        });
        if (recentOrders.length > 0) {
          orderDetails = "Recent Orders History:\n" + recentOrders.map(o => 
            `- Order ID: ${o.id} | Status: ${o.status} | Total: ₹${o.totalAmount} | Items: ${o.items.map((i: any) => i.productName).join(", ")}`
          ).join("\n");
        } else {
          orderDetails = "User has no past orders.";
        }
      }
      
      const userEmail = session?.user?.email || query!.email;
      const userName = session?.user?.name || query!.name;

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { phone: true, cartData: true }
      });
      const userPhone = user?.phone || null;
      
      let cartDetails = null;
      if (user?.cartData) {
        try {
          const cart = JSON.parse(user.cartData);
          if (Array.isArray(cart) && cart.length > 0) {
            cartDetails = cart.map((item: any) => `${item.quantity}x ${item.name} (${item.size}, ${item.color}) - ₹${item.price}`).join(", ");
          }
        } catch(e) {}
      }

      // Check if conversation was escalated to human agent
      const previousMessages = await prisma.queryMessage.findMany({
        where: { queryId: query!.id }
      });
      
      const isEscalated = previousMessages.some(m => 
        (m.senderType === "ADMIN" || m.senderType === "BOT") && 
        m.message && m.message.includes("I will transfer this to a human agent")
      );

      if (!isEscalated) {
        after(() => {
          generateBotReply(query!.id, message || "Attached an image.", userEmail, userName, orderDetails, attachment || null, cartDetails, userPhone).catch(e => console.error("Bot reply failed in thread:", e));
        });
      }
    }

    revalidatePath(`/account/queries/${query!.id}`);
  }

  async function refreshMessages() {
    "use server";
    const updatedQuery = await prisma.contactQuery.findUnique({
      where: { id: resolvedParams.id },
      include: { messages: { orderBy: { createdAt: "asc" } } }
    });
    if (!updatedQuery) return null;
    return {
      messages: updatedQuery.messages,
      status: updatedQuery.status
    };
  }

  return (
    <ChatContainer>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4 mb-4 md:mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/account/reviews?tab=queries" className="w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-charcoal">{query.subject}</h1>
            <p className="text-sm text-slate">Support Ticket #{query.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
        
        {query.status === "RESOLVED" && (
          <span className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold">
            Resolved
          </span>
        )}
      </div>

      <QueryThread 
        initialMessages={query.messages} 
        status={query.status} 
        onReply={replyToQuery} 
        userImage={session?.user?.image || null}
        refreshMessages={refreshMessages}
      />
    </ChatContainer>
  );
}
