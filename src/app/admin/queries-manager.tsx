"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, Mail, Phone, User, Calendar, MessageSquare } from "lucide-react";
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

export function QueriesManager({ initialQueries, basePath = "/admin" }: { initialQueries: Query[]; basePath?: string }) {
  // Group queries by registered user's email (or fallback to query email)
  const groupedQueries = initialQueries.reduce((acc, query) => {
    const emailToGroup = query.user?.email || query.email;
    if (!acc[emailToGroup]) {
      acc[emailToGroup] = [];
    }
    acc[emailToGroup].push(query);
    return acc;
  }, {} as Record<string, Query[]>);

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
    <div className="space-y-8">
      {Object.entries(groupedQueries).map(([email, userQueries]) => (
        <div key={email} className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-charcoal/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                {(userQueries[0].user?.name || userQueries[0].name).charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-charcoal">{userQueries[0].user?.name || userQueries[0].name}</h3>
                <p className="text-sm text-slate">{userQueries[0].user?.email || userQueries[0].email}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-slate bg-white px-3 py-1 rounded-full border border-charcoal/5">
              {userQueries.length} {userQueries.length === 1 ? 'Query' : 'Queries'}
            </div>
          </div>
          
          <div className="divide-y divide-charcoal/5">
            {userQueries.map((query) => (
              <Link 
                key={query.id} 
                href={`${basePath}/queries/${query.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors w-full text-left"
              >
                <div className="grid grid-cols-12 gap-4 w-full items-center">
                  <div className="col-span-3">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", getSubjectColor(query.subject))}>
                      {query.subject}
                    </span>
                    {query.status === "RESOLVED" && (
                      <span className="ml-2 text-xs text-slate font-medium">Resolved</span>
                    )}
                    {!query.isRead && query.status !== "RESOLVED" && (
                      <span className="ml-2 text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                        (1) New Message!
                      </span>
                    )}
                  </div>
                  <div className="col-span-3 text-sm text-charcoal flex items-center gap-2">
                    <Calendar size={14} className="text-slate" />
                    {format(new Date(query.createdAt), 'MMM dd, yyyy h:mm a')}
                  </div>
                  <div className="col-span-3 text-sm text-slate flex items-center gap-2">
                    <Phone size={14} />
                    {query.phone || 'N/A'}
                  </div>
                  <div className="col-span-3 flex justify-end items-center gap-2">
                    <span className="text-xs text-slate">{query.messages?.length || 1} messages</span>
                    <ChevronDown size={18} className="text-slate -rotate-90" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
