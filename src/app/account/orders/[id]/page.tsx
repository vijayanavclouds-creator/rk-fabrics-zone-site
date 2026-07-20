import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id, userId: session.user.id },
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
    <div className="min-h-screen flex flex-col bg-[#fdfaf6] pb-20 pt-10">
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        
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
              </div>
            </div>
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
                    <span className="font-bold text-charcoal">{order.shippingAmount === 0 ? "Free" : `₹${order.shippingAmount}`}</span>
                  </div>
                  <div className="flex justify-between">
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
