"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"

import { Suspense } from "react"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  useEffect(() => {
    // Fire confetti on successful order
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#0d9488', '#f59e0b', '#1e293b']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#0d9488', '#f59e0b', '#1e293b']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    
    frame()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm text-center relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-teal-50 to-teal-100/50 -z-10 rounded-t-3xl"></div>
        
        <div className="w-20 h-20 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-600/30">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-2">Order Confirmed!</h1>
        <p className="text-slate mb-8">Thank you for your purchase. We've received your order and are getting it ready to ship.</p>
        
        {orderId && (
          <div className="bg-slate-50 border border-charcoal/10 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-center gap-3 mb-2">
              <Package size={20} className="text-teal-600" />
              <h3 className="font-bold text-charcoal">Order Reference</h3>
            </div>
            <p className="text-sm font-mono font-bold text-charcoal/70 bg-white border border-charcoal/10 p-3 rounded-lg inline-block">
              {orderId}
            </p>
            <p className="text-xs text-slate mt-3">
              You can track this order in your account dashboard.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link 
            href="/account"
            className="btn-primary flex-1 py-4 px-6 flex items-center justify-center gap-2 text-center whitespace-nowrap text-sm"
          >
            <ShoppingBag size={18} />
            View Order
          </Link>
          <Link 
            href="/shop"
            className="btn-primary flex-1 py-4 px-6 flex items-center justify-center gap-2 text-center whitespace-nowrap text-sm"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
