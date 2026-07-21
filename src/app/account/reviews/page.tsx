import { MessageSquare, Star } from "lucide-react"

export default function ReviewsPage() {
  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 flex items-center gap-3">
        <MessageSquare size={24} className="text-teal-600" />
        My Reviews & Q&A
      </h2>
      
      <div className="text-center py-16 bg-slate-50 rounded-2xl border border-charcoal/10">
        <Star size={48} className="mx-auto text-slate mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-charcoal mb-2">No reviews yet</h3>
        <p className="text-slate mb-8 max-w-md mx-auto">Share your thoughts on products you've purchased to help other shoppers.</p>
      </div>
    </div>
  )
}
