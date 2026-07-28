"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { User, LayoutDashboard, ShoppingBag, Heart, Ticket, Settings, Bell, HelpCircle, MessageSquare, LogOut, Package, Image as ImageIcon, Users, Menu, Scissors, AlertTriangle, Building2, DollarSign, Mail, Smartphone } from "lucide-react"
import { useCartStore, useWishlistStore } from "@/store"
import { useCheckoutStore } from "@/store/checkout"
import { handlePwaInstallFallback } from "@/lib/pwa"

export function AccountDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const clearCart = useCartStore((state) => state.clearCart)
  const clearWishlist = useWishlistStore((state) => state.clearWishlist)
  const clearCheckout = useCheckoutStore((state) => state.clearCheckout)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session?.user) return null

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (name[0] || "U").toUpperCase();
  }

  const customerLinks = [
    { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/account/addresses", label: "Saved Addresses", icon: User },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/coupons", label: "Coupons & Offers", icon: Ticket },
    { href: "/account/reviews", label: "My Reviews & Queries", icon: MessageSquare },
    { href: "/account/newsletters", label: "Newsletters", icon: Mail },
    { href: "/account/notifications", label: "Notifications", icon: Bell },
    { href: "/account/help", label: "Help Center & FAQs", icon: HelpCircle },
  ]

  const adminLinks = [
    { href: "/admin?tab=overview", label: "Dashboard Overview", icon: LayoutDashboard },
    
    // Catalog
    { href: "/admin?tab=list", label: "Product Settings", icon: Package },
    { href: "/admin?tab=taxonomy", label: "Taxonomy Settings", icon: Scissors },
    
    // Sales
    { href: "/admin?tab=orders", label: "Orders Management", icon: ShoppingBag },
    { href: "/admin?tab=finance", label: "Finance Management", icon: DollarSign },
    
    // Engagement
    { href: "/admin?tab=queries", label: "Queries Management", icon: MessageSquare },
    { href: "/admin?tab=newsletters", label: "Newsletter Studio", icon: Mail },
    { href: "/admin?tab=users", label: "User Management", icon: Users },
    
    // Site Settings
    { href: "/admin?tab=company_profile", label: "Company Profile", icon: Building2 },
    { href: "/admin?tab=navigation", label: "Navigation Settings", icon: Menu },
    { href: "/admin?tab=banners", label: "Banner Settings", icon: ImageIcon },
    { href: "/admin?tab=system", label: "System Status", icon: Settings },
  ]

  const supportLinks = [
    { href: "/support?tab=overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/support?tab=orders", label: "Orders Management", icon: ShoppingBag },
    { href: "/support?tab=queries", label: "Queries Management", icon: MessageSquare },
  ]

  const activeLinks = session.user.role === "ADMIN" ? adminLinks : session.user.role === "SUPPORT" ? supportLinks : customerLinks

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon"
        aria-label="Account Menu"
      >
        {session.user.image ? (
          <Image 
            src={session.user.image} 
            alt={session.user.name || "User"} 
            width={40} 
            height={40} 
            className="rounded-full object-cover w-full h-full shadow-sm"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-cream shadow-neo-input flex items-center justify-center text-[13px] font-[family-name:var(--font-playfair)] text-slate-500 border border-white/50 tracking-wider">
            {session.user.name ? getInitials(session.user.name) : <User size={18} />}
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-neo-card border border-charcoal/10 overflow-hidden z-50 flex flex-col"
          >
            <Link 
              href={session.user.role === "ADMIN" ? "/admin?tab=profile" : session.user.role === "SUPPORT" ? "/support?tab=profile" : "/account/profile"}
              onClick={() => setIsOpen(false)}
              className="block p-4 border-b border-charcoal/10 bg-slate-50/50 hover:bg-slate-100 transition-colors"
            >
              <p className="font-bold text-charcoal truncate">{session.user.name}</p>
              <p className="text-xs text-slate truncate">{session.user.email}</p>
            </Link>
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              <nav className="space-y-1">
                {activeLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-charcoal hover:bg-teal-50 hover:text-teal-700 transition-colors"
                  >
                    <link.icon size={16} />
                    <span className="font-medium text-sm">{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-2 border-t border-charcoal/10">
              <button
                onClick={async () => {
                  setIsOpen(false);
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
                className="flex w-full items-center justify-center gap-2 btn-primary !h-10 !rounded-xl text-sm mb-2 mt-1"
              >
                <Smartphone size={16} />
                Install App
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  clearCart()
                  clearWishlist()
                  clearCheckout()
                  const targetUrl = session?.user?.role === "ADMIN" 
                    ? "/portal/rk-exec-gateway" 
                    : session?.user?.role === "SUPPORT" 
                    ? "/portal/rk-service-desk" 
                    : "/";
                  signOut({ callbackUrl: targetUrl })
                }}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-medium text-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
