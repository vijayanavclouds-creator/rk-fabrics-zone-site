import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Bell, Trash2, Check, ArrowRight } from "lucide-react"
import Link from "next/link"
import { markNotificationAsRead, markAllNotificationsAsRead, clearAllNotifications } from "@/actions/notification"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
};



export default async function CustomerNotificationsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Auto-delete notifications older than 24 hours
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  await prisma.notification.deleteMany({
    where: {
      userId: session.user.id,
      createdAt: { lt: oneDayAgo }
    }
  })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  async function handleClearAll() {
    "use server"
    await clearAllNotifications()
    revalidatePath("/account/notifications")
  }

  async function handleMarkAllRead() {
    "use server"
    await markAllNotificationsAsRead()
    revalidatePath("/account/notifications")
  }

  async function handleMarkAsRead(id: string) {
    "use server"
    await markNotificationAsRead(id)
    revalidatePath("/account/notifications")
  }

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-charcoal/10">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal flex items-center gap-3">
          <Bell size={24} className="text-teal-600" />
          Notifications
        </h2>
        
        <div className="flex gap-3">
          {notifications.some(n => !n.isRead) && (
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
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-charcoal/10">
          <Bell size={48} className="mx-auto text-slate mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-charcoal mb-2">No notifications yet</h3>
          <p className="text-slate mb-8">You&apos;re all caught up! New notifications will appear here.</p>
          <Link href="/shop" className="inline-block px-8 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`bg-white border rounded-2xl p-6 transition-colors ${!notification.isRead ? 'border-teal-300 bg-teal-50/10 shadow-sm' : 'border-charcoal/10 hover:border-charcoal/20'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg ${!notification.isRead ? 'font-bold text-charcoal' : 'font-semibold text-charcoal/80'}`}>
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        New
                      </span>
                    )}
                  </div>
                  <p className={`${!notification.isRead ? 'text-charcoal' : 'text-slate'} mb-3`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate font-medium">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between gap-4 md:w-48 shrink-0">
                  {!notification.isRead ? (
                    <form action={handleMarkAsRead.bind(null, notification.id)}>
                      <button type="submit" className="text-teal-600 hover:text-teal-800 text-sm font-bold flex items-center gap-1 transition-colors">
                        <Check size={16} /> Mark as read
                      </button>
                    </form>
                  ) : (
                    <div />
                  )}
                  
                  {notification.link && (
                    <Link href={notification.link} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors w-full justify-center">
                      View Details <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
