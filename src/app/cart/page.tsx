"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, Tag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, getShipping, getTotal, getItemCount } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "RK30" || couponCode.toUpperCase() === "WELCOME10") {
      setCouponApplied(true);
      toast.success("Coupon applied! 🎉", { description: "10% discount activated" });
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    if (!session) {
      router.push("/login?callbackUrl=/checkout/payment");
    } else {
      router.push("/checkout/payment");
    }
  };

 const suggestedProducts = products.filter(
 (p) => !items.some((item) => item.product.id === p.id)
 ).slice(0, 4);

 if (items.length === 0) {
 return (
 <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-16">
 <div className="text-center max-w-md mx-auto">
 <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
 <ShoppingBag size={40} className="text-teal-300" />
 </div>
 <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal mb-3">
 Your Cart is Empty
 </h1>
 <p className="text-slate mb-8">
 Looks like you haven&apos;t added any fabrics to your cart yet. Explore our collection!
 </p>
 <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
 Start Shopping <ArrowRight size={16} />
 </Link>
 </div>

 {/* Suggested Products */}
 <div className="mt-16">
 <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal mb-6 text-center">
 Popular Picks For You
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
 {suggestedProducts.map((p, i) => (
 <ProductCard key={p.id} product={p} index={i} />
 ))}
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-charcoal ">
 Shopping Cart
 </h1>
 <p className="text-sm text-slate mt-1">
 {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in your cart
 </p>
 </div>
 <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm text-teal-600 font-medium hover:underline">
 <ArrowLeft size={14} /> Continue Shopping
 </Link>
 </div>

 <div className="grid md:grid-cols-3 gap-8">
 {/* Cart Items */}
 <div className="md:col-span-2 space-y-4">
 {items.map((item) => {
 const price = item.variant.salePrice || item.variant.price;
 return (
 <motion.div
 key={item.variant.id}
 layout
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, x: -100 }}
 className="flex gap-4 p-4 md:p-5 bg-white rounded-2xl border border-charcoal/5"
 >
 {/* Image */}
 <div className="w-20 h-28 md:w-24 md:h-32 bg-cream-dark rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative border border-charcoal/5">
   <Image
     src={
       (typeof item.variant.images?.[0] === 'string' ? item.variant.images[0] : (item.variant.images?.[0] as any)?.url) 
       || item.product.images?.find((img) => img.isPrimary)?.url
       || item.product.images?.[0]?.url 
       || "/placeholder.jpg"
     }
     alt={item.product.name}
     fill
     className="object-cover object-top"
   />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <div>
 <Link
 href={`/product/${item.product.slug}`}
 className="font-[family-name:var(--font-playfair)] text-sm md:text-base font-semibold text-charcoal hover:text-teal-600 transition-colors line-clamp-2"
 >
 {item.product.name}
 </Link>
 <p className="text-xs text-slate mt-1">
 {item.variant.color} • {item.variant.size} • {item.product.fabric}
 </p>
 </div>
 <button
 onClick={() => {
 removeItem(item.variant.id);
 toast("Item removed from cart");
 }}
 className="p-2 text-slate hover:text-error hover:bg-error/5 rounded-lg transition-colors shrink-0"
 >
 <Trash2 size={16} />
 </button>
 </div>

 <div className="flex items-center justify-between mt-4">
 {/* Quantity */}
 <div className="flex items-center border border-charcoal/10 rounded-xl">
 <button
 onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
 className="w-9 h-9 flex items-center justify-center text-slate hover:text-charcoal :text-dark-text transition-colors"
 >
 <Minus size={14} />
 </button>
 <span className="w-10 text-center text-sm font-semibold text-charcoal ">
 {item.quantity}
 </span>
 <button
 onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
 className="w-9 h-9 flex items-center justify-center text-slate hover:text-charcoal :text-dark-text transition-colors"
 >
 <Plus size={14} />
 </button>
 </div>

 {/* Price */}
 <div className="text-right">
 <p className="text-base md:text-lg font-bold text-charcoal ">
 {formatPrice(price * item.quantity)}
 </p>
 {item.quantity > 1 && (
 <p className="text-xs text-slate ">
 {formatPrice(price)} each
 </p>
 )}
 </div>
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>

 {/* Order Summary */}
 <div className="md:col-span-1">
 <div className="sticky top-28 bg-white rounded-2xl border border-charcoal/5 p-6 space-y-5">
 <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal ">
 Order Summary
 </h2>

 {/* Coupon */}
 <div className="flex gap-2">
 <div className="flex-1 relative">
 <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
 <input
 type="text"
 value={couponCode}
 onChange={(e) => setCouponCode(e.target.value)}
 placeholder="Coupon code"
 className="w-full pl-9 pr-3 py-2.5 text-sm bg-cream border border-charcoal/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-charcoal placeholder:text-slate/50"
 />
 </div>
 <button
 onClick={handleApplyCoupon}
 className="px-4 py-2.5 text-sm font-semibold text-teal-600 border border-teal-600/20 rounded-xl hover:bg-teal-50 :bg-teal-900/10 transition-colors"
 >
 Apply
 </button>
 </div>
 {couponApplied && (
 <p className="text-xs text-success font-medium">✅ Coupon &quot;RK30&quot; applied — 10% off!</p>
 )}

 {/* Breakdown */}
 <div className="space-y-3 text-sm">
 <div className="flex justify-between text-slate ">
 <span>Subtotal ({getItemCount()} items)</span>
 <span>{formatPrice(subtotal)}</span>
 </div>
 {couponApplied && (
 <div className="flex justify-between text-success">
 <span>Coupon Discount</span>
 <span>-{formatPrice(discount)}</span>
 </div>
 )}
 <div className="flex justify-between text-slate ">
 <span>Shipping</span>
 <span className={shipping === 0 ? "text-success font-medium" : ""}>
 {shipping === 0 ? "FREE 🎉" : formatPrice(shipping)}
 </span>
 </div>
 <div className="h-px bg-charcoal/10 " />
 <div className="flex justify-between text-lg font-bold text-charcoal ">
 <span>Total</span>
 <span className="text-teal-600 ">{formatPrice(total)}</span>
 </div>
 </div>

 {/* Free Shipping */}
  {shipping > 0 && (
  <div className="flex items-center gap-2 text-xs text-teal-700/80 bg-teal-50/50 p-3 rounded-xl">
  <Truck size={14} />
  <span>Add <strong>{formatPrice(999 - subtotal)}</strong> more for FREE shipping</span>
  </div>
  )}

  <button
  onClick={handleCheckout}
  className="btn-primary w-full flex items-center justify-center gap-2 text-center py-4"
  >
  Proceed to Checkout <ArrowRight size={16} />
  </button>

  {/* Payment Icons */}
 <div className="flex items-center justify-center gap-3 text-xs text-slate pt-2">
 <span>UPI</span>•<span>Cards</span>•<span>Net Banking</span>•<span>COD</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
