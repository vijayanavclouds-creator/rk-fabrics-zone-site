"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAdminUserOrders, updateOrderStatus } from "@/actions/order"
import { toast } from "sonner"
import { Package, CheckCircle, Clock, Truck, XCircle, ArrowLeft, Gift, Send } from "lucide-react"
import { createCoupon } from "@/actions/coupon"

export default function UserOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const userIdOrEmail = decodeURIComponent(params.id as string)
  
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [couponData, setCouponData] = useState({
    discountValue: 10,
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    expiresInDays: 7,
    sendEmail: true
  })
  const [creatingCoupon, setCreatingCoupon] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [userIdOrEmail])

  const fetchOrders = async () => {
    setLoading(true)
    const res = await getAdminUserOrders(userIdOrEmail)
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

  const handleOfferPromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingCoupon(true)
    
    try {
      const res = await createCoupon({
        ...couponData,
        validForUserId: orders[0]?.userId // Get actual user ID from the order
      })
      
      if (res.success && res.coupon) {
        toast.success(`Coupon ${res.coupon.code} created!`)
        if (couponData.sendEmail) {
          toast.success("Offer email sent to user!")
        }
      } else {
        toast.error(res.error || "Failed to create coupon")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setCreatingCoupon(false)
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

  if (loading) {
    return <div className="p-12 text-center text-slate">Loading orders...</div>
  }

  const userName = orders.length > 0 ? (orders[0].user?.name || "Guest") : "Unknown User"

  return (
    <div className="space-y-6 animate-in fade-in duration-300 p-8 max-w-7xl mx-auto min-h-screen bg-[#fdfaf6]">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-slate hover:text-charcoal transition-colors mb-4"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex justify-between items-center bg-white rounded-2xl border border-charcoal/10 px-8 py-5 shadow-sm">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal">
            Orders for {userName}
          </h2>
          <p className="text-slate mt-1 text-sm">{userIdOrEmail}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm overflow-hidden p-6 divide-y divide-charcoal/10">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-charcoal">No Orders Found</h3>
            <p>This user has not placed any orders.</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} className="py-6 first:pt-0 last:pb-0">
              <div className="flex flex-col xl:flex-row gap-6 justify-between">
                
                {/* Order Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <span className="font-mono text-sm font-bold bg-slate-50 px-3 py-1 rounded-lg border border-charcoal/10">
                      {order.id}
                    </span>
                    <span className="text-sm text-slate font-medium">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-1">Contact</h4>
                      <div className="text-sm text-charcoal font-medium">
                        {order.phone}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-1">Shipping Address</h4>
                      <p className="text-sm text-charcoal font-medium max-w-sm leading-relaxed">{order.shippingAddress}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-2">Order Items</h4>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex-shrink-0 flex items-center gap-3 bg-white p-2 pr-4 rounded-xl border border-charcoal/10 shadow-sm">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden border border-charcoal/5">
                            {item.image ? (
                              <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate">
                                <Package size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-charcoal line-clamp-1 max-w-[150px]">{item.productName}</p>
                            <div className="flex items-center justify-between mt-0.5">
                              <p className="text-[10px] font-medium text-slate bg-slate-100 px-1.5 py-0.5 rounded">{item.variantName}</p>
                              <p className="text-xs font-bold text-teal-700">x{item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions & Financials */}
                <div className="xl:w-72 flex flex-col justify-between bg-white rounded-2xl border border-charcoal/10 p-5 shadow-sm h-full">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate font-medium">Subtotal</span>
                      <span className="text-charcoal font-bold">₹{order.subtotalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate font-medium">Shipping</span>
                      <span className="text-charcoal font-bold">₹{order.shippingAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base border-t border-charcoal/10 pt-3 mt-1">
                      <span className="font-bold text-charcoal">Total</span>
                      <span className="font-bold text-teal-700">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2 bg-slate-50 p-2 rounded-lg border border-charcoal/5">
                      <span className="text-slate font-medium">Payment</span>
                      <span className="font-bold text-charcoal">{order.paymentMethod} • <span className={order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>{order.paymentStatus}</span></span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-2">Update Status</h4>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-charcoal/20 bg-slate-50 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-sm font-bold text-charcoal cursor-pointer"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
          </div>
        </div>

        {/* Promotion Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-charcoal/10 shadow-sm p-6 sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="font-bold text-charcoal text-lg">Offer Promotion</h3>
                <p className="text-xs text-slate">Send a custom coupon to this user</p>
              </div>
            </div>

            <form onSubmit={handleOfferPromotion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">Discount</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={couponData.discountValue}
                    onChange={(e) => setCouponData({...couponData, discountValue: Number(e.target.value)})}
                    className="w-full p-2.5 rounded-xl border border-charcoal/20 bg-slate-50 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-sm font-bold text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">Type</label>
                  <select 
                    value={couponData.discountType}
                    onChange={(e) => setCouponData({...couponData, discountType: e.target.value as "PERCENTAGE" | "FIXED"})}
                    className="w-full p-2.5 rounded-xl border border-charcoal/20 bg-slate-50 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-sm font-bold text-charcoal"
                  >
                    <option value="PERCENTAGE">% OFF</option>
                    <option value="FIXED">₹ OFF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">Valid For (Days)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={couponData.expiresInDays}
                  onChange={(e) => setCouponData({...couponData, expiresInDays: Number(e.target.value)})}
                  className="w-full p-2.5 rounded-xl border border-charcoal/20 bg-slate-50 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-sm font-bold text-charcoal"
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-charcoal/10 cursor-pointer" onClick={() => setCouponData({...couponData, sendEmail: !couponData.sendEmail})}>
                <input 
                  type="checkbox"
                  checked={couponData.sendEmail}
                  onChange={() => {}}
                  className="w-4 h-4 text-teal-600 rounded border-charcoal/20 focus:ring-teal-600"
                />
                <span className="text-sm font-bold text-charcoal">Send offer email to user</span>
              </div>

              <button 
                type="submit"
                disabled={creatingCoupon || orders.length === 0}
                className="w-full py-3 bg-charcoal text-white rounded-xl font-bold shadow-neo-btn hover:bg-black hover:shadow-neo-pressed transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {creatingCoupon ? "Generating..." : <><Send size={16} /> Generate Coupon</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
