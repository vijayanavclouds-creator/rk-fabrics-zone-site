"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface PortalHeaderProps {
  title: string
  description?: string
  rightElement?: React.ReactNode
  onMenuClick?: () => void
  basePath?: string
}

export function PortalHeader({ title, description, rightElement }: PortalHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const headerContent = (
    <div className="flex flex-col sm:flex-row gap-4 justify-end items-end w-full lg:w-auto text-right">
      {/* Title and description removed as requested */}
      
      {rightElement && (
        <div>{rightElement}</div>
      )}
    </div>
  )

  const targetNode = document.getElementById("layout-header-right")
  if (!targetNode) return null

  return createPortal(headerContent, targetNode)
}
