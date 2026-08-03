"use client";

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown, RefreshCcw, Package, AlertCircle, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type ReturnRequest = {
  id: string;
  orderId: string;
  userId: string;
  items: string[];
  reasons: string[];
  description: string | null;
  refundMethod: string;
  refundDetails: string | null;
  status: string;
  isReadByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string | null;
    email: string | null;
  } | null;
  order?: any;
};

export function ReturnsManager({ initialReturns }: { initialReturns: ReturnRequest[] }) {
  const [filter, setFilter] = useState("ALL");

  const groupedReturns = useMemo(() => {
    let filtered = initialReturns;
    if (filter !== "ALL") {
      filtered = initialReturns.filter(r => r.status === filter || (filter === 'PENDING' && r.status === 'RETURN_REQUESTED'));
    }

    const groups: Record<string, any> = {};
    filtered.forEach(ret => {
      const email = ret.user?.email || "unknown@user.com";
      if (!groups[email]) {
        groups[email] = {
          name: ret.user?.name || "Unknown User",
          email: email,
          returns: [],
          lastUpdated: new Date(0),
          unreadCount: 0
        };
      }
      groups[email].returns.push(ret);
      if (new Date(ret.createdAt) > groups[email].lastUpdated) {
        groups[email].lastUpdated = new Date(ret.createdAt);
      }
      if (!ret.isReadByAdmin) {
        groups[email].unreadCount++;
      }
    });

    return Object.values(groups).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }, [initialReturns, filter]);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal flex items-center gap-2">
            <RefreshCcw size={24} className="text-teal-600" />
            Returns & Feedback
          </h2>
          <p className="text-slate text-sm mt-1">Manage customer return requests and feedback.</p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg overflow-x-auto w-full sm:w-auto">
          {["ALL", "PENDING", "RETURNED", "RETURN_REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold transition-colors whitespace-nowrap",
                filter === f ? "bg-white text-charcoal shadow-sm" : "text-slate hover:bg-slate-200"
              )}
            >
              {f === 'RETURN_REJECTED' ? 'REJECTED' : f}
            </button>
          ))}
        </div>
      </div>

      {groupedReturns.length === 0 ? (
        <div className="bg-slate-50 border border-charcoal/10 rounded-2xl p-12 text-center">
          <RefreshCcw size={48} className="mx-auto text-slate mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-charcoal mb-2">No returns found</h3>
          <p className="text-slate">There are no return requests matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedReturns.map(group => (
            <UserReturnGroup key={group.email} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserReturnGroup({ group }: { group: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localUnread, setLocalUnread] = useState(group.unreadCount);

  useEffect(() => {
    setLocalUnread(group.unreadCount);
  }, [group.unreadCount]);

  const toggleOpen = async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    
    if (willOpen && localUnread > 0) {
      setLocalUnread(0);
      try {
        const { markReturnsAsRead } = await import('@/actions/returns');
        const unreadIds = group.returns.filter((r: any) => !r.isReadByAdmin).map((r: any) => r.id);
        if (unreadIds.length > 0) {
          await markReturnsAsRead(unreadIds);
        }
      } catch(e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-charcoal/10 shadow-sm overflow-hidden">
      <button 
        onClick={toggleOpen}
        className="w-full bg-slate-50 px-4 md:px-6 py-4 border-b border-charcoal/10 flex items-start sm:items-center justify-between hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-charcoal">{group.name}</h3>
              {localUnread > 0 && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded shadow-sm">
                  {localUnread} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate">{group.email}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-medium text-slate">{format(new Date(group.lastUpdated), 'MMM dd, h:mm a')}</span>
            <span className="text-[10px] text-slate">{group.returns.length} Requests</span>
          </div>
          <ChevronDown className={cn("text-slate transition-transform shrink-0", isOpen && "rotate-180")} size={20} />
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-charcoal/5">
          {group.returns.map((ret: any) => (
            <ReturnItem key={ret.id} ret={ret} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReturnItem({ ret }: { ret: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleContactCustomer = async () => {
    const defaultMessage = "We need some additional details regarding your return request for Order #" + ret.orderId.slice(-8).toUpperCase() + ". Could you please provide images or a brief explanation?";
    const msg = prompt("Enter your first message to the customer:", defaultMessage);
    if (!msg) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { startReturnInquiry } = await import('@/actions/returns');
      const res = await startReturnInquiry(ret.id, msg);
      if (res.success && res.queryId) {
        router.push(`/admin/queries/${res.queryId}`);
      } else {
        setError(res.error || "Failed to start inquiry.");
        setIsSubmitting(false);
      }
    } catch (e: any) {
      setError(e.message);
      setIsSubmitting(false);
    }
  };

  const handleMarkReturned = async () => {
    if (confirm("Are you sure you want to accept this return request?")) {
      setIsSubmitting(true);
      setError(null);
      try {
        const { markReturnCompleted } = await import('@/actions/returns');
        const res = await markReturnCompleted(ret.id);
        if (!res.success) {
          setError(res.error || "Failed to accept return.");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please provide a reason for rejecting this return request (will be sent in email):");
    if (reason !== null) {
      setIsSubmitting(true);
      setError(null);
      try {
        const { rejectReturn } = await import('@/actions/returns');
        const res = await rejectReturn(ret.id, reason);
        if (!res.success) {
          setError(res.error || "Failed to reject return.");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-4 md:px-6 md:py-5 hover:bg-slate-50/50 transition-colors">
      {error && (
        <div className="mb-4 p-3 bg-error/10 text-error rounded-xl flex items-start gap-3 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-charcoal text-white text-[10px] font-bold px-2 py-1 rounded">
              ORDER #{ret.orderId.slice(-8).toUpperCase()}
            </span>
            <span className={cn(
              "px-2 py-1 rounded text-[10px] font-bold border",
              ret.status === 'PENDING' || ret.status === 'RETURN_REQUESTED' ? "bg-orange-50 text-orange-700 border-orange-200" :
              ret.status === 'RETURNED' ? "bg-green-50 text-green-700 border-green-200" :
              "bg-rose-50 text-rose-700 border-rose-200"
            )}>
              {ret.status === 'RETURN_REQUESTED' ? 'PENDING' : ret.status}
            </span>
            <span className="text-xs text-slate ml-auto md:ml-2">
              {format(new Date(ret.createdAt), 'MMM dd, yyyy h:mm a')}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Return Reasons</h4>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {ret.reasons?.map((r: string) => (
                <span key={r} className="bg-white border border-slate-200 px-2 py-1 rounded text-xs text-charcoal">
                  {r}
                </span>
              ))}
            </div>
            {ret.description && (
              <p className="text-sm text-slate italic border-l-2 border-slate-300 pl-2">{ret.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Items to Return</h4>
              <div className="space-y-1">
                {ret.order?.items?.filter((item: any) => ret.items?.includes(item.id)).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm text-charcoal">
                    <Package size={14} className="text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{item.productName} ({item.variantName})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Refund Request</h4>
              <p className="text-sm font-bold text-blue-900">{ret.refundMethod}</p>
              {ret.refundDetails && (
                <p className="text-sm text-blue-800 mt-1 whitespace-pre-wrap font-mono text-xs">{ret.refundDetails}</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-48 flex flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
          {ret.status === 'PENDING' || ret.status === 'RETURN_REQUESTED' ? (
            <>
              <button 
                onClick={handleMarkReturned}
                disabled={isSubmitting}
                className="w-full btn-primary py-2 text-xs flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <span className="animate-spin h-3 w-3 border-2 border-white rounded-full border-b-transparent"></span> : null}
                Mark as Returned
              </button>
              <button 
                onClick={handleReject}
                disabled={isSubmitting}
                className="w-full border-2 border-error text-error hover:bg-error/5 py-2 text-xs font-bold rounded-xl transition-colors disabled:opacity-70"
              >
                Reject Return
              </button>
            </>
          ) : (
            <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate uppercase tracking-wider mb-1">Status</p>
              <p className={cn(
                "text-sm font-bold",
                ret.status === 'RETURNED' ? "text-green-600" : "text-rose-600"
              )}>
                {ret.status}
              </p>
            </div>
          )}
          
          <button
            onClick={handleContactCustomer}
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-2 text-xs font-bold text-charcoal bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors mt-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="animate-spin h-3 w-3 border-2 border-charcoal rounded-full border-b-transparent"></span>
            ) : (
              <MessageSquare size={14} />
            )}
            Contact Customer
          </button>
        </div>
      </div>
    </div>
  );
}
