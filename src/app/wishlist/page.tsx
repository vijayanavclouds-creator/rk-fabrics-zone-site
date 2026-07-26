"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Trash2, LayoutGrid, Grid3X3 } from "lucide-react";
import { useWishlistStore } from "@/store";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
 const [gridCols, setGridCols] = useState<3 | 5 | 7>(3);
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
 
 <div className="hidden md:flex items-center gap-1 border border-charcoal/10 rounded-lg p-0.5">
   {([3, 5, 7] as const).map((cols) => (
     <button
       key={cols}
       onClick={() => setGridCols(cols)}
       className={cn(
         "p-2 rounded-md transition-colors",
         gridCols === cols
           ? "bg-teal-600 text-white"
           : "text-slate hover:text-charcoal"
       )}
     >
       {cols === 3 ? <LayoutGrid size={16} /> : <Grid3X3 size={16} />}
     </button>
   ))}
 </div>
 </div>

 <div className={cn(
   "grid gap-4 md:gap-6 grid-cols-2",
   gridCols === 3 && "md:grid-cols-3",
   gridCols === 5 && "md:grid-cols-5",
   gridCols === 7 && "md:grid-cols-7"
 )}>
 {wishlistProducts.map((product, i) => (
 <ProductCard key={product.id} product={product} index={i} />
 ))}
 </div>
 </div>
 );
}
