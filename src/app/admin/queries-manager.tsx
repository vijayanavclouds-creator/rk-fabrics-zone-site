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
  const [innerPage, setInnerPage] = useState(1);
  const innerItemsPerPage = 5;
  const totalInnerPages = Math.ceil(group.queries.length / innerItemsPerPage);
  const paginatedQueries = group.queries.slice((innerPage - 1) * innerItemsPerPage, innerPage * innerItemsPerPage);

  return (
    <div className="w-full bg-white">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 px-4 md:px-6 py-2 border-b border-charcoal/10 flex items-start sm:items-center justify-between hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold shrink-0 text-sm">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-charcoal text-sm">{group.name}</h3>
                {group.unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-sm">
                    {group.unreadCount} New Unread!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate">{group.email}</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] md:text-xs font-medium text-slate">{format(new Date(group.lastUpdated), 'MMM dd, h:mm a')}</span>
            <span className="text-[10px] text-slate">{group.queries.length} {group.queries.length === 1 ? 'Query' : 'Queries'}</span>
          </div>
          <ChevronDown className={cn("text-slate transition-transform shrink-0 mt-1 sm:mt-0", isOpen && "rotate-180")} size={16} />
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-charcoal/5">
          {paginatedQueries.map((query: any) => {
            const isForwardedByMira = query.messages?.some((m: any) => m.senderType === 'BOT' && m.message.includes('[TRANSFER_TO_HUMAN]'));
            
            return (
              <Link 
                key={query.id} 
                href={`${basePath}/queries/${query.id}`}
                className="block px-4 md:px-6 py-2 hover:bg-slate-50/50 transition-colors w-full text-left"
              >
                {/* Mobile Layout */}
                <div className="flex md:hidden flex-col gap-2 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("px-2 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap", getSubjectColor(query.subject))}>
                        {query.subject}
                      </span>
                      {query.status === "RESOLVED" && (
                        <span className="text-[10px] text-slate font-medium">Resolved</span>
                      )}
                      {!query.isRead && query.status !== "RESOLVED" && query.messages?.[query.messages.length - 1]?.senderType === "USER" && (
                        <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 animate-pulse whitespace-nowrap">
                          New Message!
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate font-medium bg-slate-100 border border-slate-200 px-2 py-1 rounded-md shrink-0">
                      {query.messages?.length || 1} msgs
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate">
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="shrink-0 text-slate/70" />
                      <span>{query.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="shrink-0 text-slate/70" />
                      <span>{format(new Date(query.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Strict Parallel Columns Layout */}
                <div className="hidden md:grid grid-cols-12 gap-4 w-full items-center">
                  <div className="col-span-4 flex items-center gap-2 truncate">
                    <span className={cn("px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold border whitespace-nowrap", getSubjectColor(query.subject))}>
                      {query.subject}
                    </span>
                    {query.status === "RESOLVED" && (
                      <span className="text-[10px] md:text-xs text-slate font-medium">Resolved</span>
                    )}
                    {!query.isRead && query.status !== "RESOLVED" && query.messages?.[query.messages.length - 1]?.senderType === "USER" && (
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 animate-pulse whitespace-nowrap">
                        New Message!
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-xs text-slate truncate">
                    <Phone size={14} className="shrink-0 text-slate/70" />
                    <span className="truncate">{query.phone || 'N/A'}</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-1.5 text-xs text-slate truncate">
                    <Calendar size={14} className="shrink-0 text-slate/70" />
                    <span className="truncate">{format(new Date(query.createdAt), 'MMM dd, yyyy h:mm a')}</span>
                    {isForwardedByMira && (
                      <div title="Escalated by AI Assistant" className="inline-flex shrink-0 ml-1">
                        <AlertCircle size={14} className="text-amber-500 fill-amber-50" />
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end items-center gap-2">
                    <span className="text-[10px] md:text-xs text-slate font-medium bg-slate-100 border border-slate-200 px-2 md:px-2.5 py-1 rounded-md whitespace-nowrap">
                      {query.messages?.length || 1} messages
                    </span>
                    <ChevronDown size={16} className="text-slate -rotate-90 shrink-0" />
                  </div>
                </div>
              </Link>
            );
          })}
          {totalInnerPages > 1 && (
            <div className="px-4 md:px-6 py-2 flex items-center justify-between border-t border-charcoal/5 bg-slate-50/50">
              <span className="text-[10px] text-slate">
                Showing {Math.min(group.queries.length, (innerPage - 1) * innerItemsPerPage + 1)} to {Math.min(innerPage * innerItemsPerPage, group.queries.length)} of {group.queries.length} queries
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setInnerPage(p => Math.max(1, p - 1))}
                  disabled={innerPage === 1}
                  className="px-2 py-1 md:px-3 md:py-1 rounded border border-charcoal/20 bg-white text-[10px] font-bold text-charcoal disabled:opacity-30 hover:bg-slate-50 transition-colors"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setInnerPage(p => Math.min(totalInnerPages, p + 1))}
                  disabled={innerPage === totalInnerPages}
                  className="px-2 py-1 md:px-3 md:py-1 rounded border border-charcoal/20 bg-white text-[10px] font-bold text-charcoal disabled:opacity-30 hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
      
      const isLatestUser = query.messages?.[query.messages.length - 1]?.senderType === "USER";
      if (!query.isRead && query.status !== "RESOLVED" && isLatestUser) {
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

  const [outerPage, setOuterPage] = useState(1);
  const outerItemsPerPage = 10;
  const totalOuterPages = Math.ceil(userGroups.length / outerItemsPerPage);
  const paginatedUserGroups = userGroups.slice((outerPage - 1) * outerItemsPerPage, outerPage * outerItemsPerPage);

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
    <div className="-mx-6 md:mx-0 md:rounded-2xl border-y md:border border-charcoal/10 shadow-sm overflow-hidden divide-y divide-charcoal/10 bg-white">
      {paginatedUserGroups.map((group) => (
        <UserQueryGroup key={group.id} group={group} basePath={basePath} />
      ))}
      
      {totalOuterPages > 1 && (
        <div className="p-4 flex items-center justify-center gap-2 bg-white">
          <button 
            onClick={() => setOuterPage(p => Math.max(1, p - 1))}
            disabled={outerPage === 1}
            className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <div className="flex items-center px-3 font-medium text-xs text-charcoal">
            Page {outerPage} of {totalOuterPages}
          </div>
          <button 
            onClick={() => setOuterPage(p => Math.min(totalOuterPages, p + 1))}
            disabled={outerPage === totalOuterPages}
            className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
