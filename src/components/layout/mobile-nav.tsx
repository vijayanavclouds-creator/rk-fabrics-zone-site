"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, LayoutGrid, Heart, ShoppingBag, User, LogOut, Ticket, MessageSquare, Mail, Bell, HelpCircle, LayoutDashboard, Package, Scissors, DollarSign, Users, Building2, Menu, Image as ImageIcon, Settings, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, useWishlistStore, useUIStore } from "@/store";
import { useCheckoutStore } from "@/store/checkout"
import { handlePwaInstallFallback } from "@/lib/pwa";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || "U").toUpperCase();
};

const navItems = [
 { icon: Home, label: "Home", href: "/" },
 { icon: LayoutGrid, label: "Shop", href: "/shop" },
 { icon: Heart, label: "Wishlist", href: "/wishlist" },
 { icon: ShoppingBag, label: "Cart", href: "/cart", isCart: true },
 { icon: User, label: "Account", href: "/account" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { data: session } = useSession();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const { closeSearch, closeMobileMenu } = useUIStore();
  const clearCart = useCartStore((state) => state.clearCart);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const clearCheckout = useCheckoutStore((state) => state.clearCheckout);

  const customerLinks = [
    { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/account/profile", label: "Account Information", icon: User },
    { href: "/account/addresses", label: "Saved Addresses", icon: User },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/coupons", label: "Coupons & Offers", icon: Ticket },
    { href: "/account/reviews", label: "My Reviews & Queries", icon: MessageSquare },
    { href: "/account/newsletters", label: "Newsletters", icon: Mail },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
    { href: "/account/help", label: "Help Center & FAQs", icon: HelpCircle },
  ];

  const adminLinks = [
    { href: "/admin?tab=overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/admin?tab=list", label: "Product Settings", icon: Package },
    { href: "/admin?tab=taxonomy", label: "Taxonomy Settings", icon: Scissors },
    { href: "/admin?tab=orders", label: "Orders Management", icon: ShoppingBag },
    { href: "/admin?tab=finance", label: "Finance Management", icon: DollarSign },
    { href: "/admin?tab=queries", label: "Queries Management", icon: MessageSquare },
    { href: "/admin?tab=newsletters", label: "Newsletter Studio", icon: Mail },
    { href: "/admin?tab=users", label: "User Management", icon: Users },
    { href: "/admin?tab=company_profile", label: "Company Profile", icon: Building2 },
    { href: "/admin?tab=navigation", label: "Navigation Settings", icon: Menu },
    { href: "/admin?tab=banners", label: "Banner Settings", icon: ImageIcon },
    { href: "/admin?tab=system", label: "System Status", icon: Settings },
    { href: "/admin?tab=profile", label: "My Profile", icon: User },
  ];

  const supportLinks = [
    { href: "/support?tab=overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/support?tab=orders", label: "Orders Management", icon: ShoppingBag },
    { href: "/support?tab=queries", label: "Queries Management", icon: MessageSquare },
    { href: "/support?tab=profile", label: "My Profile", icon: User },
  ];

  const activeLinks = session?.user?.role === "ADMIN" ? adminLinks : session?.user?.role === "SUPPORT" ? supportLinks : customerLinks;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
 <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-charcoal/5 mobile-nav-safe">
 <div className="flex items-center justify-around h-16 px-2">
 {navItems.map((item) => {
 const isActive = pathname === item.href;
 const Icon = item.icon;
 const badgeCount = item.label === "Cart" ? cartItemCount : item.label === "Wishlist" ? wishlistCount : 0;

 return (
 <Link
 key={item.label}
 href={item.label === "Account" && session?.user ? "#" : item.href}
 onClick={(e) => {
   if (item.label === "Account" && session?.user) {
     e.preventDefault();
     setIsAccountMenuOpen(!isAccountMenuOpen);
   } else {
     setIsAccountMenuOpen(false);
     closeSearch();
     closeMobileMenu();
   }
 }}
 className={cn(
 "relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors",
 isActive || (item.label === "Account" && isAccountMenuOpen)
 ? "text-teal-600 "
 : "text-slate "
 )}
 >
  <div className="relative">
  {item.label === "Account" && session?.user ? (
    session.user.image ? (
      <div className={cn("w-[22px] h-[22px] rounded-full overflow-hidden border", isActive ? "border-teal-600 border-2" : "border-charcoal/20")}>
        <Image 
          src={session.user.image} 
          alt={session.user.name || "User"} 
          width={22} 
          height={22} 
          className="object-cover w-full h-full"
        />
      </div>
    ) : (
      <div className={cn("w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold border", isActive ? "bg-teal-600 text-white border-teal-600" : "bg-teal-100 text-teal-700 border-teal-200")}>
        {session.user.name ? getInitials(session.user.name) : <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />}
      </div>
    )
  ) : (
    <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
  )}
  {mounted && badgeCount > 0 && (
 <motion.span
 key={badgeCount}
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className={cn(
 "absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 text-[9px] font-bold text-white flex items-center justify-center rounded-full",
 item.label === "Cart" ? "bg-teal-600" : "bg-rose"
 )}
 >
 {badgeCount}
 </motion.span>
 )}
 </div>
 <span className="text-[10px] font-medium">{item.label}</span>
 {isActive && (
 <motion.div
 layoutId="mobile-nav-indicator"
 className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-teal-600 rounded-full"
 transition={{ type: "spring", stiffness: 300, damping: 30 }}
 />
 )}
 </Link>
 );
 })}
 </div>

  {/* Account Menu Bottom Sheet */}
  <AnimatePresence>
    {isAccountMenuOpen && session?.user && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-charcoal/20 z-40"
          onClick={() => setIsAccountMenuOpen(false)}
        />
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          className="absolute bottom-[72px] right-2 w-64 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-slate-100"
        >
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            {session.user.image ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-charcoal/20 shrink-0">
                <Image src={session.user.image} alt={session.user.name || "User"} width={40} height={40} className="object-cover w-full h-full" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                {getInitials(session.user.name || "User")}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-charcoal truncate">{session.user.name}</p>
              <p className="text-[10px] text-slate truncate">{session.user.email}</p>
            </div>
          </div>
          <div className="p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {activeLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsAccountMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-charcoal font-medium text-sm">
                <link.icon size={18} className="text-slate" /> {link.label}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-1 mx-2 shrink-0" />
            <button 
              onClick={async () => {
                setIsAccountMenuOpen(false);
                const deferredPrompt = (window as any).deferredPrompt;
                if (deferredPrompt) {
                  deferredPrompt.prompt();
                  const { outcome } = await deferredPrompt.userChoice;
                  if (outcome === 'accepted') {
                    (window as any).deferredPrompt = null;
                  }
                } else {
                  handlePwaInstallFallback();
                }
              }} 
              className="flex items-center justify-center gap-2 btn-primary !h-10 !rounded-xl text-sm mb-2 mt-1 mx-2 shrink-0"
            >
              <Smartphone size={16} /> Install App
            </button>
            <button 
              onClick={() => { 
                setIsAccountMenuOpen(false); 
                clearCart();
                clearWishlist();
                clearCheckout();
                const targetUrl = session?.user?.role === "ADMIN" 
                  ? "/portal/rk-exec-gateway" 
                  : session?.user?.role === "SUPPORT" 
                  ? "/portal/rk-service-desk" 
                  : "/";
                signOut({ callbackUrl: targetUrl }); 
              }} 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose/10 transition-colors text-rose font-medium w-full text-left text-sm shrink-0"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
 </nav>
 );
}
