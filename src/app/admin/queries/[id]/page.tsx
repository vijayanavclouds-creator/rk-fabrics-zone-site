import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Send, User, Building2, Paperclip, ExternalLink, Bot } from "lucide-react";
import { logAdminActivity } from "@/actions/admin-activity";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { AdminQueryThread } from "@/components/queries/admin-query-thread";

export default async function AdminQueryThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const query = await prisma.contactQuery.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!query) {
    redirect("/admin?tab=queries");
  }

  // Mark as read if opened by admin
  if (!query.isRead) {
    await prisma.contactQuery.update({
      where: { id: query.id },
      data: { isRead: true }
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
        senderType: "ADMIN",
        message: message || "",
        attachment
      }
    });
    
    await prisma.contactQuery.update({
      where: { id: query!.id },
      data: { isReadByUser: false }
    });

    // Notify customer if they are a registered user
    if (query!.userId) {
      await prisma.notification.create({
        data: {
          userId: query!.userId,
          title: "New Reply to Your Query",
          message: `Admin replied to your query regarding: ${query!.subject}`,
          link: `/account/queries/${query!.id}`,
          isRead: false,
        }
      });
    }

    await logAdminActivity(`replied to query <b>${query!.subject}</b> from <b>${query!.name || query!.user?.name || "Customer"}</b>`);
    revalidatePath(`/admin/queries/${query!.id}`);
  }

  async function resolveQuery() {
    "use server";
    await prisma.contactQuery.update({
      where: { id: query!.id },
      data: { status: "RESOLVED" }
    });
    await logAdminActivity(`resolved query <b>${query!.subject}</b> from <b>${query!.name || query!.user?.name || "Customer"}</b>`);
    revalidatePath(`/admin/queries/${query!.id}`);
  }

  async function refreshMessages() {
    "use server";
    const updatedQuery = await prisma.contactQuery.findUnique({
      where: { id: resolvedParams.id },
      include: {
        messages: { orderBy: { createdAt: "asc" } }
      }
    });
    if (!updatedQuery) return null;
    return {
      messages: updatedQuery.messages,
      status: updatedQuery.status
    };
  }

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin?tab=queries" className="w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-charcoal">{query.subject}</h1>
            <p className="text-sm text-slate">From: {query.user?.name || query.name} ({query.user?.email || query.email})</p>
          </div>
        </div>
        
        {query.status === "OPEN" ? (
          <form action={resolveQuery}>
            <button type="submit" className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors">
              Mark as Resolved
            </button>
          </form>
        ) : (
          <span className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold">
            Resolved
          </span>
        )}
      </div>

      <AdminQueryThread 
        initialMessages={query.messages} 
        query={{
          name: query.name,
          email: query.email,
          phone: query.phone,
          orderId: query.orderId,
          userId: query.userId,
          status: query.status,
        }} 
        onReply={replyToQuery}
        refreshMessages={refreshMessages}
      />
    </div>
  );
}
