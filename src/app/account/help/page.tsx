import { HelpCircle, Mail, Phone, MessageCircle } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 flex items-center gap-3">
        <HelpCircle size={24} className="text-teal-600" />
        Help Center & FAQs
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-slate-50 border border-charcoal/10 rounded-2xl text-center">
          <Mail size={32} className="mx-auto text-teal-600 mb-4" />
          <h4 className="font-bold text-charcoal mb-2">Email Support</h4>
          <p className="text-sm text-slate">support@rkfabricszone.com</p>
        </div>
        <div className="p-6 bg-slate-50 border border-charcoal/10 rounded-2xl text-center">
          <Phone size={32} className="mx-auto text-teal-600 mb-4" />
          <h4 className="font-bold text-charcoal mb-2">Call Us</h4>
          <p className="text-sm text-slate">+91 98765 43210</p>
        </div>
        <div className="p-6 bg-slate-50 border border-charcoal/10 rounded-2xl text-center">
          <MessageCircle size={32} className="mx-auto text-teal-600 mb-4" />
          <h4 className="font-bold text-charcoal mb-2">Live Chat</h4>
          <p className="text-sm text-slate">Available 9 AM - 6 PM</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-charcoal mb-6">Frequently Asked Questions</h3>
      
      <div className="space-y-4">
        {[
          { q: "How can I track my order?", a: "You can track your order status in the 'Order History' section of your account dashboard." },
          { q: "What is your return policy?", a: "We offer a 7-day hassle-free return policy for all unstitched fabrics and ready-made items." },
          { q: "Do you offer international shipping?", a: "Currently, we only ship within India. We plan to expand to international shipping soon." }
        ].map((faq, i) => (
          <div key={i} className="p-5 border border-charcoal/10 rounded-2xl">
            <h4 className="font-bold text-charcoal mb-2">{faq.q}</h4>
            <p className="text-slate text-sm">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
