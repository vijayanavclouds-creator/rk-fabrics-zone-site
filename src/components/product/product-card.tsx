"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star, Sparkles } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { useCartStore, useWishlistStore } from "@/store";
import { toast } from "sonner";
import type { Product } from "@/types";
import { useSession } from "next-auth/react";

interface ProductCardProps {
 product: Product;
 index?: number;
 variant?: "default" | "compact" | "featured";
}

 export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
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
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-50px" }}
 transition={{ duration: 0.5, delay: index * 0.08 }}
 >
 <Link
 href={productUrl}
 className="product-card block group relative bg-cream rounded-[2rem] p-3 shadow-neo-card transition-all duration-300 hover:shadow-neo-pressed"
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 >
 {/* Image Area */}
 <div className="relative aspect-[3/4] bg-cream shadow-neo-pressed rounded-[1.5rem] overflow-hidden">
 {/* Real Product Image or Fabric Pattern Background */}
 {product.images && product.images.length > 0 ? (
 <Image
 src={product.images.find(img => img.isPrimary)?.url || product.images[0].url}
 alt={product.name}
 fill
 className="object-cover group-hover:scale-110 transition-transform duration-500"
 />
 ) : (
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-7xl opacity-30 group-hover:scale-110 transition-transform duration-500">
 {fabricEmoji}
 </span>
 </div>
 )}

 {/* Badges */}
 <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
 {hasDiscount && (
 <span className="px-2.5 py-1 text-xs font-bold bg-rose text-white rounded-full shadow-sm">
 {discount}% OFF
 </span>
 )}
 {product.isNewArrival && (
 <span className="px-2.5 py-1 text-xs font-bold bg-teal-600 text-white rounded-full shadow-sm flex items-center gap-1">
 <Sparkles size={10} /> NEW
 </span>
 )}
 {product.isBestseller && (
 <span className="px-2.5 py-1 text-xs font-bold bg-gold text-white rounded-full shadow-sm">
 BESTSELLER
 </span>
 )}
 </div>

 {/* Wishlist Button */}
 <button
 onClick={handleWishlist}
 className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
 >
 <Heart
 size={16}
 className={cn(
 "transition-colors",
 isMounted && wishlisted ? "fill-rose text-rose" : "text-charcoal/50 "
 )}
 />
 </button>

 {/* Quick Actions (on hover) */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
 transition={{ duration: 0.2 }}
 className="absolute bottom-3 left-3 right-3 z-10 flex gap-2"
 >
 <button
 onClick={handleAddToCart}
 className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors"
 >
 <ShoppingBag size={14} /> Add to Cart
 </button>
 <button
 onClick={handleQuickView}
 className="w-10 h-10 bg-white text-charcoal rounded-xl shadow-lg flex items-center justify-center hover:bg-teal-50 :bg-teal-900/20 transition-colors"
 >
 <Eye size={16} />
 </button>
 </motion.div>

 {/* Urgency */}
 {lowStock && (
 <div className="absolute bottom-3 left-3 right-3 z-[5]">
 <div className="urgency-pill">
 <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
 Only {primaryVariant.stock} left in stock
 </div>
 </div>
 )}
 </div>

 {/* Info */}
 <div className="p-4">
 {/* Color Swatches */}
 {product.variants.length > 1 && (
 <div className="flex items-center gap-1.5 mb-2">
 {[...new Map(product.variants.map((v) => [v.colorHex, v])).values()]
 .slice(0, 5)
 .map((v) => (
 <span
 key={v.id}
 className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
 style={{ backgroundColor: v.colorHex }}
 title={v.color}
 />
 ))}
 {new Map(product.variants.map((v) => [v.colorHex, v])).size > 5 && (
 <span className="text-[10px] text-slate font-medium">
 +{new Map(product.variants.map((v) => [v.colorHex, v])).size - 5}
 </span>
 )}
 </div>
 )}

 {/* Category */}
 <p className="text-[10px] font-medium text-teal-600 uppercase tracking-wider mb-1">
 {product.fabric}
 </p>

 {/* Name */}
 <h3 className="font-[family-name:var(--font-playfair)] text-sm md:text-base font-semibold text-charcoal leading-snug mb-1.5 line-clamp-2 group-hover:text-teal-600 :text-teal-400 transition-colors">
 {product.name}
 </h3>

 {/* Rating */}
 <div className="flex items-center gap-1.5 mb-2">
 <div className="flex items-center gap-0.5">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 size={12}
 className={cn(
 star <= Math.floor(product.rating)
 ? "fill-gold text-gold"
 : "fill-charcoal/10 text-charcoal/10 "
 )}
 />
 ))}
 </div>
 <span className="text-[11px] text-slate ">
 ({product.reviewCount})
 </span>
 </div>

 {/* Price */}
 <div className="flex items-baseline gap-2">
 <span className="text-lg font-bold text-charcoal ">
 {formatPrice(price)}
 </span>
 {hasDiscount && (
 <>
 <span className="text-sm text-slate line-through">
 {formatPrice(originalPrice)}
 </span>
 <span className="text-xs font-semibold text-success">
 Save {formatPrice(originalPrice - price)}
 </span>
 </>
 )}
 </div>
 </div>
 </Link>
 </motion.div>
 );
}
