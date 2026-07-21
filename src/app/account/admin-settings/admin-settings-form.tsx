"use client"

import { useState } from "react"
import { updateLateShippingThreshold } from "@/actions/admin-notifications"
import { toast } from "sonner"
import { Save, AlertTriangle } from "lucide-react"

export default function AdminSettingsForm({ initialThreshold }: { initialThreshold: number }) {
  const [threshold, setThreshold] = useState(initialThreshold.toString())
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const hours = parseInt(threshold)
    if (isNaN(hours) || hours <= 0) {
      return toast.error("Please enter a valid number of hours")
    }

    setIsPending(true)
    const res = await updateLateShippingThreshold(hours)
    setIsPending(false)

    if (res.success) {
      toast.success("Settings updated successfully")
    } else {
      toast.error(res.error || "Failed to update settings")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 border border-charcoal/10 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="text-rose-600" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-charcoal text-lg">Late Shipping Alert Threshold</h3>
            <p className="text-sm text-slate mt-1">Set the time limit for fulfilling orders before an alert is triggered.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto shrink-0">
          <div className="flex items-center bg-white border border-charcoal/10 rounded-xl overflow-hidden focus-within:border-teal-600 focus-within:ring-1 focus-within:ring-teal-600/50 transition-all shadow-inner w-full sm:w-[200px]">
            <input 
              type="number" 
              min="1"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full p-3 font-bold text-charcoal focus:outline-none bg-transparent"
              placeholder="e.g. 6"
            />
            <span className="text-sm font-semibold text-slate pr-4 shrink-0 bg-transparent select-none">hours</span>
          </div>
          
          <button 
            type="submit" 
            disabled={isPending}
            className="btn-primary w-12 h-12 flex items-center justify-center p-0 !px-0 rounded-xl flex-shrink-0 disabled:opacity-50"
            title="Save Settings"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
