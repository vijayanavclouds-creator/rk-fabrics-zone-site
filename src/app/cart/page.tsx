"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck, Tag, ArrowLeft, Star } from "lucide-react";
import { useCartStore } from "@/store";
import { formatPrice, cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { products } from "@/lib/data";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validateCartStock } from "@/actions/cart";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, getShipping, getTotal, getItemCount, getPlatformFee } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const subtotal = getSubtotal();
  const shipping = getShipping();
  
  const totalMrp = items.reduce((acc, item) => {
    const originalPrice = item.variant.price || item.product.basePrice;
    return acc + (originalPrice * item.quantity);
  }, 0);
  const productDiscount = totalMrp - subtotal;
  const platformFee = getPlatformFee();

  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + shipping + platformFee - discount;

  const [outOfStockMap, setOutOfStockMap] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (items.length === 0) {
      setOutOfStockMap({});
      return;
    }
    
    const checkStock = async () => {
      const res = await validateCartStock(items);
      if (res.success && res.outOfStockItems) {
        const map = res.outOfStockItems.reduce((acc: Record<string, number>, curr: any) => {
          acc[curr.variantId] = curr.available;
          return acc;
        }, {});
        setOutOfStockMap(map);
      }
    };
    checkStock();
  }, [items]);

  const hasOutOfStockItems = Object.keys(outOfStockMap).length > 0;

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

  // Smarter recommendation logic based on categories in cart
  const cartCategories = new Set<string>();
  items.forEach(item => {
    try {
      const cats = JSON.parse(item.product.category);
      if (Array.isArray(cats)) cats.forEach(c => cartCategories.add(c));
    } catch {
      cartCategories.add(item.product.category);
    }
  });

  let suggested = products.filter(p => {
    // Don't recommend items already in cart
    if (items.some(item => item.product.id === p.id)) return false; 
    
    // Check for category match if there are items in the cart
    if (cartCategories.size > 0) {
      try {
        const cats = JSON.parse(p.category);
        if (Array.isArray(cats)) return cats.some(c => cartCategories.has(c));
      } catch {
        return cartCategories.has(p.category);
      }
    }
    return false;
  });

  // If we don't have enough matches (or cart is empty), fallback to bestsellers/general products
  if (suggested.length < 4) {
    const fallbacks = products.filter(p => 
      !items.some(item => item.product.id === p.id) && 
      !suggested.some(s => s.id === p.id)
    );
    // Prioritize bestsellers in fallbacks
    fallbacks.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    suggested = [...suggested, ...fallbacks];
  }

  const suggestedProducts = suggested.slice(0, 4);

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

  <div className="mt-8 bg-white rounded-3xl border border-charcoal/10 shadow-sm p-4 sm:p-6 lg:p-10">
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-0">
      {/* Cart Items */}
      <div className="lg:col-span-3 space-y-4 lg:pr-8 lg:border-r lg:border-charcoal/10">
    {items.map((item) => {
      const price = item.variant.salePrice || item.product.salePrice || item.variant.price || item.product.basePrice;
      const originalPrice = item.variant.price || item.product.basePrice;
      const hasDiscount = originalPrice > price;
      const isOutOfStock = outOfStockMap[item.variant.id] !== undefined;
 const availableStock = outOfStockMap[item.variant.id];
  
 return (
 <motion.div
        key={item.variant.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className="flex gap-4 py-3 md:py-4 border-b border-charcoal/5 last:border-0"
      >
        {/* Image */}
        <div className="w-16 h-24 md:w-20 md:h-28 bg-cream-dark rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative border border-charcoal/5">
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
 <div className="flex items-center gap-0.5 mt-1.5">
   {[1, 2, 3, 4, 5].map((star) => (
     <Star
       key={star}
       size={12}
       className={cn(
         star <= Math.round(item.product.rating)
           ? "fill-teal-600 text-teal-600"
           : "fill-charcoal/10 text-charcoal/10"
       )}
     />
   ))}
   <span className="text-xs text-slate ml-1">({item.product.reviewCount})</span>
 </div>
 {isOutOfStock && (
    <div className="mt-2 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md inline-block uppercase tracking-wider">
      {availableStock === 0 ? "Out of Stock" : `Only ${availableStock} left - Please reduce quantity`}
    </div>
  )}
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

 <div className="flex items-center justify-between mt-2 md:mt-3">
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
        <div className="flex flex-col items-end">
          <p className="text-base md:text-lg font-bold text-charcoal">
            {formatPrice(price * item.quantity)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-slate line-through">
              {formatPrice(originalPrice * item.quantity)}
            </p>
          )}
        </div>
        {item.quantity > 1 && (
          <p className="text-xs text-slate mt-1">
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
        <div className="lg:col-span-2 lg:pl-8">
          <div className="sticky top-28 space-y-5">
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
 <span>Total MRP ({getItemCount()} items)</span>
 <span>{formatPrice(totalMrp)}</span>
 </div>
 {productDiscount > 0 && (
 <div className="flex justify-between text-success">
 <span>Discount on MRP</span>
 <span>-{formatPrice(productDiscount)}</span>
 </div>
 )}
 {couponApplied && (
 <div className="flex justify-between text-success">
 <span>Coupon Discount</span>
 <span>-{formatPrice(discount)}</span>
 </div>
 )}
 <div className="flex justify-between text-slate ">
 <span>Platform Fee (2%)</span>
 <span>{formatPrice(platformFee)}</span>
 </div>
 <div className="flex justify-between text-slate ">
 <span>Shipping</span>
 <span className={shipping === 0 ? "text-success font-medium" : ""}>
 {shipping === 0 ? "FREE 🎉" : formatPrice(shipping)}
 </span>
 </div>
 <div className="h-px bg-charcoal/10 " />
 <div className="flex justify-between text-lg font-bold text-charcoal ">
 <span>Total Amount</span>
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
  disabled={hasOutOfStockItems}
  className={`btn-primary w-full flex items-center justify-center gap-2 text-center py-4 ${hasOutOfStockItems ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
  Proceed to Checkout <ArrowRight size={16} />
  </button>
  
  {hasOutOfStockItems && (
    <p className="text-xs text-rose-600 text-center mt-3 font-medium">
      Please remove or reduce the quantity of out-of-stock items to proceed.
    </p>
  )}

  {/* Payment Icons */}
 <div className="flex items-center justify-center gap-3 text-xs text-slate pt-2">
 <span>UPI</span>•<span>Cards</span>•<span>Net Banking</span>•<span>COD</span>
 </div>
          </div>
        </div>
      </div>
    </div>

    {/* Suggested Products Card */}
    <div className="mt-8 bg-white rounded-3xl border border-charcoal/10 shadow-sm p-4 sm:p-6 lg:p-10">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal mb-6">
        Recommended For You
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
