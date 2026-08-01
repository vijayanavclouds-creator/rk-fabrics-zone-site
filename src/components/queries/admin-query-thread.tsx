"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Building2, User, ExternalLink, Bot } from "lucide-react";
import { QueryChatInput } from "./query-chat-input";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type Message = {
  id: string;
  senderType: string;
  message: string;
  attachment: string | null;
  createdAt: Date;
};

type QueryDetails = {
  name: string;
  email: string;
  phone: string | null;
  orderId: string | null;
  userId: string | null;
  status: string;
};

interface AdminQueryThreadProps {
  initialMessages: Message[];
  query: QueryDetails;
  onReply: (formData: FormData) => Promise<void>;
  refreshMessages: () => Promise<{messages: Message[], status: string} | null>;
}

export function AdminQueryThread({ initialMessages, query, onReply, refreshMessages }: AdminQueryThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [currentStatus, setCurrentStatus] = useState(query.status);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync with server messages
  useEffect(() => {
    setMessages(initialMessages);
    setCurrentStatus(query.status);
  }, [initialMessages, query.status]);

  // Real-time tab notifications
  const prevMessagesLength = useRef(initialMessages.length);
  const originalTitle = useRef("");

  useEffect(() => {
    originalTitle.current = document.title;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title = originalTitle.current;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      if (document.hidden) {
        document.title = `(1) New Message!`;
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Polling
  useEffect(() => {
    if (currentStatus !== "OPEN" || !refreshMessages) return;
    const interval = setInterval(async () => {
      try {
        const data = await refreshMessages();
        if (data) {
          setMessages(data.messages);
          if (data.status !== currentStatus) {
            setCurrentStatus(data.status);
          }
        }
      } catch (error) {
        console.error("Failed to refresh messages", error);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentStatus, refreshMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleReply = async (formData: FormData) => {
    const message = formData.get("message") as string;
    const attachmentUrl = formData.get("attachment") as string;

    const optimisticMsg: Message = {
      id: Math.random().toString(),
      message: message || "",
      attachment: attachmentUrl || null,
      senderType: "ADMIN",
      createdAt: new Date()
    };

    setMessages(prev => [...prev, optimisticMsg]);

    startTransition(() => {
      onReply(formData).catch(e => console.error(e));
    });
  };

  return (
    <>
      {/* Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-6 scroll-smooth">
        {messages.map((msg, index) => {
          const isBot = msg.senderType === "BOT" || (msg.senderType === "ADMIN" && msg.message && msg.message.includes("I will transfer this to a human agent")); // backward compat
          const isAdmin = msg.senderType === "ADMIN" && !isBot;
          const isStaff = isAdmin || isBot;
          const isFirstCustomerMessage = !isStaff && index === 0;
          return (
            <div key={msg.id} className={`flex gap-4 ${isStaff ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-teal-100 text-teal-700' : isBot ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-700'}`}>
                {isAdmin ? <Building2 size={18} /> : isBot ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className={`max-w-[75%] ${isStaff ? 'text-right' : 'text-left'}`}>
                {isBot && <p className="text-xs text-slate-500 font-medium mb-1 pr-1">✨ Mira (Bot)</p>}
                {isAdmin && <p className="text-xs text-slate-500 font-medium mb-1 pr-1">👤 You (Support)</p>}
                <div className={`inline-block px-5 py-3 rounded-2xl text-sm whitespace-pre-wrap text-left ${isAdmin ? 'bg-teal-600 text-white rounded-tr-sm' : isBot ? 'bg-slate-600 text-white rounded-tr-sm' : 'bg-slate-50 border border-charcoal/5 text-charcoal rounded-tl-sm'}`}>
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
                  ) : isBot ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&_a]:text-teal-300 [&_a]:underline [&_a:hover]:opacity-80">
                      <ReactMarkdown>{msg.message || ""}</ReactMarkdown>
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
      {currentStatus === "OPEN" && (
        <QueryChatInput onReply={handleReply} />
      )}
      
      {currentStatus === "RESOLVED" && (
        <div className="shrink-0 mt-auto bg-slate-50 p-4 rounded-2xl border border-charcoal/10 text-center text-sm text-slate">
          This query has been resolved by our support team.
        </div>
      )}
    </>
  );
}
