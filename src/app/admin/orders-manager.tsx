"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { getAllOrders, updateOrderStatus, toggleUserOrdersReadStatus } from "@/actions/order"
import { getAbandonedCarts, sendAbandonedCartReminder } from "@/actions/cart"
import { getAdminSettings } from "@/actions/admin-notifications"
import AdminSettingsForm from "./order-settings-form"
import { toast } from "sonner"
import { Package, Search, ChevronRight, CheckCircle, Clock, Truck, XCircle, User, Bell, Settings, SlidersHorizontal, X, Check } from "lucide-react"

export function OrdersManager({ readOnly = false, basePath = "/admin" }: { readOnly?: boolean; basePath?: string }) {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"orders" | "abandoned" | "settings">("orders")
  const [sentReminders, setSentReminders] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [threshold, setThreshold] = useState<number>(6)
  const [filterStatuses, setFilterStatuses] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const handleBulkSendReminders = async () => {
    if (selectedUsers.length === 0) return;
    toast.loading(`Sending ${selectedUsers.length} reminders...`)
    
    let successCount = 0;
    let failCount = 0;
    
    for (const userId of selectedUsers) {
      const res = await sendAbandonedCartReminder(userId);
      if (res.success) {
        successCount++;
        setSentReminders(prev => {
          if (!prev.includes(userId)) {
            const next = [...prev, userId];
            localStorage.setItem("sentReminders", JSON.stringify(next));
            return next;
          }
          return prev;
        });
      } else {
        failCount++;
      }
    }
    
    toast.dismiss();
    if (successCount > 0) {
      toast.success(`Sent ${successCount} reminders successfully!`);
    }
    if (failCount > 0) {
      toast.error(`Failed to send ${failCount} reminders.`);
    }
    setSelectedUsers([]);
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

  // Filter orders by status if any filters are selected
  const filteredOrders = filterStatuses.length > 0 
    ? orders.filter(o => filterStatuses.includes(o.status))
    : orders;

  // Group orders by User
  const groupedUsers = filteredOrders.reduce((acc, order) => {
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
    if (!order.isReadByAdmin && order.status === "PROCESSING") acc[userId].hasUnreadOrders = true;
    
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
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-2 mb-1">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
            Order Management
          </h2>
          <p className="text-slate mt-1 text-sm">View and manage customer orders.</p>
        </div>
      </div>
      


      {/* Sub Tabs */}
      <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar py-2 mb-1">
        <button
          onClick={() => setActiveTab("orders")}
          className={`btn-primary !py-2 !px-4 text-xs md:text-sm whitespace-nowrap transition-all ${
            activeTab === "orders" ? "opacity-100" : "opacity-60 hover:opacity-80"
          }`}
        >
          All Orders
        </button>
        {!readOnly && (
          <button
            onClick={() => setActiveTab("abandoned")}
            className={`btn-primary !py-2 !px-4 text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
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
            className={`btn-primary !py-2 !px-4 text-xs md:text-sm whitespace-nowrap flex items-center gap-2 transition-all ${
              activeTab === "settings" ? "opacity-100" : "opacity-60 hover:opacity-80"
            }`}
          >
            Order Settings
          </button>
        )}
      </div>

      <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-charcoal/10 border-x-0 md:border-x shadow-sm -mx-6 md:mx-0">


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
          <div className="flex flex-col w-full">
            <div className="flex justify-end items-center gap-4 py-2 px-3 md:px-5 md:rounded-t-3xl">
              <div className="flex items-center overflow-hidden h-8 md:h-[34px] btn-primary !p-0 !pl-3 md:!pl-4 w-full max-w-[200px] md:max-w-[280px]">
                <Search className="text-slate-500 shrink-0 stroke-[1.5]" size={14} />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none text-[10px] md:text-xs text-charcoal placeholder:text-slate/60 w-full pl-2 pr-3 h-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-primary !py-1 !px-2.5 md:!py-1.5 md:!px-3 flex items-center gap-1.5 text-[10px] md:text-xs font-medium transition-all ${
                    showFilters ? "shadow-neo-pressed scale-[0.97]" : ""
                  }`}
                >
                  <SlidersHorizontal size={12} />
                  Filters
                  {filterStatuses.length > 0 && (
                    <span className="w-4 h-4 bg-teal-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {filterStatuses.length}
                    </span>
                  )}
                </button>
                {showFilters && (
                  <div className="absolute right-0 top-full mt-1.5 w-[110px] md:w-[130px] bg-white border border-charcoal/10 rounded-xl shadow-xl z-50 p-1 md:p-1.5 max-h-64 overflow-y-auto no-scrollbar">
                    {["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => {
                      const isSelected = filterStatuses.includes(status);
                      return (
                      <button
                        key={status} 
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFilterStatuses(filterStatuses.filter(s => s !== status))
                          } else {
                            setFilterStatuses([...filterStatuses, status])
                          }
                          setShowFilters(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-teal-50/80" : "hover:bg-slate-50"}`}
                      >
                        <span className={`text-[10px] md:text-[13px] transition-colors truncate ${isSelected ? "font-bold text-teal-700" : "font-medium text-charcoal"}`}>{status}</span>
                      </button>
                    )})}
                  </div>
                )}
              </div>
            </div>
          </div>
          {usersList.length === 0 ? (
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
                    <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider min-w-[140px] md:min-w-[200px]">Customer Name</th>
                    <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Total Products</th>
                    <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Recent Items</th>
                    <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Ordered Date</th>
                    <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Account Created</th>
                    <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="p-3 md:p-5 w-8 md:w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user: any) => (
                    <tr 
                      key={user.id} 
                      className={`border-b border-charcoal/5 hover:bg-slate-50 transition-colors cursor-pointer group ${user.hasUnreadOrders ? 'bg-amber-50/30' : ''}`}
                      onClick={() => router.push(`${basePath}/orders/user/${encodeURIComponent(user.id)}`)}
                    >
                      <td className="p-3 md:p-5 align-middle">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div>
                            <p className="font-semibold text-charcoal text-xs md:text-base flex items-center gap-1 md:gap-2">
                              {user.name}
                              {user.hasUnreadOrders && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">New</span>
                              )}
                            </p>
                            <p className="text-[10px] md:text-sm text-slate">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 md:p-5 align-middle">
                        <span className="font-medium text-xs md:text-base text-charcoal whitespace-nowrap">{user.totalPurchased} items</span>
                      </td>
                      <td className="p-3 md:p-5 align-middle hidden md:table-cell">
                        <span className="font-medium text-xs md:text-base text-charcoal whitespace-nowrap">{user.recentOrderItemsCount} items</span>
                      </td>
                      <td className="p-3 md:p-5 align-middle hidden md:table-cell">
                        <span className="text-[10px] md:text-base text-slate whitespace-nowrap">{new Date(user.lastOrderedDate).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3 md:p-5 align-middle hidden lg:table-cell">
                        <span className="text-[10px] md:text-base text-slate whitespace-nowrap">{user.createdAt}</span>
                      </td>
                      <td className="p-3 md:p-5 align-middle" onClick={(e) => e.stopPropagation()}>
                        {user.hasUnreadOrders ? (
                          !readOnly ? (
                            <button
                              onClick={(e) => handleToggleReadStatus(e, user.id, false)}
                              className="text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors whitespace-nowrap border border-teal-200 shadow-sm"
                            >
                              Mark Read
                            </button>
                          ) : (
                            <span className="text-[10px] md:text-xs font-medium text-amber-600 whitespace-nowrap">Unread</span>
                          )
                        ) : (
                          <span className="text-[10px] md:text-xs font-medium text-slate-500 whitespace-nowrap flex items-center gap-1">
                            <CheckCircle size={14} className="text-slate-400" /> Read
                          </span>
                        )}
                      </td>
                      <td className="p-3 md:p-5 align-middle text-right">
                        <ChevronRight className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        ) : (
          abandonedCarts.length === 0 ? (
            <div className="p-12 text-center text-slate">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-charcoal">No Abandoned Checkouts</h3>
              <p>There are currently no users with pending carts.</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="p-4 border-b border-charcoal/10 flex items-center justify-between bg-slate-50">
                <button
                  onClick={() => {
                    if (selectedUsers.length === abandonedCarts.length) {
                      setSelectedUsers([]);
                    } else {
                      setSelectedUsers(abandonedCarts.map(c => c.id));
                    }
                  }}
                  className="text-sm font-medium text-teal-700 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${selectedUsers.length === abandonedCarts.length ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                    {selectedUsers.length === abandonedCarts.length && <Check size={12} className="text-white" />}
                  </div>
                  Select All
                </button>
                {selectedUsers.length > 0 && (
                  <button
                    onClick={handleBulkSendReminders}
                    className="text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-2 transition-all"
                  >
                    <Bell size={14} /> Send Reminders ({selectedUsers.length})
                  </button>
                )}
              </div>
              <div className="overflow-x-hidden md:overflow-x-auto w-full">
                <table className="w-full text-left border-collapse table-fixed md:table-auto">
                  <thead>
                    <tr className="bg-cream-dark/30 border-b border-charcoal/10">
                      <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider w-1/3 md:w-auto">Customer Name</th>
                      <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider w-1/4 md:w-auto">Cart Value</th>
                      <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider hidden md:table-cell">Items</th>
                      <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider w-1/4 md:w-auto">Last Reminder</th>
                      <th className="p-3 md:p-5 font-bold text-charcoal text-[10px] md:text-xs uppercase tracking-wider text-right w-[80px] md:w-auto">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abandonedCarts.map((user: any) => {
                      const isSelected = selectedUsers.includes(user.id);
                      return (
                      <tr 
                        key={user.id} 
                        onClick={() => {
                          setSelectedUsers(prev => prev.includes(user.id) ? prev.filter(id => id !== user.id) : [...prev, user.id]);
                        }}
                        className={`border-b border-charcoal/5 hover:bg-slate-50 transition-colors cursor-pointer relative ${isSelected ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="p-3 md:p-5 align-middle break-words relative">
                          {isSelected && (
                            <div className="absolute top-1 left-1 text-blue-500 bg-transparent">
                              <Check size={16} strokeWidth={3} />
                            </div>
                          )}
                          <div className="flex items-center gap-2 md:gap-3 ml-2 md:ml-0">
                            <div>
                              <p className="font-semibold text-charcoal text-xs md:text-base flex items-center gap-2">
                                {user.name}
                              </p>
                              <p className="text-[9px] md:text-sm text-slate truncate max-w-[100px] md:max-w-full">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 md:p-5 align-middle">
                          <span className="font-medium text-charcoal text-xs md:text-lg whitespace-nowrap">₹{user.totalAmount?.toLocaleString() || 0}</span>
                          {/* Show items count below cart value on mobile only */}
                          <div className="md:hidden text-[9px] text-slate mt-1">{user.items?.length || 0} item(s)</div>
                        </td>
                        <td className="p-3 md:p-5 align-middle hidden md:table-cell">
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
                        <td className="p-3 md:p-5 align-middle">
                          <span className="text-[9px] md:text-base text-slate whitespace-nowrap">
                            {sentReminders.includes(user.id) ? "Recently Sent" : "Never"}
                          </span>
                        </td>
                        <td className="p-2 md:p-5 align-middle text-right">
                          <button
                            type="button"
                            disabled={selectedUsers.length > 0}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSendReminder(user.id);
                            }}
                            className={`text-[9px] md:text-sm font-bold px-2 py-1 md:px-4 md:py-2 rounded md:rounded-lg text-white transition-colors shadow-sm flex items-center justify-center gap-1 md:gap-2 ml-auto ${
                              selectedUsers.length > 0 ? "bg-slate-300 cursor-not-allowed opacity-50" :
                              sentReminders.includes(user.id) ? "bg-amber-500 hover:bg-amber-600" : "bg-teal-600 hover:bg-teal-700"
                            }`}
                          >
                            <Bell size={12} className="md:w-4 md:h-4" /> 
                            <span className="hidden md:inline">{sentReminders.includes(user.id) ? "Send again" : "Send Reminder"}</span>
                            <span className="md:hidden">{sentReminders.includes(user.id) ? "Again" : "Send"}</span>
                          </button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
    </div>
  )
}
