"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, useWishlistStore, useUIStore } from "@/store";
import { useSession } from "next-auth/react";
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
 href={item.href}
 className={cn(
 "relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors",
 isActive
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
 </nav>
 );
}
