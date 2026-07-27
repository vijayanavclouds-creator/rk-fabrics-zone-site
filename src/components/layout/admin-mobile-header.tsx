"use client"

import Link from "next/link"
import Image from "next/image"
import { Search } from "lucide-react"
import { useSession } from "next-auth/react"
import { useUIStore } from "@/store"
import { AdminHeaderActions } from "@/components/admin/admin-header-actions"
import { AccountDropdown } from "@/components/layout/account-dropdown"
import { AdminSearchOverlay } from "@/components/admin/admin-search-overlay"

export function AdminMobileHeader() {
  const { data: session } = useSession()
  const { toggleAdminSearch } = useUIStore()

  // This header is only visible on mobile screens
  return (
    <>
      <div className="md:hidden sticky top-0 z-50 w-full bg-[#f8fafc]/90 backdrop-blur-md border-b border-charcoal/5">
        <div className="flex items-center justify-between px-4 h-16">
          
          {/* Left Logo */}
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image 
                src="/logo.png" 
                alt="RK Fabrics Zone" 
                fill 
                className="object-contain opacity-70 grayscale"
                priority
              />
            </div>
            <div className="font-[family-name:var(--font-cinzel)] text-charcoal flex flex-col justify-center mt-0.5">
              <span className="font-bold text-[13px] leading-[1.1] tracking-wide">RK Fabrics</span>
              <span className="text-[8px] tracking-[0.25em] text-slate/80 font-medium">ZONE</span>
            </div>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <button onClick={toggleAdminSearch} className="btn-icon" aria-label="Search">
              <Search size={18} className="text-slate-500 stroke-[1.5]" />
            </button>
            
            <AdminHeaderActions />

            <div className="ml-1">
              <AccountDropdown />
            </div>
          </div>

        </div>
      </div>
      
      <AdminSearchOverlay />
    </>
  )
}
