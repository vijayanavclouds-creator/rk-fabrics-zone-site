import { Ticket } from "lucide-react"

export default function CouponsPage() {
  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 flex items-center gap-3">
        <Ticket size={24} className="text-teal-600" />
        Coupons & Offers
      </h2>
      
      <div className="text-center py-16 bg-slate-50 rounded-2xl border border-charcoal/10">
        <Ticket size={48} className="mx-auto text-slate mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-charcoal mb-2">No active coupons</h3>
        <p className="text-slate mb-8 max-w-md mx-auto">You don't have any active coupons right now. Check back later for special offers!</p>
      </div>
    </div>
  )
}
