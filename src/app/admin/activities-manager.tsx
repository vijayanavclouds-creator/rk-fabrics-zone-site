"use client"

import { useState, useEffect } from "react"
import { Activity, Clock } from "lucide-react"
import { PortalHeader } from "@/components/layout/portal-header"
import { getAllAdminActivities } from "@/actions/admin-activity"
import { toast } from "sonner"

export function ActivitiesManager() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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

  return (
    <div className="space-y-6">
      <PortalHeader 
        title="Activity Log" 
        description="A complete history of all administrative actions." 
      />

      <div className="bg-white rounded-3xl border border-charcoal/10 overflow-hidden shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-charcoal/10">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-charcoal">System Activity Log</h3>
            <p className="text-sm text-slate">All actions are recorded for security and auditing purposes.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 relative group">
                <div className="w-3 h-3 rounded-full bg-teal-500 mt-1.5 shrink-0 relative z-10 shadow-[0_0_8px_rgba(20,184,166,0.6)] group-hover:scale-125 transition-transform"></div>
                <div className="absolute left-[5px] top-5 w-[2px] h-full bg-slate-200 -z-0"></div>
                <div className="pb-4 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-base text-charcoal">
                      <span className="font-bold text-lg">{activity.adminName}</span> <span dangerouslySetInnerHTML={{ __html: activity.action }} />
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate bg-slate-50 px-2.5 py-1 rounded-md shrink-0 border border-slate-100">
                      <Clock size={12} />
                      <span>{new Date(activity.createdAt).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} at {new Date(activity.createdAt).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                    </div>
                  </div>
                  
                  {activity.details && (
                    <div className="mt-3 text-sm text-slate-700 bg-cream-dark/30 p-4 rounded-xl border border-charcoal/5 whitespace-pre-wrap font-mono shadow-inner overflow-x-auto">
                      {activity.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-charcoal/10">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 border border-charcoal/10 rounded-lg text-sm font-medium hover:bg-cream disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center px-4 font-medium text-sm text-charcoal">
                  Page {page} of {totalPages}
                </div>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 border border-charcoal/10 rounded-lg text-sm font-medium hover:bg-cream disabled:opacity-50 transition-colors"
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
