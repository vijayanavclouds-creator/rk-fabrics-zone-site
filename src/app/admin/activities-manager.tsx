"use client"

import { useState, useEffect } from "react"
import { Activity, Clock, Trash2, AlertTriangle } from "lucide-react"
import { PortalHeader } from "@/components/layout/portal-header"
import { getAllAdminActivities, deleteAdminActivitiesByDateRange } from "@/actions/admin-activity"
import { toast } from "sonner"

export function ActivitiesManager() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [showClearHistory, setShowClearHistory] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isClearing, setIsClearing] = useState(false)
  
  // Calculate max date (3 months ago)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() - 3)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  useEffect(() => {
    fetchActivities(page)
  }, [page])

  const fetchActivities = async (pageNum: number) => {
    setLoading(true)
    const res = await getAllAdminActivities(pageNum, 50)
    if (res.success) {
      setActivities(res.activities)
      setTotalPages(res.totalPages)
    } else {
      toast.error("Failed to load activities")
    }
    setLoading(false)
  }

  const handleClearHistory = async () => {
    if (!startDate || !endDate) return toast.error("Please select both dates")
    if (new Date(startDate) > new Date(endDate)) return toast.error("Start date cannot be after end date")
    
    setIsClearing(true)
    const res = await deleteAdminActivitiesByDateRange(startDate, endDate)
    setIsClearing(false)
    
    if (res.success) {
      toast.success(`Successfully deleted ${res.count} activities`)
      setShowClearHistory(false)
      setStartDate("")
      setEndDate("")
      setPage(1)
      fetchActivities(1)
    } else {
      toast.error(res.error || "Failed to delete history")
    }
  }

  return (
    <div className="w-full">
      <PortalHeader 
        title="Activity Log" 
        description="A complete history of all administrative actions." 
      />

      <div className="-mx-6 -my-6 md:m-0 bg-white md:rounded-3xl border-y md:border border-charcoal/10 overflow-hidden shadow-sm p-4 md:p-6 lg:p-8 h-[calc(100vh-64px)] md:h-[calc(100vh-140px)] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-charcoal/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">System Activity Log</h3>
              <p className="text-sm text-slate">All actions are recorded for security and auditing purposes.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowClearHistory(!showClearHistory)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <Trash2 size={16} />
            Clear History
          </button>
        </div>

        {showClearHistory && (
          <div className="mb-8 p-5 bg-red-50/50 border border-red-100 rounded-2xl shrink-0">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-4">
              <AlertTriangle size={18} />
              <h4>Delete Activity History</h4>
            </div>
            <p className="text-sm text-slate mb-4">
              Select a date range to permanently delete activity logs. For security purposes, logs from the last 3 months cannot be deleted.
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider">Start Date</label>
                <input 
                  type="date" 
                  max={maxDateStr}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-charcoal/10 rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-charcoal uppercase tracking-wider">End Date (Max: {new Date(maxDateStr).toLocaleDateString()})</label>
                <input 
                  type="date" 
                  max={maxDateStr}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-charcoal/10 rounded-xl text-charcoal focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                />
              </div>
              <button 
                onClick={handleClearHistory}
                disabled={isClearing || !startDate || !endDate}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClearing ? "Deleting..." : "Delete Logs"}
              </button>
              <button 
                onClick={() => setShowClearHistory(false)}
                className="px-6 py-2.5 bg-white border border-charcoal/10 hover:bg-cream text-charcoal font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12 flex-1 items-center">
            <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 relative group">
                  <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 shrink-0 relative z-10 shadow-[0_0_8px_rgba(20,184,166,0.6)] group-hover:scale-125 transition-transform"></div>
                  <div className="absolute left-[5px] top-5 w-[2px] h-full bg-slate-200 -z-0"></div>
                  <div className="pb-2 w-full relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-base text-charcoal">
                        <span className="font-bold text-lg">{activity.adminName}</span> <span dangerouslySetInnerHTML={{ __html: activity.action + (activity.details ? ` - ${activity.details}` : '') }} />
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate bg-slate-50 px-2.5 py-1 rounded-md shrink-0 border border-slate-100">
                        <Clock size={12} />
                        <span>{new Date(activity.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} at {new Date(activity.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                      </div>
                    </div>
                    {index !== activities.length - 1 && (
                      <div className="absolute -bottom-1.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-charcoal/10 to-transparent pointer-events-none"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-charcoal/10 shrink-0 -mb-2 md:-mb-4">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium hover:bg-cream disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center px-3 font-medium text-xs text-charcoal">
                  Page {page} of {totalPages}
                </div>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 border border-charcoal/10 rounded-lg text-xs font-medium hover:bg-cream disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p>No activities recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
