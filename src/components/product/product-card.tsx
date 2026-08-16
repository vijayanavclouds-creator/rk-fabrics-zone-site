"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star, Sparkles, Flame } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { useCartStore, useWishlistStore } from "@/store";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useSession } from "next-auth/react";
import { maskImageUrl } from "@/lib/image-mask";

interface ProductCardProps {
 product: Product;
 index?: number;
 variant?: "default" | "compact" | "featured";
}

 export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [isMounted, setIsMounted] = useState(false);
  const toggleItem = useWishlistStore(state => state.toggleItem);
  const wishlisted = useWishlistStore(state => state.items.includes(product.id));
  const { data: session } = useSession();

  useEffect(() => setIsMounted(true), []);

  const primaryVariant = product.variants[0];
 const price = primaryVariant?.salePrice || primaryVariant?.price || product.salePrice || product.basePrice;
 const originalPrice = primaryVariant?.price || product.basePrice;
 const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
 const discount = hasDiscount ? calculateDiscount(product.basePrice, product.salePrice!) : 0;
 const lowStock = primaryVariant && primaryVariant.stock <= 3 && primaryVariant.stock > 0;

 const productUrl = `/product/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  if (primaryVariant) {
  addItem(product, primaryVariant);
  }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleItem(product.id);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️", {
      description: product.name,
    });

    if (session?.user) {
      try {
        await fetch("/api/wishlist/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id })
        });
      } catch (e) {
        console.error("Failed to sync wishlist with DB", e);
      }
    }
  };

 const handleQuickView = (e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 router.push(productUrl);
 };

  let firstCategory = product.category;
  try {
    const cats = JSON.parse(product.category);
    if (Array.isArray(cats) && cats.length > 0) {
      firstCategory = cats[0];
    }
  } catch (e) {}

  // Fabric emoji based on category
  const fabricMap: Record<string, string> = {
    "women-ethnic": "👗",
    "women-western": "👚",
    "men-formal": "👔",
    "men-casual": "👕",
    "men-ethnic": "🥻",
    fabrics: "🧵",
    unstitched: "✂️",
    accessories: "🧣",
  };
  const fabricEmoji = fabricMap[firstCategory] || "🧵";

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 transition={{ duration: 0.3 }}
 >
  <Link
  href={productUrl}
  className="product-card block group relative bg-cream rounded-none p-[7px] shadow-neo-card transition-all duration-300 hover:shadow-neo-pressed flex flex-col h-full"
  >
  {/* Image Area */}
  <div className="relative aspect-[4/5] bg-cream shadow-neo-pressed rounded-none overflow-hidden shrink-0">
  {/* Real Product Image or Fabric Pattern Background */}
  {product.images && product.images.length > 0 ? (
  <Image
  src={maskImageUrl(product.images.find(img => img.isPrimary)?.url || product.images[0].url)}
  alt={product.name}
  fill
  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
  priority={index < 4}
  className="object-cover group-hover:scale-110 transition-transform duration-500"
  />
  ) : (
  <div className="absolute inset-0 flex items-center justify-center">
  <span className="text-7xl opacity-30 group-hover:scale-110 transition-transform duration-500">
  {fabricEmoji}
  </span>
  </div>
  )}

  {/* Discount and New Tags (Top Left Corner) */}
  <div className="absolute top-1 left-1 flex flex-col items-start gap-0.5 z-20 pointer-events-none md:top-0 md:left-0 md:gap-0">
    {hasDiscount && (
      <span className={cn(
        "px-1 py-[1px] text-[6px] md:px-1.5 md:py-[1px] md:text-[8px] leading-tight font-bold bg-rose-500 text-white shadow-sm rounded-full md:rounded-none",
        product.isNewArrival ? "md:rounded-br-sm md:border-b md:border-white/20" : "md:rounded-br-xl"
      )}>
        -{discount}%
      </span>
    )}
    {product.isNewArrival && (
      <span className={cn(
        "px-1 py-[1px] text-[6px] md:px-1.5 md:py-[1px] md:text-[8px] leading-tight font-bold bg-teal-600 text-white shadow-sm flex items-center gap-0.5 md:gap-1 rounded-full md:rounded-none",
        (hasDiscount && !product.isBestseller) ? "md:rounded-br-xl md:rounded-tr-none" : 
        hasDiscount ? "md:rounded-tr-none" : 
        !product.isBestseller ? "md:rounded-br-xl" : ""
      )}>
        NEW
      </span>
    )}
    {product.isBestseller && (
      <span className={cn(
        "px-1 py-[1px] text-[6px] md:px-1.5 md:py-[1px] md:text-[8px] leading-tight font-bold bg-gold text-white shadow-sm flex items-center gap-0.5 rounded-full md:rounded-none md:rounded-br-xl",
        (hasDiscount || product.isNewArrival) && "md:rounded-tr-none"
      )}>
        <Flame size={7} className="md:w-[10px] md:h-[10px]" /> HOT
      </span>
    )}
  </div>

  {/* Badges - Empty now since BESTSELLER moved */}
  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
  </div>

  {/* Wishlist Button */}
  <button
  onClick={handleWishlist}
  className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
  >
  <Heart
  size={14}
  className={cn(
  "transition-colors",
  isMounted && wishlisted ? "fill-rose text-rose" : "text-charcoal/50 "
  )}
  />
  </button>

  {/* Quick Actions (on hover) - Hidden on mobile to prevent double-tap navigation bugs */}
  <div className="hidden md:flex absolute bottom-2 left-2 right-2 z-10 gap-1.5 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
  <button
  onClick={handleAddToCart}
  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-lg transition-colors pointer-events-auto"
  >
  <ShoppingBag size={12} /> Add
  </button>
  <button
  onClick={handleQuickView}
  className="w-8 h-8 bg-white text-charcoal rounded-lg shadow-lg flex items-center justify-center hover:bg-teal-50 transition-colors pointer-events-auto"
  >
  <Eye size={14} />
  </button>
  </div>

  {/* Urgency */}
  {lowStock && (
  <div className="absolute bottom-2 left-2 right-2 z-[5]">
  <div className="urgency-pill text-[9px] py-0.5">
  <span className="w-1.5 h-1.5 bg-charcoal rounded-full animate-pulse" />
  Only {primaryVariant.stock} left
  </div>
  </div>
  )}
  </div>

  {/* Info */}
  <div className="pt-2 px-1.5 pb-1 flex flex-col flex-1">
  <div className="flex items-center justify-between mb-0.5">
    {/* Category */}
    <p className="text-[9px] font-medium text-teal-600 uppercase tracking-wider truncate mr-2">
    {product.fabric}
    </p>

    {/* Color Swatches */}
    {product.variants.length > 1 && (
    <div className="flex items-center gap-1 shrink-0">
    {[...new Map(product.variants.map((v) => [v.colorHex, v])).values()]
    .slice(0, 3)
    .map((v) => (
    <span
    key={v.id}
    className="w-3 h-3 rounded-full border border-white shadow-sm"
    style={{ backgroundColor: v.colorHex }}
    title={v.color}
    />
    ))}
    {new Map(product.variants.map((v) => [v.colorHex, v])).size > 3 && (
    <span className="text-[8px] text-slate font-medium">
    +{new Map(product.variants.map((v) => [v.colorHex, v])).size - 3}
    </span>
    )}
    </div>
    )}
  </div>

  {/* Name */}
  <h3 className="font-[family-name:var(--font-playfair)] text-[12px] md:text-[13px] font-semibold text-charcoal leading-tight mb-1 truncate group-hover:text-teal-600 transition-colors">
  {product.name}
  </h3>

  {/* Price & Rating Row */}
  <div className="flex flex-wrap items-end justify-between mt-auto gap-x-1 gap-y-1">
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="text-[15px] font-bold text-charcoal leading-none">
        {formatPrice(price)}
        </span>
        {hasDiscount && (
        <span className="text-[10px] text-slate line-through leading-none">
        {formatPrice(originalPrice)}
        </span>
        )}
      </div>
      {hasDiscount && (
        <span className="text-[9px] font-semibold text-success leading-tight mt-0.5">
        Save {formatPrice(originalPrice - price)}
        </span>
      )}
    </div>
    
    {/* Rating */}
    <div className="flex items-center gap-0.5 shrink-0 mb-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={10} 
          className={cn(
            star <= Math.round(product.rating) 
              ? "fill-teal-600 text-teal-600" 
              : "fill-charcoal/10 text-charcoal/10"
          )} 
        />
      ))}
      <span className="text-[10px] text-slate font-medium leading-none ml-0.5">
        ({product.reviewCount})
      </span>
    </div>
  </div>
  </div>
  </Link>
 </motion.div>
 );
}
