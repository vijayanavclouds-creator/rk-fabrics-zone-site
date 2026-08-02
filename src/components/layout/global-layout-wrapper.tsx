"use client"

import { usePathname } from "next/navigation"

export function HideOnMobilePortal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isInvoice = pathname?.includes("/invoice")
  if (isInvoice) return null

  const isPortal = pathname?.startsWith("/admin") || pathname?.startsWith("/support") || pathname?.startsWith("/portal")
  if (isPortal) return <div className="hidden md:block sticky top-0 z-50">{children}</div>
  return <>{children}</>
}

export function HideOnAllPortal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isInvoice = pathname?.includes("/invoice")
  if (isInvoice) return null

  const isPortal = pathname?.startsWith("/admin") || pathname?.startsWith("/support") || pathname?.startsWith("/portal")
  if (isPortal) return null
  return <>{children}</>
}

export function PortalMainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isInvoice = pathname?.includes("/invoice")
  if (isInvoice) return <>{children}</>

  const isPortal = pathname?.startsWith("/admin") || pathname?.startsWith("/support") || pathname?.startsWith("/portal")
  return <div className={`flex flex-col min-h-screen ${!isPortal ? "pb-20 md:pb-0" : ""}`}>{children}</div>
}
