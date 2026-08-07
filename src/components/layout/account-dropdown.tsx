"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { User, LayoutDashboard, ShoppingBag, Heart, Ticket, Settings, Bell, HelpCircle, MessageSquare, LogOut, Package, Image as ImageIcon, Users, Menu, Scissors, AlertTriangle, Building2, DollarSign, Mail, Smartphone, Undo2, Activity } from "lucide-react"
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
    { href: "/admin?tab=taxonomy", label: "Navigation & Taxonomy", icon: Scissors },
    // Sales
    { href: "/admin?tab=orders", label: "Orders Management", icon: ShoppingBag },
    { href: "/admin?tab=finance", label: "Finance Management", icon: DollarSign },
    
    // Engagement
    { href: "/admin?tab=queries", label: "Queries Management", icon: MessageSquare },
    { href: "/admin?tab=returns", label: "Returns", icon: Undo2 },
    { href: "/admin?tab=newsletters", label: "Newsletter Studio", icon: Mail },
    { href: "/admin?tab=users", label: "User Management", icon: Users },
    
    // Site Settings
    { href: "/admin?tab=company_profile", label: "Company Profile", icon: Building2 },
    { href: "/admin?tab=banners", label: "Dynamic Homepage", icon: ImageIcon },
    { href: "/admin?tab=system", label: "System Status", icon: Settings },
    { href: "/admin?tab=activities", label: "System Activities", icon: Activity },
  ]

  const supportLinks = [
    { href: "/support?tab=overview", label: "Dashboard Overview", icon: LayoutDashboard },
    { href: "/support?tab=orders", label: "Orders Management", icon: ShoppingBag },
    { href: "/support?tab=queries", label: "Queries Management", icon: MessageSquare },
    { href: "/support?tab=returns", label: "Returns", icon: Undo2 },
  ]

  const activeLinks = session.user.role === "ADMIN" ? adminLinks : session.user.role === "SUPPORT" ? supportLinks : customerLinks

  const hasPhone = !!session.user.phone
  const isComplete = hasPhone // based on mobile number as per user request
  const strokeWidth = 2.5
  const radius = 16 // Ring diameter is 32px
  const circumference = 2 * Math.PI * radius
  const offset = circumference * 0.4 // 60% complete (only used if incomplete)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={
          isComplete 
            ? "btn-icon" 
            : "relative w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 transition-transform focus:outline-none bg-white shadow-sm"
        }
        aria-label="Account Menu"
      >
        {isComplete ? (
          /* --- COMPLETE PROFILE (No Progress Bar, Full Size) --- */
          session.user.image ? (
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
          )
        ) : (
          /* --- INCOMPLETE PROFILE (Progress Bar + 3D Alert) --- */
          <>
            {/* Profile Image / Initials */}
            <div className="w-[32px] h-[32px] rounded-full overflow-hidden relative z-10 flex items-center justify-center bg-cream">
              {session.user.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  width={32} 
                  height={32} 
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-[12px] font-[family-name:var(--font-playfair)] text-slate-500 tracking-wider">
                  {session.user.name ? getInitials(session.user.name) : <User size={16} />}
                </span>
              )}
            </div>

            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-100"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="text-[#F97316]" // Orange color to match the 3D icon
                style={{ transition: "stroke-dashoffset 0.5s ease-in-out, color 0.3s ease" }}
              />
            </svg>

            {/* 3D Alert Icon (Top Right) */}
            <div className="absolute -top-1.5 -right-1.5 z-30 group cursor-help">
              <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-sm overflow-visible">
                  <defs>
                    {/* 3D White Frame */}
                    <linearGradient id="frameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                    <linearGradient id="frameShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#d1d5db" />
                      <stop offset="100%" stopColor="#9ca3af" />
                    </linearGradient>
                    
                    {/* Inner Orange */}
                    <linearGradient id="innerOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>

                    {/* Exclamation White */}
                    <linearGradient id="exclamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#f3f4f6" />
                    </linearGradient>
                  </defs>
                  
                  {/* Outer Frame Shadow (3D depth) */}
                  <path d="M10.29 2.86L1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 2.86a2 2 0 0 0-3.42 0z" fill="url(#frameShadow)" transform="translate(0, 1.5)" />

                  {/* Outer Frame (White) */}
                  <path d="M10.29 2.86L1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 2.86a2 2 0 0 0-3.42 0z" fill="url(#frameGrad)" />

                  {/* Inner Orange */}
                  <path d="M10.29 2.86L1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 2.86a2 2 0 0 0-3.42 0z" fill="url(#innerOrange)" style={{ transformOrigin: '12px 12.5px', transform: 'scale(0.65)' }} />

                  {/* Exclamation Mark Shadow */}
                  <path d="M12 8v4.5" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" transform="translate(0, 0.5)" />
                  <path d="M12 15.5h.01" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" transform="translate(0, 0.5)" />

                  {/* Exclamation Mark Body */}
                  <path d="M12 8v4.5" stroke="url(#exclamGrad)" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M12 15.5h.01" stroke="url(#exclamGrad)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              {/* Tooltip */}
              <div className="absolute top-full mt-1 right-0 w-max px-2 py-1 bg-charcoal text-white text-[10px] rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Please complete your profile information
                <div className="absolute bottom-full right-2 border-[4px] border-transparent border-b-charcoal"></div>
              </div>
            </div>
          </>
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
