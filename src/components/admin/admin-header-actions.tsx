"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, AlertTriangle, Settings, Check, Trash2 } from "lucide-react"
import { getAdminNotifications, markAdminNotificationAsRead, markAllAdminNotificationsAsRead, getLateShippingAlerts, updateLateShippingThreshold, clearAllAdminNotifications } from "@/actions/admin-notifications"
import { toast } from "sonner"
import Link from "next/link"

export function AdminHeaderActions() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [paymentAlerts, setPaymentAlerts] = useState<any[]>([])
  const [thresholdHours, setThresholdHours] = useState(6)
  
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)

  const notifRef = useRef<HTMLDivElement>(null)
  const alertRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000) // refresh every 10 seconds for near real-time updates
    
    const handleStatusUpdate = () => fetchData()
    window.addEventListener('orderStatusUpdated', handleStatusUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('orderStatusUpdated', handleStatusUpdate)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) {
        setShowAlerts(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchData = async () => {
    const [notifRes, alertRes] = await Promise.all([
      getAdminNotifications(),
      getLateShippingAlerts()
    ])
    
    if (notifRes.success) setNotifications(notifRes.notifications || [])
    if (alertRes.success) {
      setAlerts(alertRes.lateOrders || [])
      setPaymentAlerts(alertRes.paymentAlerts || [])
      setThresholdHours(alertRes.thresholdHours || 6)
    }
  }

  const unreadNotifs = notifications.filter(n => !n.isRead).length
  const totalAlerts = alerts.length + paymentAlerts.length

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await markAdminNotificationAsRead(id)
  }

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    await markAllAdminNotificationsAsRead()
  }

  const handleClearAll = async () => {
    setNotifications([])
    await clearAllAdminNotifications()
  }

  const handleMarkPaymentAlertAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPaymentAlerts(prev => prev.filter(a => a.id !== id))
    await markAdminNotificationAsRead(id)
  }

  return (
    <div className="flex items-center gap-3">
      {/* ALERTS */}
      <div className="relative" ref={alertRef}>
        <button 
          onClick={() => { setShowAlerts(!showAlerts); setShowNotifications(false); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${totalAlerts > 0 ? 'bg-rose-50 text-rose-600' : 'hover:bg-black/5 text-slate'}`}
          aria-label="Alerts"
        >
          <AlertTriangle size={20} className={totalAlerts > 0 ? 'animate-pulse' : ''} />
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {totalAlerts}
            </span>
          )}
        </button>

        {showAlerts && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-neo-card border border-charcoal/10 overflow-hidden z-50">
            <div className="p-4 border-b border-charcoal/5 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-charcoal flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose" /> 
                Alerts ({totalAlerts})
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar bg-white">
              {totalAlerts === 0 ? (
                <div className="p-8 text-center text-slate">
                  <AlertTriangle size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No alerts right now! Good job.</p>
                </div>
              ) : (
                <div className="divide-y divide-charcoal/5">
                  {/* Payment Alerts */}
                  {paymentAlerts.map(alert => (
                    <div key={alert.id} className="group relative hover:bg-slate-50 transition-colors bg-green-50/50 border-l-4 border-green-500">
                      <Link 
                        href={alert.link || "#"}
                        className="block p-4"
                        onClick={(e) => {
                          handleMarkPaymentAlertAsRead(alert.id, e);
                          setShowAlerts(false);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-green-800 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                            Payment Received
                          </h4>
                          <span className="text-xs font-medium text-slate">
                            {new Date(alert.createdAt).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal mt-1 font-medium">{alert.message}</p>
                      </Link>
                      <button 
                        onClick={(e) => handleMarkPaymentAlertAsRead(alert.id, e)}
                        className="absolute right-4 top-4 text-green-700 p-1 rounded-full hover:bg-green-200 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Late Shipping Alerts */}
                  {alerts.map(order => (
                    <Link 
                      href={`/admin/orders/user/${order.userId}`} 
                      key={order.id}
                      className="block p-4 hover:bg-rose-50/30 transition-colors"
                      onClick={() => setShowAlerts(false)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-charcoal flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose inline-block"></span>
                          Order #{order.id.slice(-6).toUpperCase()}
                        </h4>
                        <span className="text-xs font-bold text-rose">
                          {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60))}h late
                        </span>
                      </div>
                      <p className="text-xs text-slate mt-1">{order.user.name || order.email}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATIONS */}
      <div className="relative" ref={notifRef}>
        <button 
          onClick={() => { setShowNotifications(!showNotifications); setShowAlerts(false); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${unreadNotifs > 0 ? 'bg-teal-50 text-teal-700' : 'hover:bg-black/5 text-slate'}`}
          aria-label="Admin Notifications"
        >
          <Bell size={20} />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {unreadNotifs}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-neo-card border border-charcoal/10 overflow-hidden z-50">
            <div className="p-4 border-b border-charcoal/5 flex items-center justify-between bg-cream/50">
              <h3 className="font-bold text-charcoal">System Activity</h3>
              <div className="flex gap-3">
                {unreadNotifs > 0 && (
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
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate">
                  <Bell size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No recent activity</p>
                </div>
              ) : (
                <div className="divide-y divide-charcoal/5">
                  {notifications.map(notification => (
                    <div key={notification.id} className={`group relative hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-teal-50/20' : ''}`}>
                      {notification.link ? (
                        <Link 
                          href={notification.link}
                          className="block p-4"
                          onClick={(e) => {
                            if (!notification.isRead) handleMarkAsRead(notification.id, e);
                            setShowNotifications(false);
                          }}
                        >
                          <NotificationContent notification={notification} />
                        </Link>
                      ) : (
                        <div className="p-4">
                          <NotificationContent notification={notification} />
                        </div>
                      )}
                      
                      {!notification.isRead && (
                        <button 
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="absolute right-4 top-4 text-teal-600 p-1 rounded-full hover:bg-teal-100 transition-colors"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-charcoal/5 bg-slate-50 text-center">
              <Link href="/account/admin/notifications" onClick={() => setShowNotifications(false)} className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors inline-block w-full">
                View All Activity
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationContent({ notification }: { notification: any }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-1 pr-6">
        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider
          ${notification.type === 'ORDER' ? 'bg-teal-100 text-teal-800' : 
            notification.type === 'REVIEW' ? 'bg-gold-light/20 text-gold-dark' : 
            'bg-slate-100 text-slate-700'}`}
        >
          {notification.type}
        </span>
        <span className="text-[10px] text-slate font-medium">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </div>
      <p className={`text-sm ${!notification.isRead ? 'font-medium text-charcoal' : 'text-slate'} pr-6`}>
        {notification.message}
      </p>
    </>
  )
}
