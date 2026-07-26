"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllOrders, updateOrderStatus, toggleUserOrdersReadStatus } from "@/actions/order"
import { getAbandonedCarts, sendAbandonedCartReminder } from "@/actions/cart"
import { getAdminSettings } from "@/actions/admin-notifications"
import AdminSettingsForm from "./order-settings-form"
import { toast } from "sonner"
import { Package, Search, ChevronRight, CheckCircle, Clock, Truck, XCircle, User, Bell, Settings } from "lucide-react"

export function OrdersManager({ readOnly = false, basePath = "/admin" }: { readOnly?: boolean; basePath?: string }) {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"orders" | "abandoned" | "settings">("orders")
  const [sentReminders, setSentReminders] = useState<string[]>([])
  const [threshold, setThreshold] = useState<number>(6)

  useEffect(() => {
    fetchOrders()
    const storedReminders = localStorage.getItem("sentReminders")
    if (storedReminders) {
      try {
        setSentReminders(JSON.parse(storedReminders))
      } catch (e) {}
    }
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const [ordersRes, cartsRes, settingsRes] = await Promise.all([
      getAllOrders(),
      getAbandonedCarts(),
      getAdminSettings()
    ])
    
    if (ordersRes.success) {
      setOrders(ordersRes.orders || [])
    } else {
      toast.error(ordersRes.error || "Failed to load orders")
    }

    if (cartsRes.success) {
      setAbandonedCarts(cartsRes.data || [])
    }

    if (settingsRes.success && settingsRes.settings) {
      setThreshold(settingsRes.settings.lateShippingThresholdHours || 6)
    }
    
    setLoading(false)
  }

  const handleSendReminder = async (userId: string) => {
    toast.loading("Sending reminder...")
    const res = await sendAbandonedCartReminder(userId)
    toast.dismiss()
    
    if (res.success) {
      toast.success("Reminder sent successfully!")
      setSentReminders(prev => {
        const next = [...prev, userId]
        localStorage.setItem("sentReminders", JSON.stringify(next))
        return next
      })
    } else {
      toast.error(res.error || "Failed to send reminder")
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    toast.loading("Updating status...")
    const res = await updateOrderStatus(orderId, newStatus)
    toast.dismiss()
    
    if (res.success) {
      toast.success("Order status updated!")
      fetchOrders()
      window.dispatchEvent(new CustomEvent('orderStatusUpdated'))
    } else {
      toast.error(res.error || "Failed to update status")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <Clock size={16} />
      case "PROCESSING": return <Package size={16} />
      case "SHIPPED": return <Truck size={16} />
      case "DELIVERED": return <CheckCircle size={16} />
      case "CANCELLED": return <XCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-amber-100 text-amber-800 border-amber-200"
      case "PROCESSING": return "bg-blue-100 text-blue-800 border-blue-200"
      case "SHIPPED": return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "DELIVERED": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "CANCELLED": return "bg-rose-100 text-rose-800 border-rose-200"
      default: return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  // Group orders by User
  const groupedUsers = orders.reduce((acc, order) => {
    const userId = order.user?.id || order.email;
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        name: order.user?.name || "Guest",
        email: order.user?.email || order.email,
        createdAt: order.user?.createdAt ? new Date(order.user.createdAt).toLocaleDateString() : "N/A",
        orders: [],
        totalPurchased: 0,
        lastOrderedDate: new Date(0).toISOString(),
        recentOrderItemsCount: 0,
        hasUnreadOrders: false,
      };
    }
    acc[userId].orders.push(order);
    if (!order.isReadByAdmin) acc[userId].hasUnreadOrders = true;
    
    // aggregate total products purchased
    const orderQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    acc[userId].totalPurchased += orderQuantity;
    
    // get last ordered date
    if (new Date(order.createdAt) >= new Date(acc[userId].lastOrderedDate)) {
      acc[userId].lastOrderedDate = order.createdAt;
      acc[userId].recentOrderItemsCount = orderQuantity;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const usersList = Object.values(groupedUsers).filter((u: any) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.orders.some((o: any) => o.id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Sort users by last ordered date descending
  usersList.sort((a: any, b: any) => new Date(b.lastOrderedDate).getTime() - new Date(a.lastOrderedDate).getTime())

  const handleToggleReadStatus = async (e: React.MouseEvent, userId: string, currentStatus: boolean) => {
    e.stopPropagation() // Prevent clicking the row
    toast.loading(currentStatus ? "Marking as read..." : "Marking as unread...")
    const res = await toggleUserOrdersReadStatus(userId, !currentStatus)
    toast.dismiss()
    
    if (res.success) {
      toast.success(currentStatus ? "Orders marked as read" : "Orders marked as unread")
      fetchOrders()
    } else {
      toast.error(res.error || "Failed to update status")
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
            Order Management
          </h2>
          <p className="text-slate mt-1 text-sm">View and manage customer orders.</p>
        </div>
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by User Name, Email, or Order ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal/20 bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-sm"
          />
        </div>
      </div>
      
      {/* Sub Tabs */}
      <div className="flex items-center gap-4 border-b border-charcoal/10 pb-4 mt-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`btn-primary !py-2 !px-4 text-sm transition-all ${
            activeTab === "orders" ? "opacity-100" : "opacity-60 hover:opacity-80"
          }`}
        >
          All Orders
        </button>
        {!readOnly && (
          <button
            onClick={() => setActiveTab("abandoned")}
            className={`btn-primary !py-2 !px-4 text-sm flex items-center gap-2 transition-all ${
              activeTab === "abandoned" ? "opacity-100" : "opacity-60 hover:opacity-80"
            }`}
          >
            Abandoned Checkouts
            {abandonedCarts.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "abandoned" ? "bg-charcoal text-white" : "bg-charcoal/10 text-charcoal"
              }`}>
                {abandonedCarts.length}
              </span>
            )}
          </button>
        )}
        {!readOnly && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`btn-primary !py-2 !px-4 text-sm flex items-center gap-2 transition-all ${
              activeTab === "settings" ? "opacity-100" : "opacity-60 hover:opacity-80"
            }`}
          >
            Order Settings
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden">


        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)] text-slate">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Loading orders...</p>
          </div>
        ) : activeTab === "settings" ? (
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 border-b border-charcoal/10 pb-4">
              Order & Alert Settings
            </h2>
            <AdminSettingsForm initialThreshold={threshold} />
          </div>
        ) : activeTab === "orders" ? (
          usersList.length === 0 ? (
            <div className="p-12 text-center text-slate">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-charcoal">No Customers Found</h3>
              <p>There are no customers matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-dark/30 border-b border-charcoal/10">
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider min-w-[200px]">Customer Name</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Total Products</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Recent Order Items</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Last Ordered Date</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Account Created</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Read Status</th>
                    <th className="p-5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user: any) => (
                    <tr 
                      key={user.id} 
                      className={`border-b border-charcoal/5 hover:bg-slate-50 transition-colors cursor-pointer group ${user.hasUnreadOrders ? 'bg-amber-50/30' : ''}`}
                      onClick={() => router.push(`${basePath}/orders/user/${encodeURIComponent(user.id)}`)}
                    >
                      <td className="p-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-charcoal flex items-center gap-2">
                              {user.name}
                              {user.hasUnreadOrders && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">New Order</span>
                              )}
                            </p>
                            <p className="text-sm text-slate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 align-middle">
                        <span className="font-medium text-charcoal">{user.totalPurchased} items</span>
                      </td>
                      <td className="p-5 align-middle">
                        <span className="font-medium text-charcoal">{user.recentOrderItemsCount} items</span>
                      </td>
                      <td className="p-5 align-middle">
                        <span className="text-slate">{new Date(user.lastOrderedDate).toLocaleDateString()}</span>
                      </td>
                      <td className="p-5 align-middle">
                        <span className="text-slate">{user.createdAt}</span>
                      </td>
                      <td className="p-5 align-middle" onClick={(e) => e.stopPropagation()}>
                        {user.hasUnreadOrders ? (
                          !readOnly ? (
                            <button
                              onClick={(e) => handleToggleReadStatus(e, user.id, false)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors whitespace-nowrap border border-teal-200 shadow-sm"
                            >
                              Mark Read
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-amber-600 whitespace-nowrap">Unread</span>
                          )
                        ) : (
                          <span className="text-xs font-medium text-slate-500 whitespace-nowrap flex items-center gap-1">
                            <CheckCircle size={14} className="text-slate-400" /> Read
                          </span>
                        )}
                      </td>
                      <td className="p-5 align-middle text-right">
                        <ChevronRight className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          abandonedCarts.length === 0 ? (
            <div className="p-12 text-center text-slate">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-charcoal">No Abandoned Checkouts</h3>
              <p>There are currently no users with pending carts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cream-dark/30 border-b border-charcoal/10">
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider min-w-[200px]">Customer Name</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Cart Value</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Items</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Last Updated</th>
                    <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {abandonedCarts.map((user: any) => (
                    <tr key={user.id} className="border-b border-charcoal/5 hover:bg-slate-50 transition-colors">
                      <td className="p-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-semibold text-charcoal flex items-center gap-2">
                              {user.name}
                            </p>
                            <p className="text-sm text-slate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 align-middle">
                        <span className="font-medium text-charcoal text-lg">₹{user.totalAmount?.toLocaleString() || 0}</span>
                      </td>
                      <td className="p-5 align-middle">
                        <div className="flex flex-col gap-1">
                          {user.items?.map((item: any, idx: number) => (
                            <span key={idx} className="text-sm text-slate flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-charcoal">{item.quantity}x</span>
                              <span className="truncate max-w-[200px]" title={item.product?.name || item.productName || 'Product'}>
                                {item.product?.name || item.productName || 'Product'}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 align-middle">
                        <span className="text-slate">{new Date(user.cartUpdatedAt).toLocaleString()}</span>
                      </td>
                      <td className="p-5 align-middle text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSendReminder(user.id);
                          }}
                          className={`text-sm font-bold px-4 py-2 rounded-lg text-white transition-colors shadow-sm flex items-center justify-center gap-2 ml-auto ${
                            sentReminders.includes(user.id) ? "bg-amber-500 hover:bg-amber-600" : "bg-teal-600 hover:bg-teal-700"
                          }`}
                        >
                          <Bell size={16} /> {sentReminders.includes(user.id) ? "Send again" : "Send Reminder"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}
