import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import CancelOrderButton from "./cancel-order-button"

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const order = await prisma.order.findFirst({
    where: { id: resolvedParams.id, userId: session.user.id },
    include: { items: true }
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
      case "PENDING": return <Clock size={24} />
      case "PROCESSING": return <Package size={24} />
      case "SHIPPED": return <Truck size={24} />
      case "DELIVERED": return <CheckCircle size={24} />
      case "CANCELLED": return <XCircle size={24} />
      default: return <Clock size={24} />
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6] pb-20 pt-10 -mx-4 md:-mx-8">
      <main className="flex-grow p-4 md:p-8 w-full">
        
        <Link href="/account" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-800 transition-colors mb-8">
          <ArrowLeft size={18} />
          Back to Account
        </Link>

        <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-charcoal/10 mb-6">
            <div>
              <h1 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-1">
                Order #{order.id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-slate">
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-charcoal/10 rounded-xl">
              <div className="text-teal-600">
                {getStatusIcon(order.status)}
              </div>
              <div>
                <p className="text-xs text-slate font-bold uppercase tracking-wider">Status</p>
                <p className="font-bold text-charcoal">{order.status}</p>
                {order.status === "SHIPPED" && order.shippedAt && (
                  <p className="text-xs text-slate mt-1">On {new Date(order.shippedAt).toLocaleDateString()}</p>
                )}
                {order.status === "DELIVERED" && order.deliveredAt && (
                  <p className="text-xs text-slate mt-1">On {new Date(order.deliveredAt).toLocaleDateString()}</p>
                )}
                {order.status === "CANCELLED" && order.cancelledAt && (
                  <p className="text-xs text-slate mt-1">On {new Date(order.cancelledAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mb-8 flex justify-end gap-3">
            {(order.status === "PENDING" || order.status === "PROCESSING") && (
              <CancelOrderButton orderId={order.id} />
            )}
            {(() => {
              // Return Logic based on Delivered Date
              if (order.status === "DELIVERED" && order.deliveredAt) {
                const returnDaysLimit = 7;
                const deliveryDate = new Date(order.deliveredAt);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - deliveryDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isWithinReturnWindow = diffDays <= returnDaysLimit;
                
                const hasReturnableItems = order.items.some((item: any) => item.isReturnable);

                if (isWithinReturnWindow && hasReturnableItems) {
                  return (
                    <Link href={`/contact?subject=Return+%26+Exchange&orderId=${order.id}`} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-charcoal bg-white border-2 border-charcoal/20 rounded-xl hover:bg-charcoal/5 transition-colors">
                      Return Order
                    </Link>
                  );
                }
              }
              
              if (order.status !== "CANCELLED") {
                return (
                  <Link href={`/contact?orderId=${order.id}`} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                    Contact Us
                  </Link>
                );
              }
              return null;
            })()}
          </div>

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
                    <span className="text-slate">Shipping</span>
                    <span className="font-bold text-charcoal">{order.shippingAmount === 0 ? "Free" : `₹${order.shippingAmount.toLocaleString()}`}</span>
                  </div>
                  {order.platformFeeAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate">Platform Fee</span>
                      <span className="font-bold text-charcoal">₹{order.platformFeeAmount.toLocaleString()}</span>
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
            <div className="divide-y divide-charcoal/5 border border-charcoal/10 rounded-2xl overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 hover:bg-slate-50 transition-colors bg-white">
                  <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-charcoal/5">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.productName} 
                        width={80} 
                        height={80} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-charcoal line-clamp-1">{item.productName}</h4>
                    <p className="text-sm text-slate mt-1">{item.variantName}</p>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <p className="font-bold text-charcoal">₹{item.price.toLocaleString()}</p>
                    <p className="text-sm text-slate font-medium mt-1">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
