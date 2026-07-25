"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cancelCustomerOrder } from "@/actions/order"

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    const res = await cancelCustomerOrder(orderId)
    
    if (res.success) {
      toast.success("Order cancelled successfully")
      router.refresh()
    } else {
      toast.error(res.error || "Failed to cancel order")
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCancel} 
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-rose-600 bg-white border-2 border-rose-600/20 rounded-xl hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Cancelling..." : "Cancel Order"}
    </button>
  )
}
