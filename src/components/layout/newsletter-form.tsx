"use client"

import { useState } from "react"
import { subscribeToNewsletter } from "@/actions/newsletter"
import { toast } from "sonner"
import { Send, Loader2 } from "lucide-react"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    const res = await subscribeToNewsletter(email)
    setLoading(false)

    if (res.success) {
      toast.success("Successfully subscribed to newsletter!")
      setEmail("")
    } else {
      toast.error(res.error || "Failed to subscribe")
    }
  }

  return (
    <form className="flex w-full relative mt-1" onSubmit={handleSubmit}>
      <div className={`flex items-center w-full rounded-full border border-white/40 bg-[var(--color-cream)] pl-5 pr-1.5 py-1.5 overflow-hidden transition-all duration-200 ${isFocused ? 'shadow-neo-pressed scale-[0.99]' : 'shadow-neo-btn'}`}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required
          className="flex-1 bg-transparent border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none text-charcoal placeholder:text-slate/60 text-sm transition-all disabled:opacity-50 min-w-0 py-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-7 h-7 flex items-center justify-center shrink-0 text-slate-500 hover:text-[#1a2b49] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin stroke-[1.5]" />
          ) : (
            <Send size={16} className="stroke-[1.5] translate-x-[-1px] translate-y-[1px]" />
          )}
        </button>
      </div>
    </form>
  )
}
