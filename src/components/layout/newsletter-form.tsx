"use client"

import { useState } from "react"
import { subscribeToNewsletter } from "@/actions/newsletter"
import { toast } from "sonner"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

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
    <form className="flex w-full md:w-auto relative" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 md:w-80 pl-6 pr-32 py-3.5 rounded-full bg-charcoal/50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] !border-none !outline-none focus:!border-none focus:!ring-0 focus:!outline-none text-white placeholder:text-white/40 text-sm transition-shadow disabled:opacity-50"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading}
        className="absolute right-1 top-1 bottom-1 px-6 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-500 hover:to-gold text-charcoal font-bold rounded-full text-sm shadow-[4px_4px_8px_rgba(0,0,0,0.3),-2px_-2px_6px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "..." : "Subscribe"}
      </button>
    </form>
  )
}
