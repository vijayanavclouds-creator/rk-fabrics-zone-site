"use client"

import { useState } from "react"
import { Heart, PackageSearch, LayoutGrid, Grid3X3 } from "lucide-react"
import Link from "next/link"
import { useWishlistStore } from "@/store"
import { products } from "@/lib/data"
import { ProductCard } from "@/components/product/product-card"
import { cn } from "@/lib/utils"

export default function WishlistPage() {
  const [gridCols, setGridCols] = useState<3 | 5 | 7>(3);
  const { items } = useWishlistStore();
  const wishlistProducts = products.filter((p) => items.includes(p.id));

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal flex items-center gap-3">
          <Heart size={24} className="text-teal-600" />
          Your Wishlist
        </h2>
        
        <div className="flex items-center gap-4">
          {wishlistProducts.length > 0 && (
            <span className="text-sm font-medium text-slate">
              {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
            </span>
          )}

          {wishlistProducts.length > 0 && (
            <div className="flex items-center gap-1 border border-charcoal/10 rounded-lg p-0.5 ml-4">
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
          )}
        </div>
      </div>
      
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-charcoal/10">
          <PackageSearch size={48} className="mx-auto text-slate mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-charcoal mb-2">Your wishlist is empty</h3>
          <p className="text-slate mb-8 max-w-md mx-auto">Save items you love to your wishlist and keep track of them for later.</p>
          <Link href="/shop" className="inline-block px-8 py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
            Explore Products
          </Link>
        </div>
      ) : (
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
      )}
    </div>
  )
}
