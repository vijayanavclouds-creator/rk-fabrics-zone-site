"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"

import { Suspense } from "react"

function CheckoutFailureContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm text-center relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-rose-50 to-rose-100/50 -z-10 rounded-t-3xl"></div>
        
        <div className="w-20 h-20 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-600/30">
          <XCircle size={40} />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-4">
          Payment Failed
        </h1>
        
        <p className="text-slate mb-2">
          Unfortunately, we were unable to process your payment. 
        </p>
        
        {orderId && (
          <p className="text-sm text-slate mb-8">
            Order Reference: <span className="font-bold text-charcoal">{orderId}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link 
            href="/checkout"
            className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </Link>
          
          <Link 
            href="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-charcoal border border-charcoal/20 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </Link>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-slate text-center max-w-md">
        If you continue to experience issues, please try a different payment method or contact our support team.
      </p>
    </div>
  )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <CheckoutFailureContent />
    </Suspense>
  )
}
