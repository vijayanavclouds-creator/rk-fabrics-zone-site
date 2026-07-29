import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { User, LayoutDashboard, ShoppingBag, Heart, Ticket, Settings, Bell, HelpCircle, MessageSquare, LogOut, FileText } from "lucide-react"
import Link from "next/link"
import LogoutButton from "./logout-button"
import Image from "next/image"
import { AccountMobileNav } from "./account-mobile-nav"

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const sidebarLinks = [
    { href: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/account/profile", label: "Account Information", icon: User },
    { href: "/account/addresses", label: "Saved Addresses", icon: User },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/coupons", label: "Coupons & Offers", icon: Ticket },
    { href: "/account/reviews", label: "My Reviews & Queries", icon: MessageSquare },
    { href: "/account/notifications", label: "Notification Settings", icon: Bell },
    { href: "/account/help", label: "Help Center & FAQs", icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-transparent pt-10 pb-20">
      <div className="w-full mx-auto px-4 md:px-8">
        


        <div className="flex flex-col items-center">
          {/* Main Content Area */}
          <main className="w-full">
            <AccountMobileNav />
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
