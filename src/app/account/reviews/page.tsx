import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, Star, ChevronRight, Calendar, User, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const getSubjectColor = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes("wholesale")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (s.includes("order")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("return") || s.includes("exchange")) return "bg-orange-100 text-orange-700 border-orange-200";
  if (s.includes("custom")) return "bg-teal-100 text-teal-700 border-teal-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

export default async function ReviewsAndQueriesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const currentTab = resolvedSearchParams.tab === 'queries' ? 'queries' : 'reviews';

  const queries = await prisma.contactQuery.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      messages: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4 mb-6">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal flex items-center gap-3">
            <MessageSquare size={24} className="text-teal-600" />
            My Reviews & Queries
          </h2>
          <p className="text-slate mt-1 text-sm">Manage your product reviews and support inquiries.</p>
        </div>
        {currentTab === 'queries' && (
          <Link 
            href="/contact"
            className="btn-primary px-8 py-3.5 flex items-center justify-center text-center font-bold min-w-[160px]"
          >
            New Inquiry
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal/10 mb-6">
        <Link 
          href="/account/reviews?tab=reviews"
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            currentTab === 'reviews' 
              ? "border-teal-600 text-teal-700" 
              : "border-transparent text-slate hover:text-charcoal hover:border-charcoal/20"
          )}
        >
          Product Reviews
        </Link>
        <Link 
          href="/account/reviews?tab=queries"
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            currentTab === 'queries' 
              ? "border-teal-600 text-teal-700" 
              : "border-transparent text-slate hover:text-charcoal hover:border-charcoal/20"
          )}
        >
          Support Queries
          {queries.length > 0 && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              currentTab === 'queries' ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"
            )}>
              {queries.length}
            </span>
          )}
        </Link>
      </div>

      {currentTab === 'reviews' ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-charcoal/10">
          <Star size={48} className="mx-auto text-slate mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-charcoal mb-2">No reviews yet</h3>
          <p className="text-slate mb-8 max-w-md mx-auto">Share your thoughts on products you've purchased to help other shoppers.</p>
        </div>
      ) : (
        <>
          {queries.length === 0 ? (
            <div className="bg-white rounded-2xl border border-charcoal/10 p-12 text-center shadow-sm">
              <HelpCircle size={48} className="mx-auto text-slate mb-4" />
              <h3 className="text-xl font-bold text-charcoal mb-2">No Queries Found</h3>
              <p className="text-slate">You haven't submitted any inquiries yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
              <div className="divide-y divide-charcoal/5">
                {queries.map((query) => (
                  <Link 
                    key={query.id} 
                    href={`/account/queries/${query.id}`}
                    className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors w-full text-left"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", getSubjectColor(query.subject))}>
                          {query.subject}
                        </span>
                        {query.status === "RESOLVED" && (
                          <span className="text-xs text-slate font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Resolved</span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal line-clamp-1 mb-2 font-medium">
                        {query.messages[0]?.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(query.createdAt), 'MMM dd, yyyy')}</span>
                        <span className="flex items-center gap-1"><User size={14} /> {query.messages.length} messages</span>
                      </div>
                    </div>
                    <div className="ml-4 pl-4 border-l border-charcoal/10 shrink-0">
                      <ChevronRight size={20} className="text-slate" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
