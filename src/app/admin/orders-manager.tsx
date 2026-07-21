"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAllOrders, updateOrderStatus } from "@/actions/order"
import { toast } from "sonner"
import { Package, Search, ChevronRight, CheckCircle, Clock, Truck, XCircle, User } from "lucide-react"

export function OrdersManager() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const res = await getAllOrders()
    if (res.success) {
      setOrders(res.orders || [])
    } else {
      toast.error(res.error || "Failed to load orders")
    }
    setLoading(false)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    toast.loading("Updating status...")
    const res = await updateOrderStatus(orderId, newStatus)
    toast.dismiss()
    
    if (res.success) {
      toast.success("Order status updated!")
      fetchOrders()
    } else {
      toast.error(res.error || "Failed to update status")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock size={16} />
      case "PROCESSING": return <Package size={16} />
      case "SHIPPED": return <Truck size={16} />
      case "DELIVERED": return <CheckCircle size={16} />
      case "CANCELLED": return <XCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-800 border-amber-200"
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
        lastOrderedDate: order.createdAt,
      };
    }
    acc[userId].orders.push(order);
    
    // aggregate total products purchased
    const orderQuantity = order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    acc[userId].totalPurchased += orderQuantity;
    
    // get last ordered date
    if (new Date(order.createdAt) > new Date(acc[userId].lastOrderedDate)) {
      acc[userId].lastOrderedDate = order.createdAt;
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl border border-charcoal/10 px-8 py-5 shadow-sm">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal">
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

      <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-slate">Loading orders...</div>
        ) : usersList.length === 0 ? (
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
                  <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Last Ordered Date</th>
                  <th className="p-5 font-bold text-charcoal text-xs uppercase tracking-wider whitespace-nowrap">Account Created</th>
                  <th className="p-5 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user: any) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-charcoal/5 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/admin/orders/user/${encodeURIComponent(user.id)}`)}
                  >
                    <td className="p-5">
                      <div className="text-sm font-bold text-teal-700">{user.name}</div>
                      <div className="text-xs text-slate mt-1">{user.email}</div>
                    </td>
                    <td className="p-5 text-sm font-medium text-charcoal whitespace-nowrap">
                      {user.totalPurchased} items
                    </td>
                    <td className="p-5 text-sm font-medium text-charcoal whitespace-nowrap">
                      {new Date(user.lastOrderedDate).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-sm font-medium text-charcoal whitespace-nowrap">
                      {user.createdAt}
                    </td>
                    <td className="p-5 text-right">
                      <ChevronRight size={20} className="text-slate group-hover:text-teal-600 transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
