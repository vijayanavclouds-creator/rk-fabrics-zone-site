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
 <div className="flex flex-wrap items-center gap-4">
  {companyProfile?.facebookUrl ? (
    <a href={companyProfile.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Facebook">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    </a>
  ) : null}
  {companyProfile?.xUrl ? (
    <a href={companyProfile.xUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-white hover:text-white/80" aria-label="X">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
    </a>
  ) : null}
  {companyProfile?.instagramUrl ? (
    <a href={companyProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Instagram">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="ig-grad" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stopColor="#feda75" /><stop offset="25%" stopColor="#fa7e1e" /><stop offset="50%" stopColor="#d62976" /><stop offset="75%" stopColor="#962fbf" /><stop offset="100%" stopColor="#4f5bd5" /></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    </a>
  ) : null}
  {companyProfile?.threadsUrl ? (
    <a href={companyProfile.threadsUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-white hover:text-white/80" aria-label="Threads">
      <AtSign size={28} />
    </a>
  ) : null}
  {companyProfile?.pinterestUrl ? (
    <a href={companyProfile.pinterestUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Pinterest">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#E60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z"/></svg>
    </a>
  ) : null}
  {companyProfile?.linkedinUrl ? (
    <a href={companyProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="LinkedIn">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    </a>
  ) : null}
  {companyProfile?.whatsappUrl ? (
    <a href={companyProfile.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="WhatsApp">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.832 5.832 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
    </a>
  ) : (
    companyProfile?.contactNumber ? (
      <a href={`https://wa.me/${companyProfile.contactNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.832 5.832 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>
    ) : null
  )}
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
