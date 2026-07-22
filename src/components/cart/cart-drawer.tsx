"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
 const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, getShipping, getTotal, getItemCount } = useCartStore();

 const subtotal = getSubtotal();
 const shipping = getShipping();
 const total = getTotal();
 const freeShippingThreshold = 999;
 const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

 return (
 <AnimatePresence>
 {isOpen && (
 <>
 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={closeCart}
 className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
 />

 {/* Drawer */}
 <motion.div
 initial={{ x: "100%" }}
 animate={{ x: 0 }}
 exit={{ x: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 200 }}
 className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-cream flex flex-col shadow-2xl"
 >
 {/* Header */}
 <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/10 ">
 <div className="flex items-center gap-2">
 <ShoppingBag size={20} className="text-teal-600" />
 <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-charcoal ">
 Your Cart
 </h2>
 <span className="ml-1 w-6 h-6 bg-teal-600 text-white text-xs font-bold flex items-center justify-center rounded-full">
 {getItemCount()}
 </span>
 </div>
 <button
 onClick={closeCart}
 className="p-2 text-slate hover:text-charcoal :text-dark-text hover:bg-charcoal/5 :bg-dark-border rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 {/* Free Shipping Progress */}
 {items.length > 0 && (
 <div className="px-5 py-3 bg-teal-50/50 border-b border-teal-100/50 ">
 {subtotal >= freeShippingThreshold ? (
 <div className="flex items-center gap-2 text-sm text-teal-700 font-medium">
 <Truck size={16} />
 <span>🎉 You&apos;ve unlocked FREE shipping!</span>
 </div>
 ) : (
 <>
 <p className="text-xs text-teal-700/80 mb-2">
 Add <strong>{formatPrice(freeShippingThreshold - subtotal)}</strong> more for FREE shipping
 </p>
 <div className="h-1.5 bg-teal-100 rounded-full overflow-hidden">
 <motion.div
 className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
 initial={{ width: 0 }}
 animate={{ width: `${freeShippingProgress}%` }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 />
 </div>
 </>
 )}
 </div>
 )}

 {/* Cart Items */}
 <div className="flex-1 overflow-y-auto px-5 py-4">
 {items.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-center">
 <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-4">
 <ShoppingBag size={40} className="text-teal-300" />
 </div>
 <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-2">
 Your cart is empty
 </h3>
 <p className="text-sm text-slate mb-6">
 Discover our premium collection of fabrics and clothing
 </p>
 <Link
 href="/shop"
 onClick={closeCart}
 className="btn-primary inline-flex items-center gap-2"
 >
 Start Shopping <ArrowRight size={16} />
 </Link>
 </div>
 ) : (
 <div className="space-y-4">
 {items.map((item) => {
 const price = item.variant.salePrice || item.variant.price;
 return (
 <motion.div
 key={item.variant.id}
 layout
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 className="flex gap-3 p-3 bg-white rounded-xl border border-charcoal/5 "
 >
  {/* Product Image */}
  <div className="w-20 h-20 bg-cream-dark rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden relative">
  {item.product.images && item.product.images[0] ? (
    <Image
      src={item.product.images[0].url}
      alt={item.product.name}
      fill
      className="object-cover"
      sizes="80px"
    />
  ) : (
    "🧵"
  )}
  </div>

 <div className="flex-1 min-w-0">
 <h4 className="text-sm font-medium text-charcoal truncate">
 {item.product.name}
 </h4>
 <p className="text-xs text-slate mt-0.5">
 {item.variant.color} • {item.variant.size}
 </p>

 <div className="flex items-center justify-between mt-2">
 {/* Quantity */}
 <div className="flex items-center gap-1 border border-charcoal/10 rounded-lg">
 <button
 onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
 className="w-7 h-7 flex items-center justify-center text-slate hover:text-charcoal :text-dark-text hover:bg-charcoal/5 :bg-dark-border rounded-l-lg transition-colors"
 >
 <Minus size={14} />
 </button>
 <span className="w-8 text-center text-sm font-medium text-charcoal ">
 {item.quantity}
 </span>
 <button
 onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
 className="w-7 h-7 flex items-center justify-center text-slate hover:text-charcoal :text-dark-text hover:bg-charcoal/5 :bg-dark-border rounded-r-lg transition-colors"
 >
 <Plus size={14} />
 </button>
 </div>

 {/* Price + Delete */}
 <div className="flex items-center gap-2">
 <span className="text-sm font-semibold text-teal-600 ">
 {formatPrice(price * item.quantity)}
 </span>
 <button
 onClick={() => removeItem(item.variant.id)}
 className="p-1 text-slate hover:text-error transition-colors"
 aria-label="Remove item"
 >
 <Trash2 size={14} />
 </button>
 </div>
 </div>
 </div>
 </motion.div>
 );
 })}
 </div>
 )}
 </div>

 {/* Footer Summary */}
 {items.length > 0 && (
 <div className="border-t border-charcoal/10 px-5 py-4 space-y-3 bg-white/50 ">
 <div className="flex justify-between text-sm text-slate ">
 <span>Subtotal</span>
 <span>{formatPrice(subtotal)}</span>
 </div>
 <div className="flex justify-between text-sm text-slate ">
 <span>Shipping</span>
 <span className={shipping === 0 ? "text-success font-medium" : ""}>
 {shipping === 0 ? "FREE" : formatPrice(shipping)}
 </span>
 </div>
 <div className="flex justify-between text-base font-bold text-charcoal pt-2 border-t border-charcoal/10 ">
 <span>Total</span>
 <span className="text-teal-600 ">{formatPrice(total)}</span>
 </div>

 <Link
 href="/checkout"
 onClick={closeCart}
 className="btn-primary w-full flex items-center justify-center gap-2 text-center"
 >
 Checkout <ArrowRight size={16} />
 </Link>

 <button
 onClick={closeCart}
 className="w-full text-center text-sm text-teal-600 font-medium hover:underline py-1"
 >
 Continue Shopping
 </button>
 </div>
 )}
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
