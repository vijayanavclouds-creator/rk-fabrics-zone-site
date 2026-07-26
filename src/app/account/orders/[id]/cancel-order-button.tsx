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
      className="btn-primary flex items-center justify-center px-4 md:px-8 py-2.5 md:py-3.5 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Cancelling..." : "Cancel Order"}
    </button>
  )
}
