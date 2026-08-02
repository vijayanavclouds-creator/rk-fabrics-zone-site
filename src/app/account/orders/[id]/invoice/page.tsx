import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { AutoPrint, PrintButton } from "./auto-print"
import { getCompanyProfile } from "@/actions/system"

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

  const companyProfile = await getCompanyProfile()

  // Calculate inclusive GST for each item
  const below1000Rate = companyProfile?.gstPercentBelow1000 || 5
  const above1000Rate = companyProfile?.gstPercentAbove1000 || 12

  // GST Invoice typically splits IGST or CGST/SGST. 
  // For simplicity based on user input, we'll show CGST and SGST by halving the applicable rate.
  
  let totalTaxableValue = 0
  let totalCGST = 0
  let totalSGST = 0

  const itemsWithTax = order.items.map((item) => {
    // Determine the rate
    const finalItemPrice = item.price
    const rate = finalItemPrice <= 1000 ? below1000Rate : above1000Rate
    const cgstRate = rate / 2
    const sgstRate = rate / 2

    const grossAmount = item.price * item.quantity
    
    // Reverse calculation for inclusive GST
    // Total = Taxable Value + (Taxable Value * rate / 100)
    // Taxable Value = Total / (1 + rate / 100)
    const taxableValue = grossAmount / (1 + rate / 100)
    const cgstAmount = taxableValue * (cgstRate / 100)
    const sgstAmount = taxableValue * (sgstRate / 100)

    totalTaxableValue += taxableValue
    totalCGST += cgstAmount
    totalSGST += sgstAmount

    return {
      ...item,
      taxableValue,
      cgstRate,
      sgstRate,
      cgstAmount,
      sgstAmount,
      grossAmount,
      rate
    }
  })

  // Shipping & Platform Fee GST (Assumed 18% inclusive)
  const shippingAndFeeGross = order.shippingAmount + order.platformFeeAmount
  let shippingTaxable = 0
  let shippingCGST = 0
  let shippingSGST = 0

  if (shippingAndFeeGross > 0) {
    shippingTaxable = shippingAndFeeGross / 1.18
    shippingCGST = shippingTaxable * 0.09
    shippingSGST = shippingTaxable * 0.09

    totalTaxableValue += shippingTaxable
    totalCGST += shippingCGST
    totalSGST += shippingSGST
  }

  // Adjust discount (Assume discount is proportionately applied to taxable value and tax)
  let discountTaxable = 0
  let discountCGST = 0
  let discountSGST = 0

  if (order.discountAmount > 0) {
    // Find average tax rate of the order
    const averageTaxRate = totalTaxableValue > 0 ? ((totalCGST + totalSGST) / totalTaxableValue) : 0
    discountTaxable = order.discountAmount / (1 + averageTaxRate)
    discountCGST = discountTaxable * (averageTaxRate / 2)
    discountSGST = discountTaxable * (averageTaxRate / 2)

    totalTaxableValue -= discountTaxable
    totalCGST -= discountCGST
    totalSGST -= discountSGST
  }

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-inter)] print:bg-white print:py-0 print:px-0">
      <div className="max-w-5xl mx-auto flex justify-end mb-8 print:hidden">
        <PrintButton />
      </div>

      <div 
        id="invoice-container" 
        className="max-w-5xl mx-auto bg-white p-8 md:p-12 shadow-sm border border-slate-200 rounded-2xl print:shadow-none print:border-none print:p-0 print:rounded-none"
      >
        <div className="flex justify-between items-center border-b border-charcoal pb-4 mb-6">
          <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal">
            Tax Invoice / Bill of Supply
          </h1>
          <div className="text-right">
            <h2 className="text-xl font-bold text-charcoal">RK FABRICS ZONE</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          {/* Seller Info */}
          <div>
            <h3 className="font-bold text-slate uppercase tracking-wider mb-2">Sold By</h3>
            <p className="font-bold text-charcoal">{companyProfile?.ownerName || "RK Fabrics Zone"}</p>
            <p className="whitespace-pre-wrap mt-1">{companyProfile?.address || "Ram Nagar, Sodala\nJaipur, Rajasthan 302019\nIndia"}</p>
            {companyProfile?.gstNumber && (
              <p className="mt-2 font-bold text-charcoal">GSTIN: {companyProfile.gstNumber}</p>
            )}
          </div>

          {/* Invoice Info */}
          <div className="text-right">
            <p className="mb-1"><span className="font-bold text-slate mr-2">Invoice No:</span> <span className="font-mono font-bold text-charcoal">{order.id.slice(-8).toUpperCase()}</span></p>
            <p className="mb-1"><span className="font-bold text-slate mr-2">Order Date:</span> <span className="font-bold text-charcoal">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span></p>
            <p className="mb-1"><span className="font-bold text-slate mr-2">Payment Method:</span> <span className="font-bold text-charcoal">{order.paymentMethod}</span></p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm border-t border-b border-slate-200 py-6">
          <div>
            <h3 className="font-bold text-slate uppercase tracking-wider mb-2">Billed To</h3>
            <p className="font-bold text-charcoal mb-1">{order.user.name}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate uppercase tracking-wider mb-2">Shipped To</h3>
            <p className="whitespace-pre-wrap">{order.shippingAddress}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-3 px-2 font-bold text-slate uppercase">Product</th>
                <th className="py-3 px-2 font-bold text-slate uppercase text-right">Qty</th>
                <th className="py-3 px-2 font-bold text-slate uppercase text-right">Gross Amt</th>
                <th className="py-3 px-2 font-bold text-slate uppercase text-right">Taxable Val</th>
                <th className="py-3 px-2 font-bold text-slate uppercase text-center" colSpan={2}>CGST</th>
                <th className="py-3 px-2 font-bold text-slate uppercase text-center" colSpan={2}>SGST</th>
                <th className="py-3 px-2 font-bold text-slate uppercase text-right">Total</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs">
                <th colSpan={4}></th>
                <th className="py-1 px-2 font-medium text-slate text-center border-l border-slate-200">Rate</th>
                <th className="py-1 px-2 font-medium text-slate text-right">Amount</th>
                <th className="py-1 px-2 font-medium text-slate text-center border-l border-slate-200">Rate</th>
                <th className="py-1 px-2 font-medium text-slate text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itemsWithTax.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 px-2">
                    <p className="font-bold text-charcoal">{item.productName}</p>
                    <p className="text-xs text-slate">{item.variantName}</p>
                  </td>
                  <td className="py-3 px-2 text-right text-charcoal">{item.quantity}</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{item.grossAmount.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{item.taxableValue.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center text-charcoal border-l border-slate-100">{item.cgstRate}%</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{item.cgstAmount.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center text-charcoal border-l border-slate-100">{item.sgstRate}%</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{item.sgstAmount.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-bold text-charcoal">₹{item.grossAmount.toFixed(2)}</td>
                </tr>
              ))}
              
              {/* Shipping & Platform Fee Row */}
              {shippingAndFeeGross > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-2 font-medium text-charcoal">Shipping & Platform Fee</td>
                  <td className="py-3 px-2 text-right text-charcoal">1</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{shippingAndFeeGross.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{shippingTaxable.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center text-charcoal border-l border-slate-100">9%</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{shippingCGST.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center text-charcoal border-l border-slate-100">9%</td>
                  <td className="py-3 px-2 text-right text-charcoal">₹{shippingSGST.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-bold text-charcoal">₹{shippingAndFeeGross.toFixed(2)}</td>
                </tr>
              )}

              {/* Discount Row */}
              {order.discountAmount > 0 && (
                <tr className="border-b border-slate-100 text-emerald-600">
                  <td className="py-3 px-2 font-medium">Coupon Discount</td>
                  <td className="py-3 px-2 text-right">-</td>
                  <td className="py-3 px-2 text-right">-₹{order.discountAmount.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right">-₹{discountTaxable.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center border-l border-slate-100">-</td>
                  <td className="py-3 px-2 text-right">-₹{discountCGST.toFixed(2)}</td>
                  <td className="py-3 px-2 text-center border-l border-slate-100">-</td>
                  <td className="py-3 px-2 text-right">-₹{discountSGST.toFixed(2)}</td>
                  <td className="py-3 px-2 text-right font-bold">-₹{order.discountAmount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td colSpan={3} className="py-4 px-2 font-bold text-right text-slate uppercase">Totals:</td>
                <td className="py-4 px-2 font-bold text-right text-charcoal">₹{totalTaxableValue.toFixed(2)}</td>
                <td className="py-4 px-2 border-l border-slate-200"></td>
                <td className="py-4 px-2 font-bold text-right text-charcoal">₹{totalCGST.toFixed(2)}</td>
                <td className="py-4 px-2 border-l border-slate-200"></td>
                <td className="py-4 px-2 font-bold text-right text-charcoal">₹{totalSGST.toFixed(2)}</td>
                <td className="py-4 px-2 font-bold text-right text-charcoal text-lg">₹{order.totalAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex justify-between items-end mt-16">
          <div className="text-slate text-xs max-w-sm">
            <p className="font-bold uppercase tracking-wider mb-2">Terms & Conditions</p>
            <p>Returns accepted within 7 days of delivery for eligible items. Items must be in original condition with tags attached.</p>
            <p className="mt-2">Contact: {companyProfile?.supportEmail || "contact@rkfabricszone.com"}</p>
          </div>
          
          <div className="text-center flex flex-col items-center">
            <div className="h-16 w-48 border-b border-charcoal/20 mb-2 relative flex items-end justify-center">
              {companyProfile?.signatureUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={companyProfile.signatureUrl} 
                  alt="Authorized Signature" 
                  className="max-h-full max-w-full object-contain mb-1 mix-blend-multiply" 
                />
              )}
            </div>
            <p className="text-sm font-bold text-charcoal uppercase tracking-wider">Authorized Signature</p>
            <p className="text-xs text-slate mt-1">For {companyProfile?.ownerName || "RK Fabrics Zone"}</p>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { 
          body * { visibility: hidden; } 
          #invoice-container, #invoice-container * { visibility: visible; } 
          #invoice-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; } 
          header, footer, nav { display: none !important; } 
          @page { size: auto;  margin: 0mm; }
        }
      `}} />
      <AutoPrint />
    </div>
  )
}
