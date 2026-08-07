import Link from "next/link";
import Image from "next/image";
import { Heart, Phone, Mail, AtSign } from "lucide-react";
import { getCompanyProfile } from "@/actions/system";
import { NewsletterForm } from "./newsletter-form";

const footerLinks = {
 company: [
 { label: "About Us", href: "/about" },
 { label: "Our Story", href: "/our-story" },
 { label: "Lookbook", href: "/lookbook" },
 { label: "Contact Us", href: "/contact" },
 ],
 help: [
 { label: "Shipping Policy", href: "/account/help#shipping-policy" },
 { label: "FAQs", href: "/account/help#faq" },
 { label: "Privacy Policy", href: "/account/help#privacy-policy" },
 { label: "Terms & Conditions", href: "/account/help#terms" },
 ],
};

export async function Footer() {
  const companyProfile = await getCompanyProfile();

  
  return (
  <footer className="neumorphic-surface mt-4 md:mt-8 mx-2 md:mx-4 mb-2 md:mb-4 rounded-[2rem] pb-10 md:pb-0 text-charcoal relative z-10">
    {/* Main Footer */}
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 md:py-6">
      <div className="grid grid-cols-12 gap-x-2 gap-y-6 md:gap-x-6">
        {/* Brand Column */}
        <div className="col-span-6 md:col-span-5 lg:col-span-4 order-2 md:order-1">
          <Link href="/" className="flex items-center gap-2 mb-1.5">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-[#1a2b49]/20 shrink-0">
              <Image
                src="/logo.png?v=3"
                alt="RK Fabrics Zone"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <span className="font-[family-name:var(--font-playfair)] text-base md:text-lg font-bold text-[#1a2b49] block leading-none">
                RK Fabrics
              </span>
              <span className="font-[family-name:var(--font-cinzel)] text-[9px] md:text-[10px] tracking-[0.2em] text-[#37546d] uppercase">
                Zone
              </span>
            </div>
          </Link>
          <p className="hidden md:block text-[10px] md:text-xs text-[#4a627a] mb-1.5 leading-snug whitespace-pre-line">
            {companyProfile?.companyDescription || <>Premium Fabrics | Stylish You<br />Manufacturer & direct seller from Jaipur, India.</>}
          </p>
          <p className="md:hidden text-[10px] text-[#4a627a] mb-1.5 leading-snug">
            Premium Fabrics | Stylish You
          </p>
          <div className="space-y-0.5 text-[10px] md:text-xs text-[#4a627a]">

            <div className="flex items-center gap-1.5">
              <Phone size={12} className="text-[#37546d] shrink-0" />
              <a href={`tel:${companyProfile?.contactNumber || '+91 98765 43210'}`} className="hover:text-[#1a2b49] transition-colors">{companyProfile?.contactNumber || '+91 98765 43210'}</a>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={12} className="text-[#37546d] shrink-0" />
              <a href={`mailto:${companyProfile?.supportEmail || 'hello@rkfabricszone.com'}`} className="hover:text-[#1a2b49] transition-colors break-all">{companyProfile?.supportEmail || 'hello@rkfabricszone.com'}</a>
            </div>
          </div>
        </div>

        {/* Company Links */}
        <div className="col-span-3 md:col-span-2 lg:col-span-2 order-3 md:order-2">
            <h4 className="font-[family-name:var(--font-cinzel)] text-xs md:text-sm font-semibold text-[#1a2b49] tracking-wider uppercase mb-1.5 md:mb-2">
              Company
            </h4>
            <ul className="space-y-0">
              {footerLinks.company.map((link, i) => {
                return (
                  <li key={i}>
                    <Link href={link.href} className="block py-0.5 text-[10px] md:text-xs text-[#4a627a] hover:text-[#1a2b49] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

        {/* Help Links */}
        <div className="col-span-3 md:col-span-2 lg:col-span-2 order-4 md:order-3">
            <h4 className="font-[family-name:var(--font-cinzel)] text-xs md:text-sm font-semibold text-[#1a2b49] tracking-wider uppercase mb-1.5 md:mb-2">
              Help
            </h4>
            <ul className="space-y-0">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block py-0.5 text-[10px] md:text-xs text-[#4a627a] hover:text-[#1a2b49] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        {/* Newsletter Column */}
        <div className="col-span-12 md:col-span-3 lg:col-span-4 order-1 md:order-4 mb-2 md:mb-0 border-b border-[#1a2b49]/10 pb-6 md:border-0 md:pb-0">
            <h4 className="font-[family-name:var(--font-playfair)] text-sm md:text-base font-bold text-[#1a2b49] leading-tight mb-1.5 md:mb-2 text-center md:text-left">
              Stay Stylish — Join Our Newsletter
            </h4>
            <p className="text-[10px] md:text-xs text-[#4a627a] mb-3 leading-snug text-center md:text-left">
              Exclusive discounts & fabric care tips, straight to your inbox.
            </p>
            <NewsletterForm />
      </div>
    </div>

  {/* Social & Bottom */}
 <div className="mt-2 pt-2 border-t border-[#1a2b49]/10 flex flex-col md:flex-row items-center justify-between gap-1.5 md:gap-3">
 <div className="flex flex-wrap items-center gap-3">
  {companyProfile?.facebookUrl ? (
    <a href={companyProfile.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Facebook">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    </a>
  ) : null}
  {companyProfile?.xUrl ? (
    <a href={companyProfile.xUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#1a2b49] hover:text-[#37546d]" aria-label="X">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
    </a>
  ) : null}
  {companyProfile?.instagramUrl ? (
    <a href={companyProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Instagram">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="ig-grad" x1="2" y1="2" x2="22" y2="22"><stop offset="0%" stopColor="#feda75" /><stop offset="25%" stopColor="#fa7e1e" /><stop offset="50%" stopColor="#d62976" /><stop offset="75%" stopColor="#962fbf" /><stop offset="100%" stopColor="#4f5bd5" /></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    </a>
  ) : null}
  {companyProfile?.threadsUrl ? (
    <a href={companyProfile.threadsUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#1a2b49] hover:text-[#37546d]" aria-label="Threads">
      <AtSign size={16} />
    </a>
  ) : null}
  {companyProfile?.pinterestUrl ? (
    <a href={companyProfile.pinterestUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="Pinterest">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#E60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z"/></svg>
    </a>
  ) : null}
  {companyProfile?.linkedinUrl ? (
    <a href={companyProfile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="LinkedIn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    </a>
  ) : null}
  {companyProfile?.whatsappUrl ? (
    <a href={companyProfile.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="WhatsApp">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.832 5.832 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
    </a>
  ) : (
    companyProfile?.contactNumber ? (
      <a href={`https://wa.me/${companyProfile.contactNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" aria-label="WhatsApp">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.832 5.832 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>
    ) : null
  )}
 </div>

 <div className="text-[10px] text-[#4a627a] leading-relaxed flex flex-col sm:block sm:text-center w-full sm:w-auto gap-2">
   <span className="text-center sm:inline">© {new Date().getFullYear()} RK Fabrics Zone. All rights reserved.</span>
   <span className="hidden sm:inline">{' '}Made with <Heart size={10} className="inline text-rose-500" /> in Jaipur, India.</span>
 </div>

 <div className="flex items-center gap-2 text-[10px] text-[#4a627a]">
 {companyProfile?.gstNumber && (
   <>
     <span>GSTIN: {companyProfile.gstNumber}</span>
     <span>|</span>
   </>
 )}
 <span className="hidden sm:inline">🇮🇳 Made in India</span>
 <span className="sm:hidden flex items-center gap-1">Made with <Heart size={10} className="text-rose-500" /> in Jaipur, India.</span>
 </div>
 </div>
 </div>
 </footer>
 );
}
