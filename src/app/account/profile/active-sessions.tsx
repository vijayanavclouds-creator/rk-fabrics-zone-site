"use client"

import { Monitor, Smartphone, Laptop } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

type Session = {
  id: number
  type: "desktop" | "mobile" | "tablet"
  name: string
  location: string
  time: string
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Parse Real User Agent
    const ua = navigator.userAgent
    let browser = "Unknown Browser"
    if (ua.includes("Firefox")) browser = "Firefox"
    else if (ua.includes("Edg")) browser = "Edge"
    else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome"
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari"

    let os = "Unknown OS"
    let type: "desktop" | "mobile" | "tablet" = "desktop"
    
    if (ua.includes("Win")) os = "Windows"
    else if (ua.includes("Mac")) os = "Mac OS"
    else if (ua.includes("Linux")) os = "Linux"
    
    if (ua.includes("iPhone")) { os = "iOS (iPhone)"; type = "mobile" }
    else if (ua.includes("iPad")) { os = "iOS (iPad)"; type = "tablet" }
    else if (ua.includes("Android")) { 
      os = "Android"
      type = ua.includes("Mobile") ? "mobile" : "tablet"
    }

    const currentDeviceName = `${os} ${browser}`

    // Load saved cross-device sessions if any, otherwise default to just current device
    const stored = localStorage.getItem("activeSessionsV2")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Ensure the current device is always id: 1
        const otherSessions = parsed.filter((s: Session) => s.id !== 1)
        setSessions([
          { id: 1, type, name: currentDeviceName, location: "Current Location", time: "Active Now" },
          ...otherSessions
        ])
        return
      } catch (e) {
        // silently fallback
      }
    }

    // Default to just the real current device
    const defaultRealSession: Session[] = [
      { id: 1, type, name: currentDeviceName, location: "Current Location", time: "Active Now" }
    ]
    setSessions(defaultRealSession)
    localStorage.setItem("activeSessionsV2", JSON.stringify(defaultRealSession))

  }, [])

  const handleLogout = (id: number, name: string) => {
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    localStorage.setItem("activeSessionsV2", JSON.stringify(updated))
    toast.success(`Successfully logged out of ${name}`)
  }

  const handleLogoutAll = () => {
    const updated = sessions.filter(s => s.id === 1) // Keep only current session (Active Now)
    setSessions(updated)
    localStorage.setItem("activeSessionsV2", JSON.stringify(updated))
    toast.success("Successfully logged out of all other devices")
  }

  if (!isMounted) return <div className="animate-pulse h-32 bg-slate-50 rounded-xl" />

  return (
    <div className="max-w-lg">
      <p className="text-sm text-slate mb-4">
        Manage and log out your active sessions on other browsers and devices.
      </p>
      
      <div className="space-y-4 mb-6">
        {sessions.map(session => (
          <div key={session.id} className="flex items-center justify-between gap-4 group">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg shrink-0 ${session.id === 1 ? 'bg-teal-50 text-teal-600' : 'bg-charcoal/5 text-charcoal/60'}`}>
                {session.type === "desktop" ? <Laptop size={20} /> : <Smartphone size={20} />}
              </div>
              <div>
                <p className="font-bold text-charcoal text-sm">{session.name}</p>
                <p className="text-xs text-slate">{session.location} • {session.time}</p>
              </div>
            </div>
            {session.id === 1 ? (
              <span className="text-xs font-bold text-teal-600 px-2 py-1 bg-teal-50 rounded">
                Current
              </span>
            ) : (
              <button 
                onClick={() => handleLogout(session.id, session.name)}
                className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Log out
              </button>
            )}
          </div>
        ))}
        {sessions.length === 1 && (
          <p className="text-sm text-slate italic">You are only logged in on this device.</p>
        )}
      </div>

      {sessions.length > 1 && (
        <div className="pt-2">
          <button 
            type="button" 
            onClick={handleLogoutAll}
            className="btn-primary !py-2 !px-4 text-sm flex items-center justify-center gap-2 w-fit bg-transparent border border-charcoal/20 text-charcoal hover:bg-charcoal/5 transition-colors"
          >
            Log out of all other devices
          </button>
        </div>
      )}
    </div>
  )
}
