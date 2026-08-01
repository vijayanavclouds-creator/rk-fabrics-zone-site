import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingBag, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"
import { getUserOrders } from "@/actions/order"
import Image from "next/image"

export const metadata: Metadata = {
  title: "My Orders | RK Fabrics",
  description: "View and track your RK Fabrics orders.",
};

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { orders } = await getUserOrders()

  return (
    <div className="-mx-4 md:mx-0 bg-white md:rounded-3xl border-y md:border-x border-charcoal/10 p-4 sm:p-6 md:p-8 shadow-sm min-h-screen md:min-h-0">
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
        <div className="flex flex-col gap-4">
          {orders.map((order: any) => (
            <Link 
              href={`/account/orders/${order.id}`}
              key={order.id} 
              className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-charcoal/10 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-600/30 transition-all group"
            >
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4 md:gap-6 items-center">
                {/* Order ID */}
                <div>
                  <p className="text-[11px] text-slate font-medium mb-1 uppercase tracking-wider">Order ID</p>
                  <p className="font-bold text-charcoal truncate text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                
                {/* Date */}
                <div>
                  <p className="text-[11px] text-slate font-medium mb-1 uppercase tracking-wider">Placed On</p>
                  <p className="text-sm text-charcoal font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-[11px] text-slate font-medium mb-1 uppercase tracking-wider">Total Amount</p>
                  <p className="text-sm font-bold text-charcoal">₹{order.totalAmount.toLocaleString()}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-[11px] text-slate font-medium mb-1 uppercase tracking-wider">Status</p>
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
