"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { getAdminUserOrders, updateOrderStatus, toggleUserOrdersReadStatus, updateOrderShippingMode } from "@/actions/order"
import { generateAWB } from "@/actions/delivery"
import { toast } from "sonner"
import { Package, CheckCircle, Clock, Truck, XCircle, ArrowLeft, Gift, Send, Printer, ChevronDown, Info } from "lucide-react"
import { createCoupon } from "@/actions/coupon"
import { AdminMobileHeader } from "@/components/layout/admin-mobile-header"

export default function UserOrdersPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userIdOrEmail = decodeURIComponent(params.id as string)
  
  const [orders, setOrders] = useState<any[]>([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(searchParams.get("expanded"))
  const [loading, setLoading] = useState(true)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)
  const [couponData, setCouponData] = useState({
    discountValue: 10,
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    expiresInDays: 7,
    sendEmail: true
  })
  const [creatingCoupon, setCreatingCoupon] = useState(false)
  const [generatingAWB, setGeneratingAWB] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    // Automatically mark the user's orders as read when opening their page
    toggleUserOrdersReadStatus(userIdOrEmail, true).catch(console.error)

    const handlePopState = () => {
      setIsNavigatingBack(true)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [userIdOrEmail])

  useEffect(() => {
    const expandedParam = searchParams.get("expanded");
    let targetId = expandedParam;
    
    if (!targetId && typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.length > 1) {
        targetId = hash.substring(1);
      }
    }

    if (targetId) {
      console.log("[DEBUG] Target ID found:", targetId);
      setExpandedOrderId(targetId);
      
      // Wait for DOM to render the list, then scroll
      if (!loading && orders.length > 0) {
        console.log("[DEBUG] Loading false, orders > 0. Attempting scroll for", targetId);
        setTimeout(() => {
          const el = document.getElementById(targetId as string);
          console.log("[DEBUG] Element found for scroll:", el !== null);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Optional: highlight briefly
            el.style.transition = 'box-shadow 0.3s ease-in-out';
            el.style.boxShadow = '0 0 0 2px #0f766e';
            setTimeout(() => {
              el.style.boxShadow = 'none';
            }, 2000);
          }
        }, 200);
      }
    } else if (!loading && orders.length > 0 && !expandedOrderId) {
      // Fallback: If no order ID is specified in the URL, automatically expand the most recent order.
      setExpandedOrderId(orders[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, loading, orders.length]);

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
      toast.success("Order status updated successfully!")
      fetchOrders()
      window.dispatchEvent(new CustomEvent('orderStatusUpdated'))
    } else {
      toast.error(res.error || "Failed to update order status")
    }
  }

  const handleShippingModeChange = async (orderId: string, currentMode: string) => {
    const newMode = currentMode === "Express" ? "Surface" : "Express"
    toast.loading(`Updating shipping to ${newMode}...`)
    const res = await updateOrderShippingMode(orderId, newMode)
    toast.dismiss()
    
    if (res.success) {
      toast.success(`Shipping mode updated to ${newMode}!`)
      fetchOrders()
    } else {
      toast.error(res.error || "Failed to update shipping mode")
    }
  }

  const handleGenerateAWB = async (orderId: string) => {
    setGeneratingAWB(orderId)
    toast.loading("Generating Delhivery AWB...")
    const res = await generateAWB(orderId)
    toast.dismiss()
    
    if (res.success) {
      toast.success(`Waybill Generated: ${res.awbNumber}`)
      fetchOrders() // Refresh to show AWB number
    } else {
      toast.error(res.error || "Failed to generate AWB")
    }
    setGeneratingAWB(null)
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

  const getOrderCardBg = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "bg-emerald-50/50"
      case "PROCESSING": return "bg-blue-50/50"
      case "SHIPPED": return "bg-indigo-50/50"
      case "DELIVERED": return "bg-slate-50/50"
      case "CANCELLED": return "bg-rose-50/50"
      default: return "bg-white"
    }
  }

  if (loading || isNavigatingBack) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <div className="text-slate font-medium text-sm">{isNavigatingBack ? 'Navigating...' : 'Loading orders...'}</div>
      </div>
    )
  }

  const userName = orders.length > 0 ? (orders[0].user?.name || "Guest") : "Unknown User"

  return (
    <>
      <AdminMobileHeader />
      <div className="space-y-4 animate-in fade-in duration-300 py-4 px-0 md:p-6 w-full mx-auto pb-10 bg-[#f8fafc] md:bg-gradient-to-br md:from-teal-50 md:via-[#fdfaf6] md:to-blue-50/50">
        <div className="px-4 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-charcoal/10 pb-3 mb-4">
        <div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
            Orders for {userName}
          </h2>
          <p className="text-slate mt-1 text-sm">{userIdOrEmail}</p>
        </div>
      </div>



      <div className="flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 w-full">
        {/* Promotion Panel */}
        <div className="w-full lg:w-[40%] mb-8 lg:mb-0 lg:border-l lg:border-charcoal/10 lg:pl-8">
          <div className="bg-[#f6fafd] rounded-none md:rounded-3xl border-y md:border border-charcoal/10 border-x-0 md:border-x shadow-sm p-6 md:sticky md:top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="font-bold text-charcoal text-lg">Offer Promotion</h3>
                <p className="text-xs text-slate">Send a custom coupon to this user</p>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-6 flex items-start gap-3 text-xs md:text-sm text-blue-800 leading-relaxed">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong>Pro Tip:</strong> Create personalized discounts to win back inactive customers or reward loyal buyers. The coupon will be emailed directly to them along with a custom link.
              </p>
            </div>

            <form onSubmit={handleOfferPromotion} className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">Discount</label>
                  <div className="flex items-center overflow-hidden h-10 md:h-[42px] btn-primary !p-0 !px-4 w-full">
                    <input 
                      type="number"
                      required
                      min="1"
                      value={couponData.discountValue}
                      onChange={(e) => setCouponData({...couponData, discountValue: Number(e.target.value)})}
                      className="flex-1 bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none text-sm font-bold text-charcoal w-full h-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">Type</label>
                  <div className="relative">
                    <select 
                      value={couponData.discountType}
                      onChange={(e) => setCouponData({...couponData, discountType: e.target.value as "PERCENTAGE" | "FIXED"})}
                      className="btn-primary w-full h-10 md:h-[42px] !py-0 !pl-4 !pr-10 text-sm font-bold transition-all appearance-none cursor-pointer !outline-none focus:!shadow-neo-pressed"
                    >
                      <option value="PERCENTAGE">% OFF</option>
                      <option value="FIXED">₹ OFF</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal pointer-events-none stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate uppercase tracking-wider mb-2">Valid For (Days)</label>
                <div className="flex items-center overflow-hidden h-10 md:h-[42px] btn-primary !p-0 !px-4 w-full">
                  <input 
                    type="number"
                    required
                    min="1"
                    value={couponData.expiresInDays}
                    onChange={(e) => setCouponData({...couponData, expiresInDays: Number(e.target.value)})}
                    className="flex-1 bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none text-sm font-bold text-charcoal w-full h-full"
                  />
                </div>
              </div>

              <div 
                className="flex items-center gap-3 h-10 md:h-[42px] btn-primary !p-0 !px-4 cursor-pointer w-full transition-all hover:shadow-neo-pressed" 
                onClick={() => setCouponData({...couponData, sendEmail: !couponData.sendEmail})}
              >
                <input 
                  type="checkbox"
                  checked={couponData.sendEmail}
                  onChange={() => {}}
                  className="w-4 h-4 text-teal-600 rounded border-charcoal/20 focus:ring-teal-600 cursor-pointer pointer-events-none"
                />
                <span className="text-sm font-bold text-charcoal select-none">Send offer email to user</span>
              </div>

              <button 
                type="submit"
                disabled={creatingCoupon || orders.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2 text-center py-4 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingCoupon ? "Generating..." : <><Send size={16} /> Generate Coupon</>}
              </button>
            </form>
          </div>
        </div>

      <div className="w-full lg:w-[60%] flex flex-col">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-4">
            <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-charcoal/10 border-x-0 md:border-x shadow-sm p-12 text-center text-slate">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-charcoal">No Orders Found</h3>
            <p>This user has not placed any orders.</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order.id} id={order.id} className="rounded-none md:rounded-xl border-y md:border border-charcoal/10 border-x-0 md:border-x shadow-sm bg-white overflow-hidden transition-all">
              {/* Accordion Header */}
              <div 
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                className={`flex flex-nowrap items-center w-full p-3 md:p-4 cursor-pointer hover:bg-slate-50 transition-colors ${expandedOrderId === order.id ? getOrderCardBg(order.status) : ''}`}
              >
                <div className="w-[50%] md:w-[50%] pr-2 md:pr-4 flex min-w-0">
                  <span className="font-mono text-[10px] md:text-sm font-bold text-charcoal bg-slate-100 px-1.5 md:px-3 py-1 rounded-lg break-all">
                    {order.id.length > 6 ? (
                      <>
                        <span className="opacity-40 font-normal">{order.id.slice(0, -6)}</span>
                        <span className="text-rose-600 bg-rose-50 px-0.5 rounded">{order.id.slice(-6).toUpperCase()}</span>
                      </>
                    ) : (
                      <span className="text-rose-600 bg-rose-50 px-0.5 rounded">{order.id.toUpperCase()}</span>
                    )}
                  </span>
                </div>
                <div className="w-[18%] md:w-[20%] pr-2 md:pr-4 flex items-center">
                  <span className="text-[11px] md:text-sm font-bold text-teal-700 whitespace-nowrap">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-[27%] md:w-[25%] pr-2 md:pr-4 flex justify-start items-center">
                  <span className={`inline-flex items-center gap-1 md:gap-1.5 px-1.5 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-xs font-bold border whitespace-nowrap ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <div className="w-[5%] flex justify-end items-center shrink-0">
                  <ChevronDown className={`text-slate-400 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Accordion Content */}
              {expandedOrderId === order.id && (
                <div className={`p-4 md:p-5 border-t border-charcoal/10 transition-colors ${getOrderCardBg(order.status)}`}>
              <div className="flex flex-col xl:flex-row gap-5 justify-between">
                
                {/* Order Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <span className="text-sm text-slate font-medium">
                      {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                    <div className="flex flex-wrap gap-3">
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
                      <span className="text-slate font-medium">Shipping {order.shippingMode === "Express" && <span className="text-teal-600 font-bold">(Express)</span>}</span>
                      <span className="text-charcoal font-bold">{order.shippingAmount === 0 ? "Free" : `₹${order.shippingAmount.toLocaleString()}`}</span>
                    </div>
                    {order.platformFeeAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate font-medium">Platform Fee</span>
                        <span className="text-charcoal font-bold">₹{order.platformFeeAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-slate font-medium">GST</span>
                      <span className="text-charcoal font-bold">₹{(order.gstAmount || 0).toLocaleString()}</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span className="font-medium">Discount</span>
                        <span className="font-bold">-₹{order.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base border-t border-charcoal/10 pt-3 mt-1">
                      <span className="font-bold text-charcoal">Total</span>
                      <span className="font-bold text-teal-700">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2 bg-slate-50 p-2 rounded-lg border border-charcoal/5">
                      <span className="text-slate font-medium">Payment</span>
                      <span className="font-bold text-charcoal">{order.paymentMethod} • <span className={order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}>{order.paymentStatus}</span></span>
                    </div>
                    {order.transactionId && (
                      <div className="flex justify-between text-xs mt-1 bg-slate-50 p-2 rounded-lg border border-charcoal/5">
                        <span className="text-slate font-medium">Txn ID</span>
                        <span className="font-mono font-medium text-charcoal text-[10px] break-all text-right ml-4">{order.transactionId}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    {!order.waybillGenerated && order.status !== "CANCELLED" && (
                      <div className="mb-4 bg-slate-50 border border-charcoal/10 rounded-xl p-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center mt-0.5">
                            <input 
                              type="checkbox" 
                              checked={order.shippingMode === "Express"}
                              onChange={() => handleShippingModeChange(order.id, order.shippingMode || "Surface")}
                              className="peer sr-only" 
                            />
                            <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-teal-600 peer-checked:border-teal-600 transition-all flex items-center justify-center group-hover:border-teal-400">
                              <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1">
                            <span className="font-bold text-charcoal text-sm block">Express Delivery</span>
                            <p className="text-[10px] text-slate mt-0.5">Overrides standard delivery</p>
                          </div>
                        </label>
                      </div>
                    )}

                    <h4 className="text-xs font-bold text-slate uppercase tracking-wider mb-2">Update Status</h4>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}
                      className={`w-full p-2.5 rounded-xl border border-charcoal/20 bg-slate-50 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-sm font-bold text-charcoal ${order.status === "DELIVERED" || order.status === "CANCELLED" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    
                    <button
                      onClick={() => window.open(`/account/orders/${order.id}/invoice`, '_blank', 'noopener,noreferrer')}
                      className="w-full mt-3 p-2.5 rounded-xl border border-charcoal/20 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-bold text-charcoal shadow-sm"
                    >
                      <Printer size={16} />
                      Generate Invoice
                    </button>

                    {/* Delhivery Integration Button */}
                    {!order.waybillGenerated ? (
                      <button
                        onClick={() => handleGenerateAWB(order.id)}
                        disabled={generatingAWB === order.id}
                        className="w-full mt-3 p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-bold text-blue-700 shadow-sm disabled:opacity-50"
                      >
                        <Package size={16} />
                        {generatingAWB === order.id ? "Generating..." : "Generate Delhivery AWB"}
                      </button>
                    ) : (
                      <div className="w-full mt-3 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 flex flex-col items-center justify-center gap-1 text-sm font-bold text-emerald-700 shadow-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} /> Waybill Generated
                        </div>
                        <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-emerald-200">{order.awbNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                            </div>
            </div>
            )}
          </div>
          ))
        )}
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
    </>
  )
}
