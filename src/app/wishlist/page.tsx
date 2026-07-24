"use client";

import Link from "next/link";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";

export default function WishlistPage() {
 const { items, toggleItem } = useWishlistStore();
 const wishlistProducts = products.filter((p) => items.includes(p.id));

 if (wishlistProducts.length === 0) {
 return (
 <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-16 text-center">
 <div className="w-24 h-24 bg-rose/10 rounded-full flex items-center justify-center mx-auto mb-6">
 <Heart size={40} className="text-rose/40" />
 </div>
 <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal mb-3">
 Your Wishlist is Empty
 </h1>
 <p className="text-slate mb-8 max-w-md mx-auto">
 Save your favorite fabrics and outfits here. Tap the ❤️ icon on any product to add it to your wishlist.
 </p>
 <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
 Explore Collection <ArrowRight size={16} />
 </Link>
 </div>
 );
 }

 return (
 <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-charcoal ">
 My Wishlist
 </h1>
 <p className="text-sm text-slate mt-1">
 {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
 </p>
 </div>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
 {wishlistProducts.map((product, i) => (
 <ProductCard key={product.id} product={product} index={i} />
 ))}
 </div>
 </div>
 );
}
