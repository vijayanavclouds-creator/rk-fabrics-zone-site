"use client"

import { AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function MobileNumberBanner() {
  const pathname = usePathname()

  // Hide this banner if the user is currently on the profile page where they can add their number.
  if (pathname?.includes("/profile")) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center hover:bg-amber-100/50 transition-colors mb-6">
      <div className="flex items-center gap-3">
        <AlertCircle size={20} className="text-amber-700 shrink-0" />
        <p className="text-sm text-amber-900 font-medium">
          Please add a mobile number to receive order updates and notifications. <Link href="/account/profile" className="font-bold underline hover:text-amber-700 transition-colors">Click here</Link>
        </p>
      </div>
    </div>
  )
}
