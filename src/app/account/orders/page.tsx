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
        Order History
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
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white border border-charcoal/10 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-charcoal/10">
                <div>
                  <p className="text-xs text-slate font-bold uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="text-charcoal font-bold">{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-slate font-bold uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="text-charcoal font-bold">₹{order.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate font-bold uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'CANCELLED' ? 'bg-error/10 text-error' :
                    order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl hover:bg-teal-100 transition-colors">
                    View Details <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex-shrink-0 flex items-center gap-3 bg-slate-50 pr-4 rounded-xl border border-charcoal/5">
                    <div className="w-16 h-16 bg-slate-200 rounded-l-xl overflow-hidden relative">
                      {item.image ? (
                        <Image src={item.image} alt={item.productName} fill className="object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-charcoal line-clamp-1 max-w-[180px]">{item.productName}</p>
                      <p className="text-xs text-slate">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
