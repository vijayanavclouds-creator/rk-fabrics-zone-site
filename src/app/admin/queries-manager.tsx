"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ChevronDown, Mail, Phone, User, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import Link from "next/link";

type QueryMessage = {
  id: string;
  senderType: string;
  message: string;
  createdAt: Date;
};

type Query = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  status: string;
  isRead: boolean;
  createdAt: Date;
  messages: QueryMessage[];
  userId?: string | null;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
};

// Map subjects to colors for badges
const getSubjectColor = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes("wholesale")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (s.includes("order")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("return") || s.includes("exchange")) return "bg-orange-100 text-orange-700 border-orange-200";
  if (s.includes("custom")) return "bg-teal-100 text-teal-700 border-teal-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
};

function UserQueryGroup({ group, basePath }: { group: any; basePath: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="-mx-6 md:mx-0 bg-white rounded-none md:rounded-2xl border-y md:border border-charcoal/10 shadow-sm overflow-hidden mb-4 md:mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 px-4 md:px-6 py-4 border-b border-charcoal/10 flex items-start sm:items-center justify-between hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-charcoal">{group.name}</h3>
                {group.unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-sm">
                    {group.unreadCount} New Unread!
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate">{group.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-slate">{format(new Date(group.lastUpdated), 'MMM dd, h:mm a')}</span>
            <span className="text-[10px] sm:text-xs text-slate">{group.queries.length} {group.queries.length === 1 ? 'Query' : 'Queries'}</span>
          </div>
          <ChevronDown className={cn("text-slate transition-transform shrink-0 mt-1 sm:mt-0", isOpen && "rotate-180")} size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-charcoal/5">
          {group.queries.map((query: any) => {
            const isForwardedByMira = query.messages?.some((m: any) => m.senderType === 'BOT' && m.message.includes('[TRANSFER_TO_HUMAN]'));
            
            return (
              <Link 
                key={query.id} 
                href={`${basePath}/queries/${query.id}`}
                className="block px-4 md:px-6 py-4 hover:bg-slate-50/50 transition-colors w-full text-left"
              >
                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 w-full items-start md:items-center">
                  
                  {/* Mobile Row 1 / Desktop Col 1 */}
                  <div className="md:col-span-4 w-full flex items-start justify-between md:justify-start gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold border whitespace-nowrap", getSubjectColor(query.subject))}>
                        {query.subject}
                      </span>
                      
                      {query.status === "RESOLVED" && (
                        <span className="text-xs text-slate font-medium">Resolved</span>
                      )}
                      {!query.isRead && query.status !== "RESOLVED" && query.messages?.[query.messages.length - 1]?.senderType === "USER" && (
                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 animate-pulse whitespace-nowrap">
                          New Message!
                        </span>
                      )}
                    </div>
                    
                    {/* Only show messages count on right side on mobile, hidden on desktop here */}
                    <div className="md:hidden shrink-0">
                      <span className="text-[10px] text-slate font-medium bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                        {query.messages?.length || 1} msgs
                      </span>
                    </div>
                  </div>

                  {/* Mobile Row 2 / Desktop Col 2 & 3 */}
                  <div className="md:col-span-6 w-full flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate">
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="shrink-0 text-slate/70" />
                      <span>{query.phone || 'N/A'}</span>
                    </div>
                    
                    <div className="hidden md:block w-1 h-1 rounded-full bg-slate-300" />
                    
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="shrink-0 text-slate/70" />
                      <span>{format(new Date(query.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                    </div>

                    {isForwardedByMira && (
                      <div className="relative group/tooltip inline-flex items-center justify-center ml-auto md:ml-2">
                        <AlertCircle size={16} className="text-amber-500 fill-amber-50" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-charcoal text-white text-[10px] rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg font-medium">
                          Escalated by AI Assistant
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-charcoal"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop Col 4 (Hidden on Mobile) */}
                  <div className="hidden md:flex md:col-span-2 justify-end items-center gap-2">
                    <span className="text-xs text-slate font-medium bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                      {query.messages?.length || 1} messages
                    </span>
                    <ChevronDown size={18} className="text-slate -rotate-90" />
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function QueriesManager({ initialQueries, basePath = "/admin" }: { initialQueries: Query[]; basePath?: string }) {
  const userGroups = useMemo(() => {
    const groups: Record<string, any> = {};
    
    initialQueries.forEach(query => {
      // Group by user ID if possible, otherwise email
      const groupKey = query.userId || query.email;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          email: query.user?.email || query.email,
          name: query.user?.name || query.name,
          queries: [],
          unreadCount: 0,
          lastUpdated: 0
        };
      }
      
      const group = groups[groupKey];
      group.queries.push(query);
      
      if (!query.isRead && query.status !== "RESOLVED") {
        group.unreadCount += 1;
      }
      
      // Calculate max date for this query
      let queryMaxDate = new Date(query.createdAt).getTime();
      if (query.messages && query.messages.length > 0) {
        const messageMaxDate = Math.max(...query.messages.map(m => new Date(m.createdAt).getTime()));
        if (messageMaxDate > queryMaxDate) queryMaxDate = messageMaxDate;
      }
      
      if (queryMaxDate > group.lastUpdated) {
        group.lastUpdated = queryMaxDate;
      }
    });

    return Object.values(groups).sort((a, b) => b.lastUpdated - a.lastUpdated).map(group => {
      // Sort queries inside group
      group.queries.sort((a: Query, b: Query) => {
        let aMax = new Date(a.createdAt).getTime();
        if (a.messages && a.messages.length > 0) {
          aMax = Math.max(aMax, ...a.messages.map(m => new Date(m.createdAt).getTime()));
        }
        let bMax = new Date(b.createdAt).getTime();
        if (b.messages && b.messages.length > 0) {
          bMax = Math.max(bMax, ...b.messages.map(m => new Date(m.createdAt).getTime()));
        }
        return bMax - aMax;
      });
      return group;
    });
  }, [initialQueries]);

  if (initialQueries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-charcoal/10 p-12 text-center shadow-sm">
        <MessageSquare size={48} className="mx-auto text-slate mb-4" />
        <h3 className="text-xl font-bold text-charcoal mb-2">No Queries Found</h3>
        <p className="text-slate">When customers send messages from the contact form, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-4">
      {userGroups.map((group) => (
        <UserQueryGroup key={group.id} group={group} basePath={basePath} />
      ))}
    </div>
  );
}
