"use client"

import { useState } from "react"
import { toast } from "sonner"
import { deactivateAccount } from "@/actions/user"
import { signOut } from "next-auth/react"
import { useCartStore, useWishlistStore } from "@/store"
import { useCheckoutStore } from "@/store/checkout"

export default function DeactivateAccount() {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const clearCart = useCartStore((state) => state.clearCart)
  const clearWishlist = useWishlistStore((state) => state.clearWishlist)
  const clearCheckout = useCheckoutStore((state) => state.clearCheckout)

  const handleDeactivate = async () => {
    if (!confirm) {
      setConfirm(true)
      return
    }

    setLoading(true)
    const result = await deactivateAccount()
    
    if (result.success) {
      toast.success("Account deactivated successfully")
      clearCart()
      clearWishlist()
      clearCheckout()
      signOut({ callbackUrl: "/" })
    } else {
      toast.error(result.error || "Failed to deactivate account")
      setLoading(false)
      setConfirm(false)
    }
  }

  return (
    <div className="max-w-lg">
      <p className="text-error font-medium text-sm mb-4">
        Once you deactivate your account, there is no going back. Please be certain. All your order history and saved addresses will be permanently removed.
      </p>
      
      {confirm ? (
        <div className="space-y-4">
          <p className="font-bold text-charcoal">Are you absolutely sure?</p>
          <div className="flex gap-4">
            <button 
              onClick={handleDeactivate} 
              disabled={loading}
              className="btn-primary !py-2 !px-4 text-sm w-fit disabled:opacity-50"
            >
              {loading ? "Deactivating..." : "Yes, Deactivate"}
            </button>
            <button 
              onClick={() => setConfirm(false)} 
              disabled={loading}
              className="px-4 py-2 text-sm border border-charcoal/20 text-charcoal font-bold rounded-full hover:bg-charcoal/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setConfirm(true)}
          className="btn-primary !py-2 !px-4 text-sm w-fit"
        >
          Deactivate Account
        </button>
      )}
    </div>
  )
}
