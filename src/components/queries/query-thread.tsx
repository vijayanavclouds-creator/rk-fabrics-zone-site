"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { User, Building2, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { QueryChatInput } from "./query-chat-input"
import Link from "next/link"

type Message = {
  id: string
  message: string | null
  attachment: string | null
  senderType: string
  createdAt: Date
}

export function QueryThread({ 
  initialMessages, 
  status, 
  onReply,
  userImage,
  refreshMessages
}: { 
  initialMessages: Message[], 
  status: string,
  onReply: (formData: FormData) => Promise<void>,
  userImage?: string | null,
  refreshMessages?: () => Promise<{messages: Message[], status: string} | null>
}) {
  const [messages, setMessages] = useState(initialMessages)
  const [currentStatus, setCurrentStatus] = useState(status)
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Sync with server messages when they update
  useEffect(() => {
    setMessages(initialMessages)
    setCurrentStatus(status)
  }, [initialMessages, status])

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

  // Auto-refresh polling
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
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleReply = async (formData: FormData) => {
    const message = formData.get("message") as string
    const attachmentUrl = formData.get("attachment") as string 

    const optimisticMsg: Message = {
      id: Math.random().toString(),
      message: message || "",
      attachment: attachmentUrl || null,
      senderType: "CUSTOMER",
      createdAt: new Date()
    }

    // Add optimistic message
    setMessages(prev => [...prev, optimisticMsg])

    // Wait for server action
    startTransition(() => {
      onReply(formData).catch(e => console.error(e))
    })
  }

  return (
    <>
      {/* Messages Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar mb-6 scroll-smooth">
        {messages.map((msg, index) => {
          const isCustomer = msg.senderType === "CUSTOMER";
          const isBot = msg.senderType === "BOT" || (msg.senderType === "ADMIN" && msg.message && msg.message.includes("I will transfer this to a human agent")); // for backward compat
          const isAdmin = msg.senderType === "ADMIN" && !isBot;
          const isRead = isCustomer && messages.slice(index + 1).some(m => m.senderType === "ADMIN" || m.senderType === "BOT");

          return (
            <div key={msg.id} className={`flex gap-4 ${isCustomer ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 shrink-0">
                {isCustomer ? (
                  userImage ? (
                    <img src={userImage} alt="User" className="w-10 h-10 rounded-full object-cover shadow-sm border border-charcoal/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border border-slate-200">
                      <User size={18} className="text-slate-500 stroke-[1.5]" />
                    </div>
                  )
                ) : isBot ? (
                  <img src="/mira-avatar.png" alt="Mira" className="w-10 h-10 rounded-full object-cover shadow-sm border border-charcoal/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-100 border border-teal-200">
                    <span className="text-teal-700 font-bold text-sm">RK</span>
                  </div>
                )}
              </div>
              <div className={`max-w-[75%] ${isCustomer ? 'text-right' : 'text-left'}`}>
                {isBot && (
                  <p className="text-xs text-slate-500 font-medium mb-1 pl-1">✨ Mira (Virtual Assistant)</p>
                )}
                {isAdmin && (
                  <p className="text-xs text-slate-500 font-medium mb-1 pl-1">💬 RK Fabrics Support</p>
                )}
                {msg.message && (
                  <div className={`inline-block px-5 py-3.5 rounded-2xl text-sm whitespace-pre-wrap text-left shadow-sm ${isCustomer ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-sm border border-teal-800/20' : 'bg-white border border-slate-100/80 text-charcoal rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'}`}>
                    {(() => {
                      const text = msg.message;
                      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                      const parts = [];
                      let lastIndex = 0;
                      let match;
                      while ((match = linkRegex.exec(text)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(text.substring(lastIndex, match.index));
                        }
                        parts.push(
                          <Link key={match.index} href={match[2]} className={`underline font-semibold hover:opacity-80 transition-opacity ${isCustomer ? 'text-teal-100' : 'text-teal-600'}`}>
                            {match[1]}
                          </Link>
                        );
                        lastIndex = linkRegex.lastIndex;
                      }
                      if (lastIndex < text.length) {
                        parts.push(text.substring(lastIndex));
                      }
                      return parts.length > 0 ? parts : text;
                    })()}
                  </div>
                )}
                {msg.attachment && (
                  <div className={`mt-2.5 inline-block rounded-2xl overflow-hidden shadow-sm border ${isCustomer ? 'border-teal-700/20 rounded-tr-sm' : 'border-slate-100/80 rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]'}`}>
                    <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className="block relative group">
                      <img src={msg.attachment} alt="Attachment" className="max-w-[250px] max-h-[300px] object-cover hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <ExternalLink className="text-white drop-shadow-md" size={24} />
                      </div>
                    </a>
                  </div>
                )}
                <div className={`flex items-center gap-2 mt-1.5 px-1 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </p>
                  {isRead && (
                    <span className="text-[10px] text-teal-600 font-bold tracking-tight flex items-center">
                      Read ✓✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {currentStatus === "OPEN" && messages.length > 0 && messages[messages.length - 1].senderType === "CUSTOMER" && (
          (messages.some(m => (m.senderType === "BOT" || m.senderType === "ADMIN") && m.message && m.message.includes("I will transfer this to a human agent")) ||
           (Date.now() - new Date(messages[messages.length - 1].createdAt).getTime() > 120000)) ? (
            <div className="flex justify-center mt-6 mb-2 animate-in fade-in duration-500">
              <span className="inline-block px-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium rounded-full shadow-sm text-center">
                Our support team will respond to your message shortly.
              </span>
            </div>
          ) : (
            <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-10 h-10 shrink-0">
                <img src="/mira-avatar.png" alt="Mira" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" />
              </div>
              <div className="max-w-[75%] text-left">
                <p className="text-[11px] text-slate-500 font-semibold mb-1 pl-1">✨ Mira (Virtual Assistant)</p>
                <div className="inline-block px-5 py-4 rounded-2xl bg-white border border-slate-100/80 text-charcoal rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex space-x-1.5 items-center h-2 opacity-60">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
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
  )
}
