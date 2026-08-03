"use client"

import { useState, useEffect, useRef } from "react"
import { sendNewsletter, generateNewsletterWithAI, getAdminNewsletters, deleteAdminNewsletter } from "@/actions/newsletter"
import { createGlobalCoupon, getGlobalCoupons, deactivateGlobalCoupon } from "@/actions/coupon"
import { toast } from "sonner"
import { Send, Mail, Sparkles, Clock, Users, ArrowRight, Trash2, Ticket, ChevronDown } from "lucide-react"

interface Campaign {
  id: string
  subject: string
  content: string
  createdAt: Date
  _count: { users: number }
}

interface Coupon {
  id: string
  code: string
  discountValue: number
  discountType: string
  isForNewUsersOnly: boolean
  expiresAt: Date
  isActive: boolean
}

export function NewsletterManager() {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [couponVal, setCouponVal] = useState("")
  const [couponType, setCouponType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE")
  const [couponExpiry, setCouponExpiry] = useState(30)
  const [isForNewUsersOnly, setIsForNewUsersOnly] = useState(false)
  const [generatingCoupon, setGeneratingCoupon] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false)
  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const expiryDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false)
      }
      if (expiryDropdownRef.current && !expiryDropdownRef.current.contains(event.target as Node)) {
        setShowExpiryDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const loadCoupons = async () => {
    const res = await getGlobalCoupons()
    if (res.success) {
      setCoupons((res.coupons as unknown as Coupon[]) || [])
    }
  }

  const handleCreateCoupon = async () => {
    const val = parseFloat(couponVal)
    if (!val || val <= 0) {
      toast.error("Please enter a valid discount amount")
      return
    }

    setGeneratingCoupon(true)
    toast.loading("Generating global promo code...", { id: "coupon" })
    const res = await createGlobalCoupon({
      discountValue: val,
      discountType: couponType,
      expiresInDays: couponExpiry,
      isForNewUsersOnly,
    })
    
    if (res.success) {
      toast.success("Promo code generated successfully!", { id: "coupon" })
      setCouponVal("")
      loadCoupons()
    } else {
      toast.error(res.error || "Failed to generate promo code", { id: "coupon" })
    }
    setGeneratingCoupon(false)
  }

  const handleDeactivateCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to permanently deactivate this promo code?")) return
    
    toast.loading("Deactivating...", { id: "deactivate" })
    const res = await deactivateGlobalCoupon(id)
    if (res.success) {
      toast.success("Promo code deactivated!", { id: "deactivate" })
      loadCoupons()
    } else {
      toast.error(res.error || "Failed to deactivate", { id: "deactivate" })
    }
  }

  const loadCampaigns = async () => {
    const res = await getAdminNewsletters()
    if (res.success) {
      setCampaigns((res.newsletters as unknown as Campaign[]) || [])
    }
  }

  useEffect(() => {
    (async () => {
      await loadCampaigns()
      await loadCoupons()
    })()
  }, [])

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) return;
    
    toast.loading("Deleting campaign...", { id: "delete" });
    const res = await deleteAdminNewsletter(id);
    
    if (res.success) {
      toast.success("Campaign deleted successfully!", { id: "delete" });
      loadCampaigns();
    } else {
      toast.error(res.error || "Failed to delete campaign", { id: "delete" });
    }
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

      {/* GLOBAL COUPONS CARD */}
      <div className="-mx-4 md:mx-0 bg-white p-4 md:p-6 rounded-none md:rounded-3xl border-y md:border border-charcoal/10 shadow-sm mb-0 md:mb-8">
        <h3 className="text-lg font-bold text-charcoal mb-4 flex items-center gap-2">
          <Ticket size={20} className="text-teal-600" />
          Global Promo Codes
        </h3>
        
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input 
              type="number"
              placeholder="Value"
              value={couponVal}
              onChange={e => setCouponVal(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
            />
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none" ref={typeDropdownRef}>
                <button 
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className={`w-full sm:w-[100px] px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal transition-all flex justify-between items-center`}
                >
                  {couponType === 'PERCENTAGE' ? '% OFF' : '₹ OFF'}
                  <ChevronDown size={14} className={`opacity-50 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showTypeDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-charcoal/10 rounded-xl shadow-xl z-50 p-1.5 overflow-hidden">
                    <button type="button" onClick={() => { setCouponType('PERCENTAGE'); setShowTypeDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${couponType === 'PERCENTAGE' ? 'bg-teal-50/80 font-bold' : 'hover:bg-slate-50'}`}>% OFF</button>
                    <button type="button" onClick={() => { setCouponType('FIXED'); setShowTypeDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${couponType === 'FIXED' ? 'bg-teal-50/80 font-bold' : 'hover:bg-slate-50'}`}>₹ OFF</button>
                  </div>
                )}
              </div>
              
              <div className="relative flex-1 sm:flex-none" ref={expiryDropdownRef}>
                <button 
                  type="button"
                  onClick={() => setShowExpiryDropdown(!showExpiryDropdown)}
                  className={`w-full sm:w-[110px] px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal transition-all flex justify-between items-center`}
                >
                  {couponExpiry} Days
                  <ChevronDown size={14} className={`opacity-50 transition-transform ${showExpiryDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showExpiryDropdown && (
                  <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-charcoal/10 rounded-xl shadow-xl z-50 p-1.5 overflow-hidden">
                    {[7, 15, 30, 90].map((days) => (
                      <button key={days} type="button" onClick={() => { setCouponExpiry(days); setShowExpiryDropdown(false); }} className={`w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${couponExpiry === days ? 'bg-teal-50/80 font-bold' : 'hover:bg-slate-50'}`}>
                        {days} Days
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="flex items-center justify-center gap-2 text-sm font-bold text-charcoal cursor-pointer px-4 py-2.5 md:py-3 h-full">
              <input 
                type="checkbox" 
                checked={isForNewUsersOnly}
                onChange={e => setIsForNewUsersOnly(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
              For new users
            </label>
            <button 
              onClick={handleCreateCoupon}
              disabled={generatingCoupon || !couponVal}
              className="btn-primary px-6 py-2.5 md:py-3 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-70 whitespace-nowrap h-full"
            >
              Generate
            </button>
          </div>
        </div>

        {coupons.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 bg-slate-50 border border-charcoal/10 rounded-2xl text-sm font-bold text-charcoal shadow-sm">
              <div>Code</div>
              <div>Discount</div>
              <div>Target</div>
              <div>Expires</div>
              <div>Status</div>
              <div className="text-right">Action</div>
            </div>
            
            {/* Coupon List */}
            <div className="flex flex-col gap-3">
              {coupons.map(c => (
                <div key={c.id} className={`flex flex-col md:grid md:grid-cols-6 gap-3 md:gap-4 p-4 md:px-6 md:py-4 items-start md:items-center border border-charcoal/10 rounded-2xl bg-white transition-all ${!c.isActive ? 'opacity-60 bg-slate-50/50' : 'shadow-sm hover:shadow-md'}`}>
                  
                  {/* Mobile Row 1 / Desktop Col 1 & 2 */}
                  <div className="flex justify-between items-center w-full md:w-auto md:col-span-2 md:grid md:grid-cols-2 md:gap-4 border-b border-charcoal/5 pb-3 md:border-0 md:pb-0">
                    <div className="font-black font-mono text-teal-700 text-lg md:text-base tracking-wider bg-teal-50 px-3 py-1 rounded-lg border border-teal-100/50 md:bg-transparent md:border-0 md:px-0 md:py-0">{c.code}</div>
                    <div className="font-bold text-charcoal/80 text-sm md:text-sm">{c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</div>
                  </div>

                  {/* Mobile Row 2 / Desktop Col 3-6 */}
                  <div className="flex flex-wrap items-center justify-between w-full md:w-auto md:col-span-4 md:grid md:grid-cols-4 md:gap-4 pt-1 md:pt-0">
                    <div className="flex-1 min-w-[100px] mb-2 md:mb-0">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${c.isForNewUsersOnly ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {c.isForNewUsersOnly ? 'New Users' : 'All Users'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-[100px] text-sm font-medium text-slate mb-2 md:mb-0 flex items-center gap-1.5">
                      <Clock size={14} className="opacity-50" />
                      {new Date(c.expiresAt).toLocaleDateString()}
                    </div>
                    <div className="flex-1 min-w-[80px]">
                      {c.isActive ? (
                        <span className="text-green-600 text-sm font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>Active</span>
                      ) : (
                        <span className="text-rose-600 text-sm font-bold">Inactive</span>
                      )}
                    </div>
                    <div className="w-full md:w-auto text-right mt-3 md:mt-0 border-t border-charcoal/5 pt-3 md:border-0 md:pt-0">
                      {c.isActive ? (
                        <button 
                          onClick={() => handleDeactivateCoupon(c.id)}
                          className="w-full md:w-auto text-xs font-bold text-rose-600 bg-rose-50 px-4 py-2.5 md:py-2 rounded-full hover:bg-rose-100 transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate/40 px-4 py-2.5 md:py-2 block text-center md:text-right">Expired</span>
                      )}
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-start">
        {/* LEFT COLUMN: COMPOSER */}
        <div className="-mx-4 md:mx-0 bg-white p-4 md:p-6 rounded-none md:rounded-3xl border-y md:border border-charcoal/10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* AI Prompt Box */}
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
              <label className="flex items-center gap-2 text-sm font-bold text-teal-800 mb-2">
                <Sparkles size={16} />
                AI Content Generator
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Write an offer for 30% off silk sarees"
                  className="w-full sm:flex-1 px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
                  disabled={aiLoading || loading}
                />
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiLoading || loading || !prompt}
                  className="btn-primary px-6 py-2.5 md:py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 text-sm flex items-center justify-center gap-2 whitespace-nowrap"
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
                className="w-full px-4 py-2.5 md:py-3 text-base bg-cream shadow-neo-input !border-none rounded-full focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all"
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
                className="w-full px-4 py-3 text-base bg-cream shadow-neo-input !border-none rounded-2xl focus:!outline-none focus:!ring-0 focus:!border-none text-charcoal placeholder:text-slate/60 transition-all custom-scrollbar"
                disabled={loading || aiLoading}
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading || aiLoading}
                className="btn-primary flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                <Send size={18} />
                {loading ? "Sending..." : "Send Newsletter"}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: CAMPAIGN HISTORY */}
        <div className="-mx-4 md:mx-0 bg-white p-4 md:p-6 rounded-none md:rounded-3xl border-y md:border border-charcoal/10 shadow-sm h-full max-h-[800px] flex flex-col">
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

                  <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(campaign.id)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
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
