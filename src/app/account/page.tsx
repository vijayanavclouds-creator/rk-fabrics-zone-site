import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LogOut, User, LayoutDashboard, ShoppingBag, ArrowRight, Package } from "lucide-react"
import Link from "next/link"
import LogoutButton from "./logout-button"
import { getUserOrders } from "@/actions/order"

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { orders } = await getUserOrders()

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfaf6]">
      <main className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full mt-10">
        <div className="bg-white rounded-3xl border border-charcoal/10 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mb-8 pb-8 border-b border-charcoal/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {session.user.name?.charAt(0).toUpperCase() || <User />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-charcoal">{session.user.name}</h1>
                <p className="text-slate">{session.user.email}</p>
                <div className="mt-1 inline-block px-3 py-1 bg-charcoal/5 text-charcoal text-xs font-bold rounded-full uppercase tracking-wider">
                  {session.user.role} Account
                </div>
              </div>
            </div>
            
            <LogoutButton />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {session.user.role === "ADMIN" && (
              <Link href="/admin" className="group p-6 rounded-2xl border border-teal-600/20 bg-teal-50 hover:bg-teal-100 transition-colors flex items-start gap-4">
                <div className="p-3 bg-teal-600 text-white rounded-xl group-hover:scale-110 transition-transform">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-charcoal text-lg mb-1">Admin Dashboard</h3>
                  <p className="text-sm text-teal-800">Manage products, banners, system settings, and other users.</p>
                </div>
              </Link>
            )}

          </div>

          <div className="mt-12">
            <h2 className="text-xl font-bold text-charcoal mb-6 flex items-center gap-2">
              <ShoppingBag size={20} className="text-teal-600" />
              Order History
            </h2>
            
            {!orders || orders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-charcoal/10">
                <Package size={48} className="mx-auto text-slate mb-4 opacity-50" />
                <h3 className="text-lg font-bold text-charcoal mb-2">No orders yet</h3>
                <p className="text-slate mb-6">When you place orders, they will appear here.</p>
                <Link href="/shop" className="inline-block px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-white border border-charcoal/10 rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-charcoal/10">
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
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <Link href={`/account/orders/${order.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-800">
                          View Details <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex-shrink-0 flex items-center gap-3 bg-slate-50 pr-4 rounded-lg border border-charcoal/5">
                          <div className="w-12 h-12 bg-slate-200 rounded-l-lg overflow-hidden">
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
                            <p className="text-[10px] text-slate">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
