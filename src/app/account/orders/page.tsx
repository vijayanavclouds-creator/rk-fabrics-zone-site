import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingBag, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import { getUserOrders } from "@/actions/order"
import Image from "next/image"

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { orders } = await getUserOrders()

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6 flex items-center gap-3">
        <ShoppingBag size={24} className="text-teal-600" />
        My Orders
      </h2>
      
      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-charcoal/10">
          <Package size={48} className="mx-auto text-slate mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-charcoal mb-2">No orders yet</h3>
          <p className="text-slate mb-8">When you place orders, they will appear here.</p>
          <Link href="/shop" className="inline-block px-8 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col border border-charcoal/10 rounded-2xl overflow-hidden bg-white">
          {orders.map((order: any, index: number) => (
            <Link 
              href={`/account/orders/${order.id}`}
              key={order.id} 
              className={`flex flex-col md:flex-row md:items-center justify-between p-5 hover:bg-slate-50 transition-colors group ${
                index !== orders.length - 1 ? "border-b border-charcoal/10" : ""
              }`}
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center">
                {/* Order ID */}
                <div>
                  <p className="text-xs text-slate font-medium mb-1">Order ID</p>
                  <p className="font-bold text-charcoal truncate">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                
                {/* Date */}
                <div>
                  <p className="text-xs text-slate font-medium mb-1">Placed On</p>
                  <p className="text-sm text-charcoal font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-xs text-slate font-medium mb-1">Total Amount</p>
                  <p className="text-sm font-bold text-charcoal">₹{order.totalAmount.toLocaleString()}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-slate font-medium mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'CANCELLED' ? 'bg-error/10 text-error' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              {/* Chevron */}
              <div className="hidden md:flex flex-shrink-0 ml-4 text-charcoal/30 group-hover:text-teal-600 transition-colors">
                <ArrowRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
