import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import CancelOrderButton from "./cancel-order-button"
import { OrderItemsList } from "./order-items-list"
import ReturnOrderModal from "./return-order-modal"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const order = await prisma.order.findFirst({
    where: { id: resolvedParams.id, userId: session.user.id },
    include: { items: { include: { review: true } }, returnRequest: true }
  })

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fdfaf6] items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-charcoal mb-2">Order Not Found</h1>
        <p className="text-slate mb-6">We couldn't find the order you're looking for.</p>
        <Link href="/account" className="text-teal-600 font-bold hover:underline">
          Back to Account
        </Link>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <Clock size={24} />
      case "PROCESSING": return <Package size={24} />
      case "SHIPPED": return <Truck size={24} />
      case "DELIVERED": return <CheckCircle size={24} />
      case "CANCELLED": return <XCircle size={24} />
      default: return <Clock size={24} />
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "text-amber-500"
      case "PROCESSING": return "text-blue-500"
      case "SHIPPED": return "text-indigo-500"
      case "DELIVERED": return "text-emerald-600"
      case "CANCELLED": return "text-rose-500"
      case "RETURNED": return "text-orange-500"
      default: return "text-amber-500"
    }
  }

  return (
    <div className="w-full mx-auto px-0 md:px-6 lg:px-8 py-4 md:py-12">
      <main className="flex-grow w-full">
        
        <div className="bg-white rounded-none md:rounded-3xl border-y md:border border-charcoal/10 p-4 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-charcoal/10 mb-6">
            <div>
              <h1 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-1">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-slate">
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="flex flex-col md:items-end mt-4 md:mt-0">
              <p className="text-xs text-slate font-bold uppercase tracking-wider mb-1">Current Status</p>
              <div className={`text-2xl font-[family-name:var(--font-playfair)] font-bold flex items-center gap-2 ${getStatusTextColor(order.status)}`}>
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                </div>
                {order.status}
              </div>
            </div>
          </div>
          
          <div className="mb-8 grid grid-cols-2 md:flex md:justify-end gap-3">
            {(order.status === "CONFIRMED" || order.status === "PROCESSING") && (
              <CancelOrderButton orderId={order.id} />
            )}
            {order.status === "DELIVERED" && (
              <Link href={`/account/orders/${order.id}/invoice`} target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center justify-center px-4 md:px-8 py-2.5 md:py-3.5 text-sm whitespace-nowrap bg-white text-charcoal border-2 border-charcoal/20 hover:bg-charcoal/5">
                Download Invoice
              </Link>
            )}
            {(() => {
              if (order.status === "DELIVERED" && order.deliveredAt) {
                const returnDaysLimit = 7;
                const deliveryDate = new Date(order.deliveredAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - deliveryDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isWithinReturnWindow = diffDays <= returnDaysLimit;
                
                const hasReturnableItems = order.items.some((item: any) => item.isReturnable);

                if (isWithinReturnWindow && hasReturnableItems) {
                  const modalItems = order.items.map((item: any) => ({
                    id: item.id,
                    productName: item.productName,
                    variantName: item.variantName,
                    price: item.price,
                    image: item.image,
                    isReturnable: item.isReturnable,
                  }));
                  return (
                    <ReturnOrderModal 
                      orderId={order.id} 
                      paymentMethod={order.paymentMethod || 'PREPAID'} 
                      items={modalItems} 
                    />
                  );
                }
              }
              
              if (order.status !== "CANCELLED") {
                return (
                  <Link href={`/contact?orderId=${order.id}`} className="btn-primary flex items-center justify-center px-4 md:px-8 py-2.5 md:py-3.5 text-sm whitespace-nowrap">
                    Contact Us
                  </Link>
                );
              }
              return null;
            })()}
          </div>

          {(() => {
            if (order.status === "DELIVERED" && order.deliveredAt) {
              const returnDaysLimit = 7;
              const deliveryDate = new Date(order.deliveredAt);
              const now = new Date();
              const diffTime = Math.abs(now.getTime() - deliveryDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isWithinReturnWindow = diffDays <= returnDaysLimit;
              const hasReturnableItems = order.items.some((item: any) => item.isReturnable);

              if (!isWithinReturnWindow && hasReturnableItems) {
                const limitDate = new Date(deliveryDate.getTime() + returnDaysLimit * 24 * 60 * 60 * 1000);
                return (
                  <div className="mb-8 p-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl text-sm font-medium flex items-center gap-2">
                    <Clock size={18} />
                    Return window closed on {limitDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
                  </div>
                );
              }
            }
            return null;
          })()}

          {/* Timeline Tracker */}
          <div className="mb-10 px-4 md:px-8 py-6 bg-slate-50/50 rounded-2xl border border-charcoal/5">
            <h3 className="font-bold text-charcoal text-lg mb-6">Order Tracking</h3>
            <div className="flex flex-col ml-2">
              {/* Confirmed Node */}
              <div className="relative pl-8 pb-8">
                <div className={`absolute left-[11px] top-6 bottom-[-8px] w-0.5 ${order.status !== 'CANCELLED' ? 'bg-teal-500' : 'bg-slate-200'}`} />
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm bg-teal-500" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-charcoal">Order Confirmed</h4>
                    <span className="text-sm text-slate font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-slate mt-1">Your Order has been placed.<br/>{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                </div>
              </div>

              {order.status === "CANCELLED" ? (
                /* Cancelled Node */
                <div className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm bg-rose-500" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-rose-600">Cancelled</h4>
                      {order.cancelledAt && <span className="text-sm text-slate font-medium">{new Date(order.cancelledAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>}
                    </div>
                    <p className="text-sm text-slate mt-1">Your Order has been cancelled.{order.cancelledAt && <><br/>{new Date(order.cancelledAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(order.cancelledAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</>}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Processing Node */}
                  <div className="relative pl-8 pb-8">
                    <div className={`absolute left-[11px] top-6 bottom-[-8px] w-0.5 ${["SHIPPED", "DELIVERED", "RETURNED"].includes(order.status) ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${["PROCESSING", "SHIPPED", "DELIVERED", "RETURNED"].includes(order.status) ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold ${["PROCESSING", "SHIPPED", "DELIVERED", "RETURNED"].includes(order.status) ? 'text-charcoal' : 'text-slate-400'}`}>Processing</h4>
                      </div>
                      {["PROCESSING", "SHIPPED", "DELIVERED", "RETURNED"].includes(order.status) && (
                        <p className="text-sm text-slate mt-1">Seller has processed your order.</p>
                      )}
                    </div>
                  </div>

                  {/* Shipped Node */}
                  <div className="relative pl-8 pb-8">
                    <div className={`absolute left-[11px] top-6 bottom-[-8px] w-0.5 ${["DELIVERED", "RETURNED"].includes(order.status) ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${["SHIPPED", "DELIVERED", "RETURNED"].includes(order.status) ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold ${["SHIPPED", "DELIVERED", "RETURNED"].includes(order.status) ? 'text-charcoal' : 'text-slate-400'}`}>Shipped</h4>
                        {order.shippedAt && <span className="text-sm text-slate font-medium">{new Date(order.shippedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>}
                      </div>
                      {["SHIPPED", "DELIVERED", "RETURNED"].includes(order.status) && (
                        <div className="text-sm text-slate mt-1 space-y-2">
                          <p>Your item has been shipped.{order.shippedAt && <><br/>{new Date(order.shippedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(order.shippedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</>}</p>
                          
                          {order.waybillGenerated && order.awbNumber && (
                            <div className="bg-white border border-charcoal/10 rounded-lg p-3 inline-block shadow-sm">
                              <p className="text-xs font-bold text-slate uppercase tracking-wider mb-1">Tracking Number</p>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-charcoal font-bold text-base">{order.awbNumber}</span>
                                <Link 
                                  href={`https://www.delhivery.com/track/package/${order.awbNumber}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded hover:bg-teal-100 transition-colors flex items-center gap-1"
                                >
                                  Track Package <ExternalLink size={12} />
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivered Node */}
                  <div className={`relative pl-8 ${order.returnRequest ? 'pb-8' : ''}`}>
                    {order.returnRequest && (
                      <div className={`absolute left-[11px] top-6 bottom-[-8px] w-0.5 bg-teal-500`} />
                    )}
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${["DELIVERED", "RETURN_REQUESTED", "RETURNED"].includes(order.status) || order.returnRequest ? 'bg-teal-500' : 'bg-slate-200'}`} />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold ${["DELIVERED", "RETURN_REQUESTED", "RETURNED"].includes(order.status) || order.returnRequest ? 'text-charcoal' : 'text-slate-400'}`}>Delivered</h4>
                        {order.deliveredAt && <span className="text-sm text-slate font-medium">{new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>}
                      </div>
                      {(["DELIVERED", "RETURN_REQUESTED", "RETURNED"].includes(order.status) || order.returnRequest) && (
                        <p className="text-sm text-slate mt-1">Your item has been delivered.{order.deliveredAt && <><br/>{new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(order.deliveredAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</>}</p>
                      )}
                    </div>
                  </div>

                  {order.returnRequest && (
                    <>
                      {/* Return Requested Node */}
                      <div className={`relative pl-8 ${order.returnRequest.status !== 'PENDING' ? 'pb-8' : ''}`}>
                        {order.returnRequest.status !== 'PENDING' && (
                          <div className={`absolute left-[11px] top-6 bottom-[-8px] w-0.5 bg-teal-500`} />
                        )}
                        <div className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm bg-teal-500" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-charcoal">Return Requested</h4>
                            <span className="text-sm text-slate font-medium">{new Date(order.returnRequest.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>
                          </div>
                          <p className="text-sm text-slate mt-1">Return request initiated for {order.returnRequest.items.length} item(s).<br/>{new Date(order.returnRequest.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(order.returnRequest.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                        </div>
                      </div>

                      {/* Return Final Node */}
                      {order.returnRequest.status === "RETURNED" && (
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm bg-teal-500" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-charcoal">Return Accepted & Refunded</h4>
                              <span className="text-sm text-slate font-medium">{new Date(order.returnRequest.updatedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>
                            </div>
                            <p className="text-sm text-slate mt-1">Your return has been processed and refund is initiated to {order.returnRequest.refundMethod}.<br/>{new Date(order.returnRequest.updatedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(order.returnRequest.updatedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                          </div>
                        </div>
                      )}

                      {order.returnRequest.status === "RETURN_REJECTED" && (
                        <div className="relative pl-8">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm bg-rose-500" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-rose-600">Return Rejected</h4>
                              <span className="text-sm text-slate font-medium">{new Date(order.returnRequest.updatedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })}</span>
                            </div>
                            <p className="text-sm text-slate mt-1">Your return request was rejected.<br/>{new Date(order.returnRequest.updatedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' })} - {new Date(order.returnRequest.updatedAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {!order.waybillGenerated && order.status !== "CANCELLED" && (
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-8 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <Truck size={16} className="text-blue-600" />
              </div>
              <div className="text-sm text-blue-800 leading-relaxed">
                <p className="font-bold mb-0.5">Change your shipping method</p>
                <p>Note: You can upgrade or change your shipping method before the order has been processed for dispatch. Please contact our support team to request a shipping method change.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-charcoal text-lg mb-3">Shipping Address</h3>
                <p className="text-slate bg-slate-50 p-4 rounded-xl border border-charcoal/5 leading-relaxed">
                  {order.shippingAddress}
                </p>
              </div>
              <div>
                <h3 className="font-bold text-charcoal text-lg mb-3">Contact Information</h3>
                <div className="text-slate bg-slate-50 p-4 rounded-xl border border-charcoal/5 space-y-1">
                  <p>{order.email}</p>
                  <p>{order.phone}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-charcoal text-lg mb-3">Order Summary</h3>
              <div className="bg-slate-50 p-6 rounded-xl border border-charcoal/5">
                <div className="space-y-3 mb-4 pb-4 border-b border-charcoal/10 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate">Subtotal</span>
                    <span className="font-bold text-charcoal">₹{order.subtotalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate">Shipping {(order as any).shippingMode === "Express" && <span className="text-teal-600 font-bold">(Express)</span>}</span>
                    <span className="font-bold text-charcoal">{order.shippingAmount === 0 ? "Free" : `₹${order.shippingAmount.toLocaleString()}`}</span>
                  </div>
                  {order.platformFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate">Platform Fee</span>
                      <span className="font-bold text-charcoal">₹{order.platformFeeAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate">GST</span>
                    <span className="font-bold text-charcoal">₹{((order as any).gstAmount || 0).toLocaleString()}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">-₹{order.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate">Payment Method</span>
                    <span className="font-bold text-charcoal">{order.paymentMethod}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-charcoal">Total</span>
                  <span className="font-[family-name:var(--font-playfair)] font-bold text-teal-700 text-xl">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-charcoal text-lg mb-4">Items Ordered</h3>
            <OrderItemsList items={order.items} status={order.status} />
          </div>
          
        </div>
      </main>
    </div>
  )
}
