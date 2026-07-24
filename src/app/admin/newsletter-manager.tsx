"use client"

import { useState, useEffect } from "react"
import { sendNewsletter, generateNewsletterWithAI, getAdminNewsletters } from "@/actions/newsletter"
import { toast } from "sonner"
import { Send, Mail, Sparkles, Clock, Users, ArrowRight } from "lucide-react"

export function NewsletterManager() {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    const res = await getAdminNewsletters()
    if (res.success) {
      setCampaigns(res.newsletters)
    }
  }

  const handleGenerateAI = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt for the AI")
      return
    }

    setAiLoading(true)
    toast.loading("AI is writing your newsletter...", { id: "ai" })
    
    const res = await generateNewsletterWithAI(prompt)
    
    if (res.success) {
      setSubject(res.subject || "")
      setContent(res.content || "")
      toast.success("Newsletter generated!", { id: "ai" })
    } else {
      toast.error(res.error || "Failed to generate content", { id: "ai" })
    }
    
    setAiLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !content) {
      toast.error("Subject and content are required")
      return
    }

    setLoading(true)
    toast.loading("Sending newsletter...", { id: "send" })
    const res = await sendNewsletter(subject, content)

    if (res.success) {
      toast.success("Newsletter sent successfully to all users!", { id: "send" })
      setSubject("")
      setContent("")
      setPrompt("")
      loadCampaigns() // Refresh history
    } else {
      toast.error(res.error || "Failed to send newsletter", { id: "send" })
    }
    setLoading(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="mb-6 border-b border-charcoal/10 pb-4">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal flex items-center gap-2">
          <Mail className="text-teal-600" size={28} />
          Newsletter Studio
        </h2>
        <p className="text-slate mt-1 text-sm">
          Compose and send a new newsletter to all subscribed users. Or use AI to write it for you!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: COMPOSER */}
        <div className="bg-white p-6 rounded-3xl border border-charcoal/10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* AI Prompt Box */}
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
              <label className="flex items-center gap-2 text-sm font-bold text-teal-800 mb-2">
                <Sparkles size={16} />
                AI Content Generator
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Write an offer for 30% off silk sarees"
                  className="flex-1 px-4 py-2.5 bg-white border border-teal-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm placeholder:text-teal-900/30 text-teal-900"
                  disabled={aiLoading || loading}
                />
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiLoading || loading || !prompt}
                  className="bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-sm hover:shadow text-sm flex items-center gap-2 disabled:opacity-70"
                >
                  {aiLoading ? (
                    <span className="animate-pulse">Generating...</span>
                  ) : (
                    <>Generate</>
                  )}
                </button>
              </div>
            </div>

            <div className="h-px bg-charcoal/10 w-full" />

            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Big Summer Sale! ☀️"
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                disabled={loading || aiLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-2">Message Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your beautiful newsletter here..."
                rows={10}
                className="w-full px-4 py-3 bg-white border border-charcoal/20 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all custom-scrollbar"
                disabled={loading || aiLoading}
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading || aiLoading}
                className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send Newsletter"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: CAMPAIGN HISTORY */}
        <div className="bg-white p-6 rounded-3xl border border-charcoal/10 shadow-sm h-full max-h-[800px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-charcoal text-lg flex items-center gap-2">
              <Clock size={20} className="text-slate" />
              Campaign History
            </h3>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
              {campaigns.length} Sent
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
            {campaigns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate/50 space-y-3 py-12">
                <Mail size={48} className="opacity-20" />
                <p className="text-sm font-medium">No campaigns sent yet.</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 rounded-2xl border border-charcoal/5 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                  <h4 className="font-bold text-charcoal text-sm mb-1">{campaign.subject}</h4>
                  
                  <div className="flex items-center gap-4 text-xs text-slate mt-3">
                    <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-charcoal/5">
                      <Clock size={12} />
                      {new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm border border-charcoal/5">
                      <Users size={12} />
                      {campaign._count?.users || 0} Recipients
                    </span>
                  </div>

                  <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setSubject(campaign.subject)
                        setContent(campaign.content)
                        toast.success("Loaded into editor!")
                      }}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reuse Content <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
