"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, User, Ticket, MessageSquare, Bell, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/profile", label: "Profile", icon: User },
  { href: "/account/addresses", label: "Addresses", icon: User },
  { href: "/account/coupons", label: "Coupons", icon: Ticket },
  { href: "/account/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/help", label: "Help", icon: HelpCircle },
];

export function AccountMobileNav() {
  const pathname = usePathname();

  if (pathname.includes("/queries/")) {
    return null;
  }

  return (
    <div className="md:hidden w-full overflow-x-auto pb-4 mb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex items-center gap-2 min-w-max">
        {sidebarLinks.map((link) => {
          // Use exact matching for /account/orders since it's the base page essentially, otherwise startswith
          const isActive = pathname === link.href || (link.href !== "/account/orders" && pathname.startsWith(link.href));
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border",
                isActive 
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm" 
                  : "bg-white text-charcoal/70 border-charcoal/10 hover:border-charcoal/20 hover:text-teal-600"
              )}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
