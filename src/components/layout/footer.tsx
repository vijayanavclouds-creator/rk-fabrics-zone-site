import Link from "next/link";
import Image from "next/image";
import { Heart, MapPin, Phone, Mail, Globe, Bookmark, AtSign, MessageCircle } from "lucide-react";
import { getCompanyProfile } from "@/actions/system";
import { getStoreTaxonomyData } from "@/lib/data/system";
import { NewsletterForm } from "./newsletter-form";

const footerLinks = {
 company: [
 { label: "About Us", href: "/about" },
 { label: "Our Story", href: "/our-story" },
 { label: "Fabric Care Blog", href: "/blog" },
 { label: "Lookbook", href: "/lookbook" },
 { label: "Wholesale Inquiry", href: "/contact?subject=wholesale" },
 { label: "Contact Us", href: "/contact" },
 ],
 help: [
 { label: "Size Guide", href: "/account/help#size-guide" },
 { label: "Shipping Policy", href: "/account/help#shipping-policy" },
 { label: "Returns & Exchange", href: "/account/help#returns" },
 { label: "FAQs", href: "/account/help#faq" },
 { label: "Privacy Policy", href: "/account/help#privacy-policy" },
 { label: "Terms & Conditions", href: "/account/help#terms" },
 ],
};
import { authOptions } from "@/lib/auth";

export async function Footer() {
  const companyProfile = await getCompanyProfile();
  const { categories, fabrics } = await getStoreTaxonomyData();
  
  const dynamicShopLinks = [...categories, ...fabrics]
    .filter((c: any) => c.showInFooter)
    .slice(0, 5)
    .map((c: any) => ({ label: c.label, href: `/shop?category=${c.value}` }));
    
  const shopLinks = [
    ...dynamicShopLinks,
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Sale", href: "/shop?filter=sale" }
  ];
  
  return (
  <footer className="relative z-40 bg-gradient-to-br from-charcoal to-slate text-white pb-20 md:pb-0">
   {/* Newsletter Strip */}
   <div className="w-full mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-4">
       <div className="bg-transparent rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[8px_8px_20px_rgba(0,0,0,0.4),-8px_-8px_20px_rgba(255,255,255,0.05)] border border-white/5">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center shadow-lg hidden sm:flex">
             <span className="text-xl">✉️</span>
           </div>
           <div>
             <h3 className="font-[family-name:var(--font-playfair)] text-lg md:text-xl font-bold text-white">
               Stay Stylish — Join Our Newsletter
             </h3>
             <p className="text-white/70 text-xs md:text-sm mt-0.5">
               Exclusive discounts & fabric care tips, straight to your inbox.
             </p>
           </div>
         </div>
         <NewsletterForm />
       </div>
     </div>
 {/* Main Footer */}
 <div className="w-full mx-auto px-6 lg:px-8 py-12">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
 {/* Brand Column */}
 <div className="col-span-2 md:col-span-1">
 <Link href="/" className="flex items-center gap-2 mb-4">
 <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/20">
 <Image
 src="/logo.png?v=3"
 alt="RK Fabrics Zone"
 fill
 className="object-cover"
 unoptimized
 />
 </div>
 <div>
 <span className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white block leading-none">
 RK Fabrics
 </span>
 <span className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.2em] text-white/70 uppercase">
 Zone
 </span>
 </div>
 </Link>
 <p className="text-sm text-white/60 mb-4 leading-relaxed whitespace-pre-line">
 {companyProfile?.companyDescription || <>Premium Fabrics | Stylish You<br />Manufacturer & direct seller from Jaipur, India.</>}
 </p>
 <div className="space-y-2 text-sm text-white/50">
 <div className="flex items-center gap-2">
 <MapPin size={14} className="text-white shrink-0" />
 <span>Jaipur, Rajasthan, India</span>
 </div>
 <div className="flex items-center gap-2">
 <Phone size={14} className="text-white shrink-0" />
 <a href={`tel:${companyProfile?.contactNumber || '+91 98765 43210'}`} className="hover:text-white transition-colors">{companyProfile?.contactNumber || '+91 98765 43210'}</a>
 </div>
 <div className="flex items-center gap-2">
 <Mail size={14} className="text-white shrink-0" />
 <a href={`mailto:${companyProfile?.supportEmail || 'hello@rkfabricszone.com'}`} className="hover:text-white transition-colors">{companyProfile?.supportEmail || 'hello@rkfabricszone.com'}</a>
 </div>
 </div>
 </div>

 {/* Shop Links */}
 <div>
  <h4 className="font-[family-name:var(--font-cinzel)] text-sm font-semibold text-white tracking-wider uppercase mb-4">
  Shop By Category
  </h4>
  <ul className="space-y-2">
  {shopLinks.map((link) => (
  <li key={link.label}>
  <Link
  href={link.href}
  className="text-sm text-white/70 hover:text-white transition-colors"
  >
  {link.label}
  </Link>
  </li>
  ))}
  </ul>
 </div>

 {/* Company Links */}
 <div>
 <h4 className="font-[family-name:var(--font-cinzel)] text-sm font-semibold text-white tracking-wider uppercase mb-4">
 Company
 </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link, i) => {
                return (
                  <li key={i}>
                    <Link href={link.href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
 </div>

 {/* Help Links */}
 <div>
 <h4 className="font-[family-name:var(--font-cinzel)] text-sm font-semibold text-white tracking-wider uppercase mb-4">
 Help
 </h4>
 <ul className="space-y-2">
 {footerLinks.help.map((link) => (
 <li key={link.label}>
 <Link
 href={link.href}
 className="text-sm text-white/70 hover:text-white transition-colors"
 >
 {link.label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 </div>

 {/* Social & Bottom */}
 <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 {companyProfile?.instagramUrl ? (
 <a href={companyProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-charcoal flex items-center justify-center transition-colors" aria-label="Instagram">
   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
 </a>
 ) : null}
 {companyProfile?.facebookUrl ? (
 <a href={companyProfile.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-charcoal flex items-center justify-center transition-colors" aria-label="Facebook">
   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
 </a>
 ) : null}
 <a href={`https://wa.me/${(companyProfile?.contactNumber || '+919876543210').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-charcoal flex items-center justify-center transition-colors" aria-label="WhatsApp">
 <MessageCircle size={16} />
 </a>
 </div>

 <p className="text-xs text-white/40 text-center">
 © {new Date().getFullYear()} RK Fabrics Zone. All rights reserved. Made with{" "}
 <Heart size={12} className="inline text-rose" /> in Jaipur, India.
 </p>

 <div className="flex items-center gap-3 text-xs text-white/40">
 {companyProfile?.gstNumber && (
   <>
     <span>GSTIN: {companyProfile.gstNumber}</span>
     <span>|</span>
   </>
 )}
 <span>🇮🇳 Made in India</span>
 </div>
 </div>
 </div>
 </footer>
 );
}
