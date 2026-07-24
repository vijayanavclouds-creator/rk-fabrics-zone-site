"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Check } from "lucide-react"

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isPayment = pathname.includes("/payment")
  const isSuccess = pathname.includes("/success")
  const isFailure = pathname.includes("/failure")

  if (isSuccess || isFailure) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="w-full mx-auto px-4 md:px-8">
        
        {/* Stepper */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isPayment ? "bg-teal-600 text-white" : "bg-teal-600 text-white shadow-neo-btn"}`}>
              {isPayment ? <Check size={16} /> : "1"}
            </div>
            <span className={`ml-3 font-bold ${isPayment ? "text-teal-600" : "text-charcoal"}`}>Shipping</span>
          </div>
          
          <div className="w-16 h-[2px] mx-4 bg-charcoal/10 relative">
            <div className={`absolute top-0 left-0 h-full bg-teal-600 transition-all duration-500 ${isPayment ? "w-full" : "w-0"}`}></div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isPayment ? "bg-teal-600 text-white shadow-neo-btn" : "bg-charcoal/10 text-slate"}`}>
              2
            </div>
            <span className={`ml-3 font-bold ${isPayment ? "text-charcoal" : "text-slate"}`}>Payment</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
