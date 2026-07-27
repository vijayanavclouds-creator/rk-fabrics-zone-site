"use client"

import { useEffect } from "react"

export function AutoPrint() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return null
}

export function PrintButton() {
  return (
    <button 
      className="btn-primary px-8 py-3"
      onClick={() => window.print()}
    >
      Print Invoice
    </button>
  )
}
