"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createOrder } from "@/actions/order"
import { initiatePhonePePayment } from "@/actions/payment"
import { toast } from "sonner"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Banknote, Smartphone, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { validateCoupon } from "@/actions/coupon"

import { useCheckoutStore } from "@/store/checkout"

export default function CheckoutPaymentPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, getTotal, getSubtotal, getShipping, getPlatformFee, clearCart } = useCartStore()
  const { selectedAddress, setAddress, clearCheckout } = useCheckoutStore()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [mounted, setMounted] = useState(false)
  const [fetchingAddress, setFetchingAddress] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [validatingPromo, setValidatingPromo] = useState(false)
  const { couponCode, discountAmount, applyCoupon, removeCoupon } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function checkAddress() {
      if (!mounted || status === "loading") return;

      if (!selectedAddress) {
        if (session) {
          setFetchingAddress(true)
          try {
            const { getUserAddresses } = await import("@/actions/address")
            const addresses = await getUserAddresses()
            
            if (addresses && addresses.length > 0) {
              const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0]
              setAddress(defaultAddr)
            } else {
              router.push("/checkout/address")
            }
          } catch (e) {
            router.push("/checkout/address")
          } finally {
            setFetchingAddress(false)
          }
        } else {
          router.push("/checkout/address")
        }
      }
    }
    
    checkAddress()
  }, [mounted, selectedAddress, router, setAddress, session, status])

  if (!mounted || fetchingAddress) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!selectedAddress) {
    return null 
  }

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

  if (!selectedAddress) {
    return null // Will redirect in useEffect
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

    const fullAddress = `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
    
    const orderData = {
      items,
      totalAmount: getTotal(),
      shippingAmount: getShipping(),
      platformFeeAmount: getPlatformFee(),
      subtotalAmount: getSubtotal(),
      shippingAddress: fullAddress,
      phone: selectedAddress.phone,
      email: session.user.email,
      paymentMethod,
      couponCode,
      discountAmount,
    }

    // In a real app, if paymentMethod is CARD, we would integrate Razorpay/Stripe here.
    // For this mock flow, we just assume payment is successful and place the order.
    
    if (paymentMethod === "PHONEPE") {
      toast.loading("Initiating secure payment...")
    }

    const res = await createOrder(orderData)
    
    if (res.success && res.orderId) {
      if (paymentMethod === "PHONEPE") {
        const paymentRes = await initiatePhonePePayment(res.orderId)
        if (paymentRes.success && paymentRes.redirectUrl) {
          toast.dismiss()
          // Redirect the user to PhonePe checkout page
          window.location.href = paymentRes.redirectUrl
          setTimeout(() => {
            clearCart()
            clearCheckout()
          }, 1000)
        } else {
          toast.dismiss()
          toast.error(paymentRes.error || "Failed to initiate payment gateway")
          setLoading(false)
        }
      } else {
        toast.dismiss()
        router.push(`/checkout/success?orderId=${res.orderId}`)
        // Delay clearing state to ensure navigation completes first without unmounting the view
        setTimeout(() => {
          clearCart()
          clearCheckout()
        }, 1000)
      }
    } else {
      toast.dismiss()
      toast.error(res.error || "Failed to place order")
      setLoading(false)
    }
  }

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    
    setValidatingPromo(true)
    const res = await validateCoupon(promoCodeInput.trim())
    setValidatingPromo(false)
    
    if (res.success && res.coupon) {
      toast.success("Promo code applied!")
      let discount = 0
      if (res.coupon.discountType === "PERCENTAGE") {
        const subtotal = getSubtotal()
        discount = (subtotal * res.coupon.discountValue) / 100
      } else {
        discount = res.coupon.discountValue
      }
      applyCoupon(res.coupon.code, discount)
      setPromoCodeInput("")
    } else {
      toast.error(res.error || "Invalid promo code")
    }
  }

  return (
    <>
      <Link href="/cart" className="hidden md:inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-800 transition-colors mb-8">
        <ArrowLeft size={18} />
        Back to Cart
      </Link>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* Left Column (Contents on Mobile, Flex Column on Desktop) */}
          <div className="contents lg:flex lg:flex-col lg:flex-1 lg:gap-8">
            
            {/* Deliver To - Always First */}
            <div className="order-1 lg:order-none bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-[family-name:var(--font-playfair)] font-bold text-charcoal">Deliver To:</h2>
                <Link href="/checkout/address" className="text-sm font-bold text-teal-600 hover:text-teal-800">Change</Link>
              </div>
              <p className="font-bold text-charcoal">{selectedAddress.firstName} {selectedAddress.lastName}</p>
              <p className="text-sm text-slate mt-1">{selectedAddress.address}</p>
              <p className="text-sm text-slate">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
              <p className="text-sm font-medium text-charcoal mt-2">Ph: {selectedAddress.phone}</p>
            </div>

            {/* Payment Method - Third on Mobile, Second in Left Column on Desktop */}
            <div className="order-3 lg:order-none bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm w-full">
              <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "PHONEPE" ? "border-teal-600 bg-teal-50/50" : "border-charcoal/10 bg-white hover:border-charcoal/20"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="PHONEPE" checked={paymentMethod === "PHONEPE"} onChange={() => setPaymentMethod("PHONEPE")} className="w-5 h-5 text-teal-600 focus:ring-teal-600 border-gray-300" />
                      <div className="font-bold text-charcoal">PhonePe (UPI, Cards, NetBanking)</div>
                    </div>
                    <Smartphone className="text-slate" size={24} />
                  </div>
                  {paymentMethod === "PHONEPE" && (
                    <div className="mt-4 pl-8 text-sm text-slate">
                      <p>You will be redirected securely to PhonePe to complete your purchase.</p>
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

          {/* Right Column - Order Summary (Second on Mobile, Right Column on Desktop) */}
          <div className="order-2 lg:order-none w-full lg:flex-1">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-charcoal/10 shadow-sm sticky top-32">
              <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.variant.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image 
                        src={
                          (typeof item.variant.images?.[0] === 'string' ? item.variant.images[0] : (item.variant.images?.[0] as any)?.url) 
                          || item.product.images?.find((img) => img.isPrimary)?.url
                          || item.product.images?.[0]?.url 
                          || "/placeholder.jpg"
                        } 
                        alt={item.product.name} 
                        width={64} 
                        height={80} 
                        className="w-full h-full object-cover object-top"
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

              {/* Promo Code Section */}
              <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-charcoal/10">
                {couponCode ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-teal-700">Promo Applied: {couponCode}</p>
                      <p className="text-xs text-slate">You saved ₹{discountAmount.toLocaleString()}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeCoupon()}
                      className="text-xs font-bold text-rose hover:text-rose-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Enter Promo Code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 p-3 rounded-lg border border-charcoal/20 bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 text-sm font-bold text-charcoal uppercase"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={validatingPromo || !promoCodeInput.trim()}
                      className="px-4 py-3 bg-charcoal text-white text-sm font-bold rounded-lg hover:bg-black transition-all disabled:opacity-50"
                    >
                      {validatingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                )}
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
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm font-bold">Platform Fee (2%)</span>
                  <span className="font-bold">₹{getPlatformFee().toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-teal-700">
                    <span className="text-sm font-bold">Discount ({couponCode})</span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-charcoal">Total</span>
                <span className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal">
                  ₹{getTotal().toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
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
    </>
  )
}
