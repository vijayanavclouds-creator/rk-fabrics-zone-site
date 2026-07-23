import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { User, LayoutDashboard, ShoppingBag, Heart, Ticket, Settings, Bell, HelpCircle, MessageSquare, LogOut, FileText } from "lucide-react"
import Link from "next/link"
import LogoutButton from "./logout-button"
import Image from "next/image"
import MobileNumberBanner from "./mobile-number-banner"

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
    <div className="min-h-screen bg-[#fdfaf6] pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-8 border-b border-charcoal/10 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl font-bold relative overflow-hidden shrink-0 border border-charcoal/10">
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name || "Profile"} fill className="object-cover" sizes="64px" />
              ) : (
                session.user.name?.charAt(0).toUpperCase() || <User />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Welcome, {session.user.name}</h1>
              <p className="text-slate">{session.user.email}</p>
            </div>
          </div>
          
          <div id="layout-header-right" className="empty:hidden"></div>
        </div>

        <div className="flex flex-col items-center">
          {/* Main Content Area */}
          <main className="w-full">
            {!session.user.phone && <MobileNumberBanner />}
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
