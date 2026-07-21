"use client"

import { Heart, PackageSearch, Trash2 } from "lucide-react"
import Link from "next/link"
import { useWishlistStore } from "@/store"
import { products } from "@/lib/data"
import { ProductCard } from "@/components/product/product-card"

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const wishlistProducts = products.filter((p) => items.includes(p.id));

  return (
    <div className="bg-white rounded-3xl border border-charcoal/10 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-[family-name:var(--font-playfair)] font-bold text-charcoal flex items-center gap-3">
          <Heart size={24} className="text-teal-600" />
          Your Wishlist
        </h2>
        {wishlistProducts.length > 0 && (
          <span className="text-sm font-medium text-slate">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
          </span>
        )}
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
