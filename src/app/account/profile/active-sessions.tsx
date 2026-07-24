"use client"

import { Monitor, Smartphone } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

const defaultSessions = [
  { id: 1, type: "desktop", name: "Mac OS Safari", location: "Jaipur, India", time: "Active Now" },
  { id: 2, type: "mobile", name: "iPhone 13 Chrome", location: "Delhi, India", time: "Last active 2 days ago" },
  { id: 3, type: "tablet", name: "iPad Pro Safari", location: "Jaipur, India", time: "Last active 3 hours ago" }
]

export default function ActiveSessions() {
  const [sessions, setSessions] = useState(defaultSessions)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const stored = localStorage.getItem("activeSessionsV2")
    if (stored) {
      try {
        setSessions(JSON.parse(stored))
      } catch (e) {
        // silently fallback to default
      }
    }
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
                {session.type === "desktop" ? <Monitor size={20} /> : <Smartphone size={20} />}
              </div>
              <div>
                <p className="font-bold text-charcoal text-sm">{session.name}</p>
                <p className="text-xs text-slate">{session.location} • {session.time}</p>
              </div>
            </div>
            {session.id === 1 && (
              <span className="text-xs font-bold text-teal-600 px-2 py-1 bg-teal-50 rounded">
                Current
              </span>
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
