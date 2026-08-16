"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown, RefreshCcw, Package, AlertCircle, MessageSquare, X, CheckCircle2, XCircle } from "lucide-react";
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

export function ReturnsManager({ initialReturns, queries = [] }: { initialReturns: ReturnRequest[], queries?: any[] }) {
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
            <UserReturnGroup key={group.email} group={group} queries={queries} />
          ))}
        </div>
      )}
    </div>
  );
}

function UserReturnGroup({ group, queries }: { group: any, queries: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [localUnread, setLocalUnread] = useState(group.unreadCount);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        className="w-full bg-slate-50 px-3 md:px-4 py-2.5 md:py-3 border-b border-charcoal/10 flex items-start sm:items-center justify-between hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold shrink-0 text-sm">
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
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-medium text-slate">{format(new Date(group.lastUpdated), 'MMM dd, h:mm a')}</span>
            <span className="text-[10px] text-slate">{group.returns.length} Requests</span>
          </div>
          <ChevronDown className={cn("text-slate transition-transform shrink-0", isOpen && "rotate-180")} size={18} />
        </div>
      </button>

      {isOpen && (
        <div className="p-3 bg-slate-50/50 flex flex-col gap-3">
          {group.returns.map((ret: any) => (
            <ReturnItem key={ret.id} ret={ret} queries={queries} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReturnItem({ ret, queries }: { ret: any, queries: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("We need some additional details regarding your return request for Order #" + ret.orderId.slice(-8).toUpperCase() + ". Could you please provide images or a brief explanation?");

  // Determine if there is an active conversation
  const activeQuery = queries?.find(q => q.orderId === ret.orderId && q.status === "OPEN");
  const isUnread = activeQuery && !activeQuery.isRead;

  const handleContactCustomer = () => {
    if (activeQuery) {
      router.push(`/admin/queries/${activeQuery.id}`);
      return;
    }
    setShowModal(true);
  };

  const submitContactMessage = async () => {
    if (!contactMessage) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { startReturnInquiry } = await import('@/actions/returns');
      const res = await startReturnInquiry(ret.id, contactMessage);
      if (res.success && res.queryId) {
        setShowModal(false);
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



  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleMarkReturned = () => {
    setShowAcceptModal(true);
  };

  const confirmAccept = async () => {
    setShowAcceptModal(false);
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
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) return;
    
    setShowRejectModal(false);
    setIsSubmitting(true);
    setError(null);
    try {
      const { rejectReturn } = await import('@/actions/returns');
      const res = await rejectReturn(ret.id, rejectReason);
      if (!res.success) {
        setError(res.error || "Failed to reject return.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow transition-shadow">
      {error && (
        <div className="mt-4 p-3 bg-error/10 text-error rounded-xl text-sm font-medium flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-charcoal/5">
              <h3 className="font-[family-name:var(--font-playfair)] font-bold text-lg text-charcoal flex items-center gap-2">
                <CheckCircle2 size={18} className="text-teal-600" />
                Confirm Acceptance
              </h3>
              <button 
                onClick={() => setShowAcceptModal(false)}
                className="p-1 text-slate hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-slate text-sm">Are you sure you want to accept this return request?</p>
              <p className="text-slate text-xs font-medium">This action will process the refund based on the selected method.</p>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-charcoal/5">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate hover:bg-slate-200 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAccept}
                className="btn-primary py-2 px-6 text-sm flex justify-center items-center gap-2"
              >
                Accept Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-charcoal/5">
              <h3 className="font-[family-name:var(--font-playfair)] font-bold text-lg text-charcoal flex items-center gap-2">
                <XCircle size={18} className="text-error" />
                Reject Return Request
              </h3>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="p-1 text-slate hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-cream rounded-xl p-3 text-sm focus:outline-none min-h-[120px] custom-scrollbar text-charcoal border-2 border-transparent focus:border-error/20"
                  placeholder="Please provide a reason for rejecting this return request. This will be sent to the customer."
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-charcoal/5">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate hover:bg-slate-200 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="bg-error hover:bg-error/90 text-white font-bold py-2 px-6 rounded-full text-sm flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-charcoal/5">
              <h3 className="font-[family-name:var(--font-playfair)] font-bold text-lg text-charcoal flex items-center gap-2">
                <MessageSquare size={18} className="text-teal-600" />
                Contact Customer
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-slate hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-cream rounded-xl p-3 text-sm focus:outline-none min-h-[120px] custom-scrollbar text-charcoal"
                  placeholder="Type your message here..."
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end gap-2 border-t border-charcoal/5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate hover:bg-slate-200 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitContactMessage}
                disabled={isSubmitting || !contactMessage.trim()}
                className="btn-primary py-2 px-6 text-sm flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting && <span className="animate-spin h-4 w-4 border-2 border-white rounded-full border-b-transparent"></span>}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-3">
        {/* Row 1: Header */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-charcoal text-white text-[10px] font-bold px-2 py-1 rounded shrink-0">
              ORDER #{ret.orderId.slice(-8).toUpperCase()}
            </span>
            <span className={cn(
              "px-2 py-1 rounded text-[10px] font-bold border shrink-0",
              ret.status === 'PENDING' || ret.status === 'RETURN_REQUESTED' ? "bg-orange-50 text-orange-700 border-orange-200" :
              ret.status === 'RETURNED' ? "bg-green-50 text-green-700 border-green-200" :
              "bg-rose-50 text-rose-700 border-rose-200"
            )}>
              {ret.status === 'RETURN_REQUESTED' ? 'PENDING' : ret.status}
            </span>
            <span className="text-xs text-slate shrink-0">
              {format(new Date(ret.createdAt), 'MMM dd, yyyy h:mm a')}
            </span>
            
            <div className="flex items-center gap-1.5 ml-0 md:ml-2 border-l-0 md:border-l border-slate-200 pl-0 md:pl-3 shrink-0">
              <span className="text-[10px] font-bold text-slate uppercase">Refund:</span>
              <span className="text-[11px] font-bold text-blue-700">{ret.refundMethod}</span>
            </div>
          </div>
          
          {/* Header Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {ret.status === 'PENDING' || ret.status === 'RETURN_REQUESTED' ? (
              <>
                <button 
                  onClick={handleMarkReturned}
                  disabled={isSubmitting}
                  className="btn-primary py-1 px-3 text-[10px] flex justify-center items-center gap-1.5 disabled:opacity-70 h-7"
                >
                  {isSubmitting && <span className="animate-spin h-3 w-3 border-2 border-white rounded-full border-b-transparent"></span>}
                  Accept
                </button>
                <button 
                  onClick={handleRejectClick}
                  disabled={isSubmitting}
                  className="border-2 border-error text-error hover:bg-error/5 py-1 px-3 text-[10px] font-bold rounded-lg transition-colors disabled:opacity-70 h-7"
                >
                  Reject
                </button>
              </>
            ) : null}
            
            <button
              onClick={handleContactCustomer}
              disabled={isSubmitting}
              className={cn(
                "flex justify-center items-center gap-1.5 py-1 px-3 text-[10px] font-bold rounded-lg border transition-colors h-7 disabled:opacity-70",
                activeQuery 
                  ? "bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200" 
                  : "text-charcoal bg-slate-100 hover:bg-slate-200 border-slate-300"
              )}
            >
              {isSubmitting ? (
                <span className="animate-spin h-3 w-3 border-2 border-current rounded-full border-b-transparent"></span>
              ) : (
                <MessageSquare size={12} />
              )}
              {activeQuery ? (isUnread ? "View Conversation (1)" : "View Conversation") : "Contact"}
            </button>
          </div>
        </div>

        {/* Row 2: Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Col 1: Items to Return */}
          <div>
            <h4 className="text-[10px] font-bold text-charcoal uppercase tracking-wider mb-1.5">Items to Return</h4>
            <div className="space-y-1">
              {ret.order?.items?.filter((item: any) => ret.items?.includes(item.id)).map((item: any) => (
                <div key={item.id} className="flex items-center gap-1.5 text-xs text-charcoal bg-slate-50 border border-slate-100 rounded p-1.5">
                  <Package size={12} className="text-slate-400 shrink-0" />
                  <span className="line-clamp-1">{item.productName} ({item.variantName})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2: Return Reasons */}
          <div>
            <h4 className="text-[10px] font-bold text-charcoal uppercase tracking-wider mb-1.5">Return Reasons</h4>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {ret.reasons?.map((r: string) => (
                <span key={r} className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-charcoal">
                  {r}
                </span>
              ))}
            </div>
            {ret.description && (
              <p className="text-xs text-slate italic border-l-2 border-slate-300 pl-2 mt-1.5">{ret.description}</p>
            )}
            {ret.refundDetails && (
              <div className="mt-2 text-slate whitespace-pre-wrap font-mono text-[10px] bg-blue-50/50 p-2 border border-blue-100 rounded">
                <span className="font-bold text-blue-800 uppercase block mb-1">Refund Details:</span>
                {ret.refundDetails}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
