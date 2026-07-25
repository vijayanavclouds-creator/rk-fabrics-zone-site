"use client"

import { signOut, useSession } from "next-auth/react"
import { LogOut } from "lucide-react"
import { useCartStore, useWishlistStore } from "@/store"
import { useCheckoutStore } from "@/store/checkout"

export default function LogoutButton({ className }: { className?: string }) {
  const { data: session } = useSession()
  const clearCart = useCartStore((state) => state.clearCart)
  const clearWishlist = useWishlistStore((state) => state.clearWishlist)
  const clearCheckout = useCheckoutStore((state) => state.clearCheckout)

  const handleLogout = async () => {
    clearCart()
    clearWishlist()
    clearCheckout()
    const targetUrl = session?.user?.role === "ADMIN" 
      ? "/portal/rk-exec-gateway" 
      : session?.user?.role === "SUPPORT" 
      ? "/portal/rk-service-desk" 
      : "/login";
    await signOut({ callbackUrl: targetUrl })
  }

  return (
    <button 
      onClick={handleLogout}
      className={className || "px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-2"}
    >
      <LogOut size={18} /> Sign Out
    </button>
  )
}
