import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Send, User, Building2, Paperclip, ExternalLink } from "lucide-react";
import { logAdminActivity } from "@/actions/admin-activity";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";
import { QueryChatInput } from "@/components/queries/query-chat-input";

export default async function AdminQueryThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")) {
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
    redirect("/support?tab=queries");
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

    await logAdminActivity(`replied to query <a href="/admin/queries/${query!.id}" class="text-teal-600 hover:underline font-semibold">${query!.subject}</a> from <b>${query!.name || query!.user?.name || "Customer"}</b>`);
    revalidatePath(`/support/queries/${query!.id}`);
  }

  async function resolveQuery() {
    "use server";
    await prisma.contactQuery.update({
      where: { id: query!.id },
      data: { status: "RESOLVED" }
    });
    await logAdminActivity(`resolved query <a href="/admin/queries/${query!.id}" class="text-teal-600 hover:underline font-semibold">${query!.subject}</a> from <b>${query!.name || query!.user?.name || "Customer"}</b>`);
    revalidatePath(`/support/queries/${query!.id}`);
  }

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-charcoal/10 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/support?tab=queries" className="w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-slate-50 transition-colors">
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

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-6">
        {query.messages.map((msg, index) => {
          const isAdmin = msg.senderType === "ADMIN";
          const isFirstCustomerMessage = !isAdmin && index === 0;
          return (
            <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>
                {isAdmin ? <Building2 size={18} /> : <User size={18} />}
              </div>
              <div className={`max-w-[75%] ${isAdmin ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-5 py-3 rounded-2xl text-sm whitespace-pre-wrap text-left ${isAdmin ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-slate-50 border border-charcoal/5 text-charcoal rounded-tl-sm'}`}>
                  {isFirstCustomerMessage ? (
                    <div>
                      <div className="text-xs text-slate-500 mb-2 pb-2 border-b border-charcoal/10">
                        <strong className="text-charcoal font-semibold">Contact Info Provided:</strong><br/>
                        Name: {query.name}<br/>
                        Email: {query.email}<br/>
                        Phone: {query.phone || "N/A"}
                        {query.orderId && query.userId && (
                          <>
                            <br/>
                            <strong className="text-charcoal font-semibold mt-2 block">Related Order:</strong>
                            <Link href={`/admin/orders/user/${query.userId}#${query.orderId}`} className="text-teal-600 hover:underline inline-flex items-center gap-1 font-medium mt-1">
                              #{query.orderId.slice(-8).toUpperCase()}
                            </Link>
                          </>
                        )}
                      </div>
                      {msg.message}
                    </div>
                  ) : (
                    msg.message
                  )}
                </div>
                {msg.attachment && (
                  <div className={`mt-2 inline-block rounded-2xl overflow-hidden border border-charcoal/10 ${isAdmin ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                    <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className="block relative group">
                      <img src={msg.attachment} alt="Attachment" className="max-w-[250px] max-h-[300px] object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ExternalLink className="text-white" size={24} />
                      </div>
                    </a>
                  </div>
                )}
                <p className="text-xs text-slate mt-1 px-1">
                  {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply Box */}
      {query.status === "OPEN" && (
        <QueryChatInput onReply={replyToQuery} />
      )}
      
      {query.status === "RESOLVED" && (
        <div className="shrink-0 mt-auto bg-slate-50 p-4 rounded-2xl border border-charcoal/10 text-center text-sm text-slate">
          This query has been resolved. The conversation is closed.
        </div>
      )}
    </div>
  );
}
