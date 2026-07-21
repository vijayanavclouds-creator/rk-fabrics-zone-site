import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 flex items-center gap-3">
        <Bell size={24} className="text-teal-600" />
        Notification Settings
      </h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-5 bg-slate-50 border border-charcoal/10 rounded-2xl">
          <div>
            <h4 className="font-bold text-charcoal">Order Updates</h4>
            <p className="text-sm text-slate">Get notified about your order status</p>
          </div>
          <div className="w-12 h-6 bg-teal-600 rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 bg-slate-50 border border-charcoal/10 rounded-2xl">
          <div>
            <h4 className="font-bold text-charcoal">Promotional Emails</h4>
            <p className="text-sm text-slate">Receive exclusive offers and coupons</p>
          </div>
          <div className="w-12 h-6 bg-slate-200 rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
