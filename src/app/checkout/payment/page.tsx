"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createOrder } from "@/actions/order"
import { initiatePhonePePayment } from "@/actions/payment"
import { toast } from "sonner"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Banknote, Smartphone, ShieldCheck, AlertCircle, X } from "lucide-react"
import Link from "next/link"
import { validateCoupon } from "@/actions/coupon"

import { useCheckoutStore } from "@/store/checkout"

export default function CheckoutPaymentPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, getTotal, getSubtotal, getShipping, getPlatformFee, clearCart, gstRates } = useCartStore()
  const { selectedAddress, setAddress, clearCheckout } = useCheckoutStore()

  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [mounted, setMounted] = useState(false)
  const [fetchingAddress, setFetchingAddress] = useState(false)
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [validatingPromo, setValidatingPromo] = useState(false)
  const { couponCode, discountAmount, applyCoupon, removeCoupon } = useCartStore()

  const totalMrp = items.reduce((acc, item) => acc + (item.variant.price || item.product.basePrice) * item.quantity, 0)
  const productDiscount = totalMrp - getSubtotal()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function checkAddress() {
      if (!mounted || status === "loading") return;

      if (session) {
        setFetchingAddress(true)
        try {
          const { getUserAddresses } = await import("@/actions/address")
          const addresses = await getUserAddresses()
          
          if (!selectedAddress) {
            router.replace("/checkout/address")
          } else {
            // Verify selectedAddress still exists if it's not temporary
            if (!selectedAddress.id?.startsWith("temp_")) {
              const exists = addresses.find((a: any) => a.id === selectedAddress.id)
              if (!exists) {
                toast.error("Your selected address was deleted. Please select a new one.")
                clearCheckout()
                router.replace("/checkout/address")
              }
            }
          }
        } catch (e) {
          if (!selectedAddress) router.replace("/checkout/address")
        } finally {
          setFetchingAddress(false)
        }
      } else {
        if (!selectedAddress) router.replace("/checkout/address")
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

  const isValidPhone = (phone?: string | null) => {
    if (!phone) return false
    const digits = phone.replace(/\D/g, "")
    // Valid Indian mobile number: 10 digits, starts with 6, 7, 8, or 9
    return /^[6-9]\d{9}$/.test(digits)
  }

  const hasValidAddressPhone = isValidPhone(selectedAddress.phone)
  const hasValidProfilePhone = isValidPhone(session?.user?.phone)

  const proceedWithOrder = async () => {
    setLoading(true)

    const fullName = `${selectedAddress.firstName} ${selectedAddress.lastName}`.trim()
    const namePart = fullName ? `${fullName}, ` : ""
    const phonePart = selectedAddress.phone ? `${selectedAddress.phone}, ` : ""
    const fullAddress = `${namePart}${phonePart}${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
    
    const orderData = {
      items,
      totalAmount: getTotal(),
      shippingAmount: getShipping(),
      platformFeeAmount: getPlatformFee(),
      subtotalAmount: getSubtotal(),
      shippingAddress: fullAddress,
      addressDetails: selectedAddress, // passing for strict validation
      phone: selectedAddress.phone,
      email: session!.user.email,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error("Please login to place an order", {
        action: { label: "Login", onClick: () => router.push("/login?from=/checkout") }
      })
      return
    }

    if (!hasValidAddressPhone && !hasValidProfilePhone) {
      toast.error(
        <span>
          A valid mobile number is required to proceed with this order.{" "}
          <button 
            type="button" 
            onClick={() => router.push("/account/profile?focus=phone&callbackUrl=/checkout/payment")} 
            className="font-bold underline cursor-pointer hover:opacity-80"
          >
            Update Profile
          </button>
        </span>, 
        { duration: 8000 }
      )
      return
    }

    await proceedWithOrder()
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
              <p className="text-sm font-medium text-charcoal mt-2">Ph: {selectedAddress.phone || "N/A"}</p>
              
              {selectedAddress.id?.startsWith("temp_") && (
                <div className="mt-6 pt-4 border-t border-charcoal/5 flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="saveAddressCheckbox" 
                    checked={saveAddressForFuture} 
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      if (!checked || !selectedAddress || !selectedAddress.id?.startsWith("temp_")) return;
                      setSaveAddressForFuture(true);
                      const toastId = toast.loading("Saving address...");
                      try {
                        const { saveAddress } = await import("@/actions/address")
                        const res = await saveAddress({
                          firstName: selectedAddress.firstName,
                          lastName: selectedAddress.lastName,
                          phone: selectedAddress.phone || "0000000000",
                          address: selectedAddress.address,
                          city: selectedAddress.city,
                          state: selectedAddress.state,
                          pincode: selectedAddress.pincode,
                          isDefault: false
                        });
                        if (res.success && res.address) {
                          setAddress(res.address);
                          toast.success("Address saved successfully!", { id: toastId });
                        } else {
                          setSaveAddressForFuture(false);
                          toast.error("Failed to save address", { id: toastId });
                        }
                      } catch (e) {
                        setSaveAddressForFuture(false);
                        toast.error("Failed to save address", { id: toastId });
                      }
                    }} 
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-600"
                  />
                  <label htmlFor="saveAddressCheckbox" className="text-sm font-medium text-charcoal cursor-pointer">
                    Save this address for future reference
                  </label>
                </div>
              )}
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
                {items.map((item) => {
                  const price = item.variant.salePrice || item.product.salePrice || item.variant.price || item.product.basePrice;
                  const originalPrice = item.variant.price || item.product.basePrice;
                  const hasDiscount = originalPrice > price;
                  return (
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
                      <div className="flex items-end justify-between mt-1">
                        <span className="text-xs font-bold text-charcoal">Qty: {item.quantity}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-teal-600">₹{price * item.quantity}</span>
                          {hasDiscount && (
                            <span className="text-[10px] text-slate line-through">₹{originalPrice * item.quantity}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
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
                  <span className="text-sm font-bold">Total MRP ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="font-bold">₹{totalMrp.toLocaleString()}</span>
                </div>
                {productDiscount > 0 && (
                  <div className="flex justify-between text-teal-700">
                    <span className="text-sm font-bold">Discount on MRP</span>
                    <span className="font-bold">-₹{productDiscount.toLocaleString()}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-teal-700">
                    <span className="text-sm font-bold">Coupon Discount ({couponCode})</span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm font-bold">Platform Fee ({gstRates?.platformFeePercent ?? 2}%)</span>
                  <span className="font-bold">₹{getPlatformFee().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm font-bold">Shipping</span>
                  <span className="font-bold">{getShipping() === 0 ? <span className="text-teal-600">Free</span> : `₹${getShipping()}`}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm font-bold">GST</span>
                  <span className="font-bold">₹{useCartStore.getState().getGSTAmount().toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-charcoal">Total</span>
                <span className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal">
                  ₹{getTotal().toLocaleString()}
                </span>
              </div>

              {!hasValidAddressPhone && hasValidProfilePhone && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  <AlertCircle size={16} className="inline mr-2 -mt-1" />
                  You have an invalid mobile number in your selected address.{" "}
                  <button type="button" onClick={() => router.push(`/checkout/address?edit=${selectedAddress?.id}`)} className="font-bold underline text-amber-900 hover:text-amber-700">Click here to update</button>
                </div>
              )}
              
              {!hasValidProfilePhone && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                  <AlertCircle size={16} className="inline mr-2 -mt-1" />
                  You do not have a valid mobile number in your profile.{" "}
                  <button type="button" onClick={() => router.push("/account/profile?focus=phone&callbackUrl=/checkout/payment")} className="font-bold underline text-amber-900 hover:text-amber-700">Click here to update</button>
                </div>
              )}

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
