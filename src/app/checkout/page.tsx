"use client"

import { useState } from "react"
import { useCartStore } from "@/store"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createOrder } from "@/actions/order"
import { toast } from "sonner"
import Image from "next/image"
import { ArrowLeft, ArrowRight, CreditCard, Banknote, ShieldCheck } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotal, getSubtotal, getShipping, clearCart } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  // Redirect if cart is empty
  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] py-20 px-4 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-4">Your Cart is Empty</h1>
        <p className="text-slate mb-8 text-center max-w-md">Looks like you haven't added any fabrics to your cart yet. Let's fix that!</p>
        <Link href="/shop" className="px-8 py-4 bg-teal-600 text-white font-bold rounded-xl shadow-neo-btn hover:bg-teal-700 transition-colors">
          Explore Fabrics
        </Link>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error("Please login to place an order", {
        action: { label: "Login", onClick: () => router.push("/login?from=/checkout") }
      })
      return
    }

    setLoading(true)

    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`
    
    const orderData = {
      items,
      totalAmount: getTotal(),
      shippingAmount: getShipping(),
      subtotalAmount: getSubtotal(),
      shippingAddress: fullAddress,
      phone: formData.phone,
      email: formData.email,
      paymentMethod,
    }

    // In a real app, if paymentMethod is CARD, we would integrate Razorpay/Stripe here.
    // For this mock flow, we just assume payment is successful and place the order.
    
    if (paymentMethod === "CARD") {
      toast.loading("Processing secure mock payment...")
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    const res = await createOrder(orderData)
    
    if (res.success) {
      clearCart()
      toast.dismiss()
      router.push(`/checkout/success?orderId=${res.orderId}`)
    } else {
      toast.dismiss()
      toast.error(res.error || "Failed to place order")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <Link href="/shop" className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-800 transition-colors mb-8">
          <ArrowLeft size={18} />
          Back to Shopping
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column - Forms */}
          <div className="flex-1 space-y-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm">
              <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">Shipping Information</h2>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-charcoal mb-2">First Name</label>
                    <input type="text" name="firstName" required onChange={handleInputChange} value={formData.firstName} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-charcoal mb-2">Last Name</label>
                    <input type="text" name="lastName" required onChange={handleInputChange} value={formData.lastName} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-charcoal mb-2">Email Address</label>
                    <input type="email" name="email" required onChange={handleInputChange} value={formData.email} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-charcoal mb-2">Phone Number</label>
                    <input type="tel" name="phone" required onChange={handleInputChange} value={formData.phone} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal mb-2">Full Address</label>
                  <input type="text" name="address" required onChange={handleInputChange} value={formData.address} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" placeholder="House no, Building, Street, Area" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-charcoal mb-2">City</label>
                    <input type="text" name="city" required onChange={handleInputChange} value={formData.city} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-charcoal mb-2">State</label>
                    <input type="text" name="state" required onChange={handleInputChange} value={formData.state} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-charcoal mb-2">PIN Code</label>
                    <input type="text" name="pincode" required onChange={handleInputChange} value={formData.pincode} className="w-full px-4 py-3 rounded-xl border border-charcoal/20 bg-transparent focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all text-charcoal" />
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm">
              <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "CARD" ? "border-teal-600 bg-teal-50/50" : "border-charcoal/10 bg-white hover:border-charcoal/20"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="CARD" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} className="w-5 h-5 text-teal-600 focus:ring-teal-600 border-gray-300" />
                      <div className="font-bold text-charcoal">Credit / Debit Card</div>
                    </div>
                    <CreditCard className="text-slate" size={24} />
                  </div>
                  {paymentMethod === "CARD" && (
                    <div className="mt-4 pl-8 text-sm text-slate">
                      <p className="flex items-center gap-2"><ShieldCheck size={16} className="text-teal-600" /> Secure mock payment gateway enabled for testing.</p>
                    </div>
                  )}
                </label>

                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-teal-600 bg-teal-50/50" : "border-charcoal/10 bg-white hover:border-charcoal/20"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="w-5 h-5 text-teal-600 focus:ring-teal-600 border-gray-300" />
                      <div className="font-bold text-charcoal">Cash on Delivery (COD)</div>
                    </div>
                    <Banknote className="text-slate" size={24} />
                  </div>
                  {paymentMethod === "COD" && (
                    <div className="mt-4 pl-8 text-sm text-slate">
                      <p>Pay with cash upon delivery.</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm sticky top-32">
              <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.variant.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image 
                        src={
                          (typeof item.variant.images?.[0] === 'string' ? item.variant.images[0] : (item.variant.images?.[0] as any)?.url) 
                          || item.product.images?.[0]?.url 
                          || "/placeholder.jpg"
                        } 
                        alt={item.product.name} 
                        width={64} 
                        height={64} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-charcoal text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-slate mt-0.5">{item.variant.color} - {item.variant.size}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-charcoal">Qty: {item.quantity}</span>
                        <span className="text-sm font-bold text-teal-600">₹{(item.variant.salePrice || item.variant.price) * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-b border-charcoal/10 mb-6">
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm font-bold">Subtotal</span>
                  <span className="font-bold">₹{getSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm font-bold">Shipping</span>
                  <span className="font-bold">{getShipping() === 0 ? <span className="text-teal-600">Free</span> : `₹${getShipping()}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-charcoal">Total</span>
                <span className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal">
                  ₹{getTotal().toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-neo-btn hover:bg-teal-700 hover:shadow-neo-pressed transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing Order..." : `Pay ₹${getTotal().toLocaleString()}`}
                {!loading && <ArrowRight size={18} />}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate">
                <ShieldCheck size={14} className="text-teal-600" />
                Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
