"use client"

import { useState } from "react"
import { sendNewsletter } from "@/actions/newsletter"
import { toast } from "sonner"
import { Send, Mail } from "lucide-react"

export function NewsletterManager() {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !content) {
      toast.error("Subject and content are required")
      return
    }

    setLoading(true)
    toast.loading("Sending newsletter...")
    const res = await sendNewsletter(subject, content)
    toast.dismiss()

    if (res.success) {
      toast.success("Newsletter sent successfully to all users!")
      setSubject("")
      setContent("")
    } else {
      toast.error(res.error || "Failed to send newsletter")
    }
    setLoading(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-6 border-b border-charcoal/10 pb-4">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal flex items-center gap-2">
          <Mail className="text-teal-600" size={28} />
          Newsletter Studio
        </h2>
        <p className="text-slate mt-1 text-sm">
          Compose and send a new newsletter to all subscribed users. It will appear directly in their customer portal.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-charcoal/10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Big Summer Sale! ☀️"
              className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-charcoal mb-2">Message Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your beautiful newsletter here..."
              rows={8}
              className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all custom-scrollbar"
              disabled={loading}
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-charcoal text-white px-8 py-3 rounded-xl font-bold hover:bg-charcoal/90 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Send size={18} />
              {loading ? "Sending..." : "Send Newsletter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
