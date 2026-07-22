import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Bell, Trash2, Check, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getAdminNotifications, markAdminNotificationAsRead, markAllAdminNotificationsAsRead, clearAllAdminNotifications } from "@/actions/admin-notifications"
import { revalidatePath } from "next/cache"

export default async function AdminNotificationsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const { notifications = [] } = await getAdminNotifications()

  async function handleClearAll() {
    "use server"
    await clearAllAdminNotifications()
    revalidatePath("/account/admin/notifications")
  }

  async function handleMarkAllRead() {
    "use server"
    await markAllAdminNotificationsAsRead()
    revalidatePath("/account/admin/notifications")
  }

  async function handleMarkAsRead(id: string) {
    "use server"
    await markAdminNotificationAsRead(id)
    revalidatePath("/account/admin/notifications")
  }

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-charcoal/10">
        <div>
          <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal flex items-center gap-3">
            <Bell size={24} className="text-teal-600" />
            System Activity
          </h2>
          <p className="text-sm text-slate mt-1">Review all recent events across your platform.</p>
        </div>
        
        <div className="flex gap-3">
          {notifications.some((n: any) => !n.isRead) && (
            <form action={handleMarkAllRead}>
              <button type="submit" className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-xl hover:bg-teal-100 transition-colors text-sm flex items-center gap-2 border border-teal-200">
                <Check size={16} /> Mark all read
              </button>
            </form>
          )}
          {notifications.length > 0 && (
            <form action={handleClearAll}>
              <button type="submit" className="px-4 py-2 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition-colors text-sm flex items-center gap-2 border border-rose-200">
                <Trash2 size={16} /> Clear All
              </button>
            </form>
          )}
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-charcoal/10 flex-1 flex flex-col items-center justify-center">
          <Bell size={48} className="mx-auto text-slate mb-4 opacity-30" />
          <h3 className="text-xl font-bold text-charcoal mb-2">No system activity</h3>
          <p className="text-slate mb-8 max-w-md">Your platform is running smoothly. Any new notifications about orders, users, or queries will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {notifications.map((notification: any) => (
            <div key={notification.id} className={`bg-white border rounded-2xl p-5 transition-colors flex items-start gap-4 ${!notification.isRead ? 'border-teal-300 bg-teal-50/20 shadow-sm' : 'border-charcoal/10 hover:border-charcoal/20'}`}>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0
                    ${notification.type === 'ORDER' ? 'bg-teal-100 text-teal-800' : 
                      notification.type === 'REVIEW' ? 'bg-gold-light/20 text-gold-dark' : 
                      'bg-slate-100 text-slate-700'}`}
                  >
                    {notification.type}
                  </span>
                  
                  {!notification.isRead && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                  )}
                  
                  <span className="text-xs text-slate font-medium ml-auto">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <p className={`${!notification.isRead ? 'text-charcoal font-medium' : 'text-slate'} text-sm leading-relaxed mb-3`}>
                  {notification.message}
                </p>
                
                {notification.link && (
                  <Link href={notification.link} className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">
                    View Details <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              {!notification.isRead && (
                <form action={handleMarkAsRead.bind(null, notification.id)} className="shrink-0 mt-1">
                  <button type="submit" className="text-teal-600 hover:text-teal-800 p-1.5 rounded-full hover:bg-teal-50 transition-colors" title="Mark as read">
                    <Check size={16} />
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
