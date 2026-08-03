"use client"

import { useState, useEffect, useMemo } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { PortalHeader } from "@/components/layout/portal-header"
import { getAdminNotifications, markAllAdminNotificationsAsRead, clearAllAdminNotifications, markAdminNotificationAsRead } from "@/actions/admin-notifications"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NotificationsManager() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const res = await getAdminNotifications()
    if (res.success) {
      setNotifications(res.notifications || [])
    } else {
      toast.error("Failed to load notifications")
    }
    setLoading(false)
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllAdminNotificationsAsRead()
    toast.success("All notifications marked as read")
  }

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return
    setNotifications([])
    await clearAllAdminNotifications()
    toast.success("All notifications cleared")
  }

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent, groupIds?: string[]) => {
    if (e) e.stopPropagation();
    const idsToMark = groupIds || [id];
    setNotifications(prev => prev.map(n => idsToMark.includes(n.id) ? { ...n, isRead: true } : n));
    await Promise.all(idsToMark.map(gid => markAdminNotificationAsRead(gid)));
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id, undefined, notification.groupIds);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  }

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, any> = {};
    const result: any[] = [];
    
    notifications.forEach(notif => {
      const key = notif.link || notif.message;
      if (!groups[key]) {
        groups[key] = { 
          ...notif, 
          groupCount: notif.isRead ? 0 : 1, 
          groupIds: [notif.id],
          isRead: notif.isRead
        };
        result.push(groups[key]);
      } else {
        if (!notif.isRead) {
          groups[key].groupCount++;
          groups[key].isRead = false;
        }
        groups[key].groupIds.push(notif.id);
        if (new Date(notif.createdAt) > new Date(groups[key].createdAt)) {
          groups[key].createdAt = notif.createdAt;
          groups[key].message = notif.message;
        }
      }
    });
    
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [notifications]);

  return (
    <div className="w-full">
      <PortalHeader 
        title="Notifications" 
        description="All system alerts and notifications." 
      />

      <div className="-mx-6 -my-6 md:m-0 bg-white md:rounded-3xl border-y md:border border-charcoal/10 overflow-hidden shadow-sm p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)] md:min-h-0 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 border-b border-charcoal/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">System Notifications</h3>
              <p className="text-sm text-slate">Stay updated on orders, queries, and system events.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors"
            >
              <Check size={16} />
              Mark all read
            </button>
            <button 
              onClick={handleClearAll}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <Trash2 size={16} />
              Clear all
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
          </div>
        ) : groupedNotifications.length === 0 ? (
          <div className="py-20 text-center text-slate">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-charcoal mb-2">No Notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal/5 flex-1 overflow-y-auto">
            {groupedNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 md:p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-teal-50/20' : ''} ${notification.link || !notification.isRead ? 'cursor-pointer' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1
                  ${notification.type === 'ORDER' ? 'bg-teal-100 text-teal-700' : 
                    notification.type === 'REVIEW' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-100 text-slate-700'}`}
                >
                  <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider
                        ${notification.type === 'ORDER' ? 'bg-teal-100 text-teal-800' : 
                          notification.type === 'REVIEW' ? 'bg-amber-100 text-amber-800' : 
                          'bg-slate-100 text-slate-700'}`}
                      >
                        {notification.type}
                      </span>
                      {notification.groupCount > 1 && (
                        <span className="text-[10px] font-bold text-white bg-rose-500 rounded-full px-1.5 py-0.5 leading-none">
                          {notification.groupCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate font-medium">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className={`text-sm ${!notification.isRead ? 'font-bold text-charcoal' : 'text-slate'}`}>
                    {notification.message}
                  </p>
                  {notification.link && (
                    <span className="inline-block mt-2 text-xs font-bold text-teal-600 hover:text-teal-800">
                      View Details &rarr;
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
