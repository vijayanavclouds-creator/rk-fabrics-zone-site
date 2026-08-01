import { HelpCircle, Mail, Phone, MessageCircle } from "lucide-react"
import { InteractiveFaq } from "@/components/help-center/interactive-faq"
import { PolicySections } from "@/components/help-center/policy-sections"
import { getCompanyProfile } from "@/actions/system"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
};



export default async function HelpPage() {
  const companyProfile = await getCompanyProfile()
  
  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 flex items-center gap-3">
        <HelpCircle size={24} className="text-teal-600" />
        Help Center & FAQs
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <a href={`mailto:${companyProfile?.supportEmail || 'support@rkfabricszone.com'}`} className="block p-6 bg-slate-50 border border-charcoal/10 rounded-2xl text-center hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
          <Mail size={32} className="mx-auto text-teal-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
          <h4 className="font-bold text-charcoal mb-2">Email Support</h4>
          <p className="text-sm text-slate">{companyProfile?.supportEmail || 'support@rkfabricszone.com'}</p>
        </a>
        <a href={`tel:${companyProfile?.helpCenterNumber || '+91 98765 43210'}`} className="block p-6 bg-slate-50 border border-charcoal/10 rounded-2xl text-center hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all group">
          <Phone size={32} className="mx-auto text-teal-600 mb-4 group-hover:scale-110 transition-transform duration-300" />
          <h4 className="font-bold text-charcoal mb-2">Call Us</h4>
          <p className="text-sm text-slate">{companyProfile?.helpCenterNumber || '+91 98765 43210'}</p>
        </a>
      </div>

      <InteractiveFaq companyProfile={companyProfile} />
      
      <PolicySections />
    </div>
  )
}
