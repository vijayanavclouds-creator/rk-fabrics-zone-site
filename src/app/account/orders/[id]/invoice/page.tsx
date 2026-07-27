import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Image from "next/image"
import { AutoPrint, PrintButton } from "./auto-print"

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const order = await prisma.order.findFirst({
    where: { 
      id: resolvedParams.id, 
      ...(session.user.role === "ADMIN" ? {} : { userId: session.user.id }) 
    },
    include: { items: true, user: true }
  })

  if (!order || order.status === "CANCELLED") {
    redirect(`/account/orders/${resolvedParams.id}`)
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-inter)] print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto flex justify-end mb-8 print:hidden">
        <PrintButton />
      </div>

      <div 
        id="invoice-container" 
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-sm border border-slate-200 rounded-2xl print:shadow-none print:border-none print:p-0 print:rounded-none"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-1">
              RK FABRICS ZONE
            </h1>
            <p className="text-slate text-sm">Manufacturer & Wholesaler of Premium Fabrics</p>
            <p className="text-slate text-sm mt-2">Ram Nagar, Sodala</p>
            <p className="text-slate text-sm">Jaipur, Rajasthan 302019</p>
            <p className="text-slate text-sm">India</p>
            <p className="text-slate text-sm mt-1">Email: contact@rkfabricszone.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-charcoal tracking-wider uppercase mb-2">Invoice</h2>
            <p className="text-slate font-medium">Order: <span className="text-charcoal">#{order.id.slice(-8).toUpperCase()}</span></p>
            <p className="text-slate font-medium">Date: <span className="text-charcoal">{new Date(order.createdAt).toLocaleDateString()}</span></p>
            <p className="text-slate font-medium">Payment: <span className="text-charcoal">{order.paymentMethod}</span></p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Billed To</h3>
            <p className="font-bold text-charcoal text-lg mb-1">{order.user.name}</p>
            <p className="text-slate">{order.email}</p>
            <p className="text-slate">{order.phone}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Shipped To</h3>
            <p className="text-slate whitespace-pre-wrap">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 font-bold text-slate text-sm uppercase">Item Description</th>
                <th className="py-3 font-bold text-slate text-sm uppercase text-right">Price</th>
                <th className="py-3 font-bold text-slate text-sm uppercase text-right">Qty</th>
                <th className="py-3 font-bold text-slate text-sm uppercase text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-4">
                    <p className="font-bold text-charcoal">{item.productName}</p>
                    <p className="text-sm text-slate">{item.variantName}</p>
                  </td>
                  <td className="py-4 text-right text-charcoal">₹{item.price.toLocaleString()}</td>
                  <td className="py-4 text-right text-charcoal">{item.quantity}</td>
                  <td className="py-4 text-right font-bold text-charcoal">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-slate">
              <span>Subtotal</span>
              <span className="text-charcoal">₹{order.subtotalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate">
              <span>Shipping</span>
              <span className="text-charcoal">{order.shippingAmount === 0 ? "Free" : `₹${order.shippingAmount.toLocaleString()}`}</span>
            </div>
            {order.platformFeeAmount > 0 && (
              <div className="flex justify-between text-slate">
                <span>Platform Fee</span>
                <span className="text-charcoal">₹{order.platformFeeAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate">
              <span>GST</span>
              <span className="text-charcoal">₹{((order as any).gstAmount || 0).toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{order.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-3 mt-3">
              <span className="font-bold text-charcoal text-lg">Total</span>
              <span className="font-bold text-charcoal text-lg">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate text-sm">
          <p>Thank you for shopping with RK Fabrics Zone!</p>
          <p className="mt-1">If you have any questions concerning this invoice, please contact contact@rkfabricszone.com</p>
        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { 
          body * { visibility: hidden; } 
          #invoice-container, #invoice-container * { visibility: visible; } 
          #invoice-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; } 
          header, footer, nav { display: none !important; } 
        }
      `}} />
      <AutoPrint />
    </div>
  )
}
