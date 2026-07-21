"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Heart, MapPin, Phone, Mail, Globe, Bookmark, AtSign, MessageCircle } from "lucide-react";

const footerLinks = {
 shop: [
 { label: "Women's Ethnic", href: "/shop?category=women-ethnic" },
 { label: "Women's Western", href: "/shop?category=women-western" },
 { label: "Men's Formal", href: "/shop?category=men-formal" },
 { label: "Men's Ethnic", href: "/shop?category=men-ethnic" },
 { label: "Premium Fabrics", href: "/shop?category=fabrics-cotton,fabrics-silk,fabrics-prints" },
 { label: "New Arrivals", href: "/shop?filter=new" },
 { label: "Sale", href: "/shop?filter=sale" },
 ],
 company: [
 { label: "About Us", href: "/about" },
 { label: "Our Story", href: "/about#story" },
 { label: "Fabric Care Blog", href: "/blog" },
 { label: "Lookbook", href: "/lookbook" },
 { label: "Wholesale Inquiry", href: "/wholesale" },
 { label: "Contact Us", href: "/contact" },
 ],
 help: [
 { label: "Size Guide", href: "/size-guide" },
 { label: "Shipping Policy", href: "/shipping" },
 { label: "Returns & Exchange", href: "/returns" },
 { label: "FAQs", href: "/faq" },
 { label: "Privacy Policy", href: "/privacy" },
 { label: "Terms & Conditions", href: "/terms" },
 ],
};
export function Footer() {
  return (
  <footer className="bg-gradient-to-br from-charcoal to-slate text-white pb-20 md:pb-0">
   {/* Newsletter Strip */}
  <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 pb-4">
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
      <form
        className="flex w-full md:w-auto relative"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 md:w-80 pl-6 pr-32 py-3.5 rounded-full bg-charcoal/50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.02)] !border-none !outline-none focus:!border-none focus:!ring-0 focus:!outline-none text-white placeholder:text-white/40 text-sm transition-shadow"
        />
        <button
          type="submit"
          className="absolute right-1 top-1 bottom-1 px-6 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-500 hover:to-gold text-charcoal font-bold rounded-full text-sm shadow-[4px_4px_8px_rgba(0,0,0,0.3),-2px_-2px_6px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
        >
          Subscribe
        </button>
      </form>
    </div>
  </div>

 {/* Main Footer */}
 <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
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
 <p className="text-sm text-white/60 mb-4 leading-relaxed">
 Premium Fabrics | Stylish You<br />
 Manufacturer & direct seller from Jaipur, India.
 </p>
 <div className="space-y-2 text-sm text-white/50">
 <div className="flex items-center gap-2">
 <MapPin size={14} className="text-white shrink-0" />
 <span>Jaipur, Rajasthan, India</span>
 </div>
 <div className="flex items-center gap-2">
 <Phone size={14} className="text-white shrink-0" />
 <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
 </div>
 <div className="flex items-center gap-2">
 <Mail size={14} className="text-white shrink-0" />
 <a href="mailto:hello@rkfabricszone.com" className="hover:text-white transition-colors">hello@rkfabricszone.com</a>
 </div>
 </div>
 </div>

 {/* Shop Links */}
 <div>
 <h4 className="font-[family-name:var(--font-cinzel)] text-sm font-semibold text-white tracking-wider uppercase mb-4">
 Shop By Category
 </h4>
 <ul className="space-y-2">
 {footerLinks.shop.map((link) => (
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
 <ul className="space-y-2">
 {footerLinks.company.map((link) => (
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
 <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-charcoal flex items-center justify-center transition-colors" aria-label="Instagram">
 <Globe size={16} />
 </a>
 <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-charcoal flex items-center justify-center transition-colors" aria-label="Facebook">
 <Bookmark size={16} />
 </a>
 <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-charcoal flex items-center justify-center transition-colors" aria-label="Twitter">
 <AtSign size={16} />
 </a>
 <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-charcoal flex items-center justify-center transition-colors" aria-label="WhatsApp">
 <MessageCircle size={16} />
 </a>
 </div>

 <p className="text-xs text-white/40 text-center">
 © {new Date().getFullYear()} RK Fabrics Zone. All rights reserved. Made with{" "}
 <Heart size={12} className="inline text-rose" /> in Jaipur, India.
 </p>

 <div className="flex items-center gap-3 text-xs text-white/40">
 <span>GSTIN: 08XXXXX1234X1ZX</span>
 <span>|</span>
 <span>🇮🇳 Made in India</span>
 </div>
 </div>
 </div>
 </footer>
 );
}
