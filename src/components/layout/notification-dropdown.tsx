"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Bell, Check, X, Trash2 } from "lucide-react"
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from "@/actions/notification"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NotificationDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 60000) // fetch every 60 seconds for updates
      return () => clearInterval(interval)
    }
  }, [session])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    const res = await getUserNotifications()
    if (res.success) {
      setNotifications(res.notifications || [])
    }
    setLoading(false)
  }

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, any> = {};
    const result: any[] = [];
    
    notifications.forEach(notif => {
      const key = notif.link || notif.title + notif.message;
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
          groups[key].title = notif.title;
        }
      }
    });
    
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = async (id: string, e: React.MouseEvent, groupIds?: string[]) => {
    e.stopPropagation()
    const idsToMark = groupIds || [id];
    setNotifications(prev => prev.map(n => idsToMark.includes(n.id) ? { ...n, isRead: true } : n))
    await Promise.all(idsToMark.map(gid => markNotificationAsRead(gid)))
  }

  const handleNotificationClick = async (notification: any) => {
    const { id, isRead, link, groupIds } = notification;
    if (!isRead) {
      const idsToMark = groupIds || [id];
      setNotifications(prev => prev.map(n => idsToMark.includes(n.id) ? { ...n, isRead: true } : n))
      idsToMark.forEach((gid: string) => markNotificationAsRead(gid));
    }
    if (link) {
      setIsOpen(false)
      router.push(link)
    }
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllNotificationsAsRead()
  }

  const handleClearAll = async () => {
    setNotifications([])
    await clearAllNotifications()
  }

  if (!session?.user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-icon"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-slate-500 stroke-[1.5]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-neo-card border border-charcoal/10 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="p-4 border-b border-charcoal/5 flex items-center justify-between bg-cream/50">
            <h3 className="font-bold text-charcoal">Notifications</h3>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1"
                >
                  <Check size={12} /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-xs font-bold text-rose hover:text-rose/80 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {loading && groupedNotifications.filter(n => !n.isRead).length === 0 ? (
              <div className="p-8 text-center text-slate text-sm font-medium">Loading...</div>
            ) : groupedNotifications.filter(n => !n.isRead).length === 0 ? (
              <div className="p-8 text-center text-slate">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-charcoal/5">
                {groupedNotifications.filter(n => !n.isRead).map(notification => (
                  <div 
                    key={notification.id} 
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-slate-50 transition-colors ${notification.link ? 'cursor-pointer' : 'cursor-default'} relative ${!notification.isRead ? 'bg-teal-50/30' : ''}`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-r"></div>
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-charcoal' : 'font-medium text-charcoal/80'}`}>
                          {notification.title}
                        </h4>
                        {notification.groupCount > 1 && (
                          <span className="text-[10px] font-bold text-white bg-rose-500 rounded-full px-1.5 py-0.5 leading-none">
                            {notification.groupCount}
                          </span>
                        )}
                      </div>
                      {!notification.isRead && (
                        <button 
                          onClick={(e) => handleMarkAsRead(notification.id, e, notification.groupIds)}
                          className="text-slate hover:text-teal-600 p-0.5 rounded-full hover:bg-teal-50 transition-colors shrink-0"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p className={`text-xs ${!notification.isRead ? 'text-charcoal/80' : 'text-slate'} leading-relaxed`}>
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate/60 mt-2 font-medium">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-charcoal/5 bg-slate-50 text-center">
            <Link href="/account/notifications" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors inline-block w-full">
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
