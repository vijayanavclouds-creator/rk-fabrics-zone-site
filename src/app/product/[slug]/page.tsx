"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
 Heart,
 ShoppingBag,
 Share2,
 Star,
 Truck,
 Shield,
 RefreshCw,
 Minus,
 Plus,
 Eye,
 ChevronRight,
 MessageCircle,
 Sparkles,
 Camera,
 Check,
 Ruler,
 Link as LinkIcon,
 X,
 ZoomIn,
 ZoomOut,
} from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { getProductBySlug, products } from "@/lib/data";
import { addReview } from "@/actions/reviews";
import { useCartStore, useWishlistStore } from "@/store";
import { ProductCard } from "@/components/product/product-card";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { toggleWishlistDb } from "@/actions/wishlist";
import { getCompanyProfile } from "@/actions/system";

export default function ProductPage() {
  const params = useParams();
  const product = getProductBySlug(params.slug as string);

  if (!product) {
 return (
 <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
 <div>
 <span className="text-6xl block mb-4">🔍</span>
 <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal mb-2">
 Product Not Found
 </h1>
 <p className="text-slate mb-6">
 This product may have been removed or the link is incorrect.
 </p>
 <Link href="/shop" className="btn-primary">
 Back to Shop
 </Link>
 </div>
 </div>
 );
 }

 return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: NonNullable<ReturnType<typeof getProductBySlug>> }) {
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  useEffect(() => {
    getCompanyProfile().then(setCompanyProfile);
  }, []);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);
  const { data: session } = useSession();

  // Get unique colors and sizes
 const uniqueColors = useMemo(() => {
 const map = new Map<string, { color: string; hex: string }>();
 product.variants.forEach((v) => map.set(v.colorHex, { color: v.color, hex: v.colorHex }));
 return Array.from(map.values());
 }, [product]);

 const uniqueSizes = useMemo(() => {
 return [...new Set(product.variants.map((v) => v.size))];
 }, [product]);

 const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.hex || "");
 const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] || "");
 const [quantity, setQuantity] = useState(1);
 const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
 const [isAdding, setIsAdding] = useState(false);
 const [isPending, startTransition] = useTransition();
 const [reviewForm, setReviewForm] = useState(false);
 const [isLightboxOpen, setIsLightboxOpen] = useState(false);
 const [selectedImage, setSelectedImage] = useState(() => {
   const idx = product.images.findIndex((img: any) => img.isPrimary);
   return idx !== -1 ? idx : 0;
 });
 const [viewingCount, setViewingCount] = useState(0);
 const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

 useEffect(() => {
   setViewingCount(Math.floor(Math.random() * 30) + 12);
 }, []);

 // Find matching variant
 const selectedVariant = useMemo(() => {
 return product.variants.find(
 (v) => v.colorHex === selectedColor && v.size === selectedSize
 ) || product.variants.find((v) => v.colorHex === selectedColor) || product.variants[0];
 }, [product, selectedColor, selectedSize]);

 const price = selectedVariant?.salePrice || product.salePrice || selectedVariant?.price || product.basePrice;
 const originalPrice = selectedVariant?.price || product.basePrice;
 const discount = product.discountPercent || 0;
 const hasDiscount = discount > 0;
 const stock = selectedVariant?.stock || 0;
 const lowStock = stock > 0 && stock <= 5;

 // Available sizes for selected color
 const availableSizes = useMemo(() => {
 return product.variants
 .filter((v) => v.colorHex === selectedColor)
 .map((v) => ({ size: v.size, stock: v.stock }));
 }, [product, selectedColor]);

 const handleAddToCart = () => {
 if (!selectedVariant || stock <= 0) return;
 setIsAdding(true);
 addItem(product, selectedVariant, quantity);
 setTimeout(() => setIsAdding(false), 600);
 };

 const handleShare = (platform: "whatsapp" | "facebook" | "twitter" | "instagram" | "copy") => {
 const text = `Check out ${product.name} on RK Fabrics Zone — ${formatPrice(price)}`;
 const url = typeof window !== "undefined" ? window.location.href : "";

 if (platform === "copy") {
   navigator.clipboard.writeText(url);
   toast.success("Link copied to clipboard!");
   return;
 }

 if (platform === "instagram") {
   try { navigator.clipboard.writeText(url); } catch (e) {}
   window.open("https://instagram.com", "_blank");
   return;
 }

 if (platform === "whatsapp") {
   window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
 } else if (platform === "facebook") {
   window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
 } else if (platform === "twitter") {
   window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
 }
 };

  // Related products
  let currentProductCats: string[] = [];
  try { currentProductCats = JSON.parse(product.category); } catch(e) { currentProductCats = [product.category]; }

  const related = products
  .filter((p) => {
    if (p.id === product.id) return false;
    let pCats: string[] = [];
    try { pCats = JSON.parse(p.category); } catch(e) { pCats = [p.category]; }
    return currentProductCats.some(c => pCats.includes(c));
  })
  .slice(0, 4);

  const fabricMap: Record<string, string> = {
  "women-ethnic": "👗", "women-western": "👚", "men-formal": "👔",
  "men-casual": "👕", "men-ethnic": "🥻", fabrics: "🧵",
  unstitched: "✂️", accessories: "🧣",
  };
  const fabricEmoji = fabricMap[currentProductCats[0]] || "🧵";

  const selectedColorName = uniqueColors.find(c => c.hex === selectedColor)?.color || selectedColor;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://rkfabricszone.com/product/${product.slug}`;
  const whatsappMessage = `Hi! I'm interested in the following fabric:\n\n*Product:* ${product.name}\n*Price:* ${formatPrice(price)}\n*Color:* ${selectedColorName}\n*Size:* ${selectedSize}\n\n*Link:* ${currentUrl}\n\nCould you please provide more details?`;

 return (
 <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
 {/* Breadcrumb */}
 <nav className="flex items-center gap-2 text-xs text-slate mb-6">
 <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
 <ChevronRight size={12} />
 <Link href="/shop" className="hover:text-teal-600 transition-colors">Shop</Link>
 <ChevronRight size={12} />
 <span className="text-charcoal font-medium truncate">{product.name}</span>
 </nav>

 {/* Product Grid */}
 <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
 {/* Left: Gallery */}
 <div className="space-y-4">
 {/* Main Image */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="relative aspect-[3/4] bg-gradient-to-br from-cream-dark to-cream rounded-2xl overflow-hidden flex items-center justify-center cursor-zoom-in group"
 onClick={() => setIsLightboxOpen(true)}
 >
 {product.images && product.images.length > 0 ? (
   <Image
     src={product.images[selectedImage]?.url || product.images[0].url}
     alt={product.name}
     fill
     className="object-cover group-hover:scale-105 transition-transform duration-500"
   />
 ) : (
   <span className="text-[150px] opacity-30">{fabricEmoji}</span>
 )}

 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
   <div className="bg-white/95 backdrop-blur-md text-charcoal px-5 py-2.5 rounded-full flex items-center gap-2 font-bold shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
     <ZoomIn size={20} className="text-teal-600" /> Click to View Fullscreen
   </div>
 </div>

 {/* Badges */}
 <div className="absolute top-4 left-4 flex flex-col gap-2">
 {hasDiscount && (
 <span className="px-3 py-1.5 text-xs font-bold bg-rose text-white rounded-full">
 {discount}% OFF
 </span>
 )}
 {product.isNewArrival && (
 <span className="px-3 py-1.5 text-xs font-bold bg-teal-600 text-white rounded-full flex items-center gap-1">
 <Sparkles size={10} /> NEW
 </span>
 )}
 {product.isBestseller && (
 <span className="px-3 py-1.5 text-xs font-bold bg-gold text-white rounded-full">
 BESTSELLER
 </span>
 )}
 </div>

 {/* AR Try-On Button */}
 <button className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl text-sm font-semibold text-teal-600 border border-teal-600/20 hover:bg-teal-600 hover:text-white transition-all shadow-lg group">
 <Camera size={16} className="group-hover:animate-pulse" />
 Try On (AR)
 </button>
 </motion.div>

 {/* Thumbnail row */}
 <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
 {product.images.map((img, i) => (
 <div
 key={img.id}
 onClick={() => setSelectedImage(i)}
 className={cn(
 "relative w-20 h-20 rounded-xl bg-cream-dark flex-shrink-0 flex items-center justify-center text-3xl cursor-pointer border-2 transition-colors overflow-hidden",
 i === selectedImage ? "border-teal-600" : "border-transparent hover:border-teal-300"
 )}
 >
   <Image
     src={img.url}
     alt={`${product.name} Thumbnail ${i + 1}`}
     fill
     className="object-cover"
   />
 </div>
 ))}
 </div>
 </div>

 {/* Right: Info */}
 <div>
 {/* Title */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
 <p className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-gold-dark uppercase mb-2">
 {product.fabricDetails ? `${product.fabric} - ${product.fabricDetails}` : product.fabric}
 </p>
 <h1 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal leading-snug">
 {product.name}
 </h1>
 </motion.div>

 {/* Rating */}
 <div className="flex items-center gap-3 mt-3">
 <div className="flex items-center gap-0.5">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 size={16}
 className={cn(
 star <= Math.floor(product.rating)
 ? "fill-gold text-gold"
 : "fill-charcoal/10 text-charcoal/10 "
 )}
 />
 ))}
 </div>
 <span className="text-sm font-medium text-charcoal ">{product.rating}</span>
 <span className="text-sm text-slate ">
 ({product.reviewCount} reviews)
 </span>
 {viewingCount > 0 && (
    <span className="flex items-center gap-1 text-xs text-slate ">
      <Eye size={12} /> {viewingCount} viewing now
    </span>
 )}
 </div>

 {/* Price */}
 <div className="mt-5 flex items-baseline gap-3">
 <span className="text-3xl md:text-4xl font-bold text-charcoal ">
 {formatPrice(price)}
 </span>
 {hasDiscount && (
 <>
 <span className="text-lg text-slate line-through">
 {formatPrice(originalPrice)}
 </span>
 <span className="px-2.5 py-1 text-xs font-bold text-success bg-success/10 rounded-full">
 Save {formatPrice(originalPrice - price)}
 </span>
 </>
 )}
 </div>
 <p className="text-xs text-slate mt-1">Inclusive of all taxes | GST Invoice available</p>

 {/* Urgency */}
 {lowStock && (
 <motion.div
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 className="mt-4 urgency-pill"
 >
 <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
 Only {stock} left in this combination — selling fast!
 </motion.div>
 )}

 <div className="w-full h-px bg-charcoal/10 my-6" />

 {/* Color Selection */}
 <div className="mb-5">
 <h3 className="text-sm font-semibold text-charcoal mb-3">
 Color: <span className="font-normal text-slate ">{uniqueColors.find((c) => c.hex === selectedColor)?.color}</span>
 </h3>
 <div className="flex gap-2.5">
 {uniqueColors.map((c) => (
 <button
 key={c.hex}
 onClick={() => setSelectedColor(c.hex)}
 className={cn(
 "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
 selectedColor === c.hex
 ? "border-teal-600 ring-2 ring-teal-600/30 scale-110"
 : "border-charcoal/10 "
 )}
 style={{ backgroundColor: c.hex }}
 title={c.color}
 />
 ))}
 </div>
 </div>

 {/* Size Selection */}
 <div className="mb-5">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-sm font-semibold text-charcoal ">Size</h3>
 <button type="button" onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-xs text-teal-600 font-medium hover:underline cursor-pointer">
 <Ruler size={12} /> Size Guide
 </button>
 </div>
 <div className="flex flex-wrap gap-2">
 {uniqueSizes.map((size) => {
 const sizeAvail = availableSizes.find((s) => s.size === size);
 const inStock = sizeAvail && sizeAvail.stock > 0;
 return (
 <button
 key={size}
 onClick={() => inStock && setSelectedSize(size)}
 disabled={!inStock}
 className={cn(
 "px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all min-w-[60px]",
 selectedSize === size && inStock
 ? "bg-teal-600 text-white border-teal-600"
 : inStock
 ? "bg-white text-charcoal border-charcoal/10 hover:border-teal-500"
 : "bg-charcoal/5 text-charcoal/30 border-transparent cursor-not-allowed line-through"
 )}
 >
 {size}
 </button>
 );
 })}
 </div>
 </div>

 {/* Quantity + Actions */}
 <div className="flex items-center gap-4 mb-6">
 {/* Quantity */}
 <div className="flex items-center border-2 border-charcoal/10 rounded-xl">
 <button
 onClick={() => setQuantity(Math.max(1, quantity - 1))}
 className="w-11 h-11 flex items-center justify-center text-slate hover:text-charcoal :text-dark-text hover:bg-charcoal/5 :bg-dark-border rounded-l-lg transition-colors"
 >
 <Minus size={16} />
 </button>
 <span className="w-12 text-center text-base font-semibold text-charcoal ">
 {quantity}
 </span>
 <button
 onClick={() => setQuantity(Math.min(stock, quantity + 1))}
 className="w-11 h-11 flex items-center justify-center text-slate hover:text-charcoal :text-dark-text hover:bg-charcoal/5 :bg-dark-border rounded-r-lg transition-colors"
 >
 <Plus size={16} />
 </button>
 </div>

 {/* Add to Cart */}
 <motion.button
 onClick={handleAddToCart}
 disabled={stock <= 0}
 whileTap={{ scale: 0.95 }}
 className={cn(
 "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-base font-semibold transition-all",
 stock > 0
 ? "btn-primary"
 : "bg-charcoal/10 text-charcoal/40 cursor-not-allowed"
 )}
 >
 <AnimatePresence mode="wait">
 {isAdding ? (
 <motion.span
 key="check"
 initial={{ scale: 0, rotate: -180 }}
 animate={{ scale: 1, rotate: 0 }}
 exit={{ scale: 0 }}
 className="flex items-center gap-2"
 >
 <Check size={18} /> Added!
 </motion.span>
 ) : (
 <motion.span
 key="cart"
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 exit={{ scale: 0 }}
 className="flex items-center gap-2"
 >
 <ShoppingBag size={18} /> {stock > 0 ? "Add to Cart" : "Out of Stock"}
 </motion.span>
 )}
 </AnimatePresence>
 </motion.button>

          {/* Wishlist */}
          <button
            onClick={async () => {
              toggleItem(product.id);
              toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️");
              if (session?.user) {
                await toggleWishlistDb(product.id);
              }
            }}
            className={cn(
 "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
 wishlisted
 ? "border-rose bg-rose/5 text-rose"
 : "border-charcoal/10 text-slate hover:border-rose hover:text-rose"
 )}
 >
 <Heart size={20} className={wishlisted ? "fill-rose" : ""} />
 </button>
 </div>

 {/* Share */}
 <div className="mb-6">
  <p className="text-sm font-semibold text-charcoal mb-2">Share this product:</p>
  <div className="flex items-center gap-3">
    <button onClick={() => handleShare("whatsapp")} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Share on WhatsApp">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
    </button>
    <button onClick={() => handleShare("facebook")} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Share on Facebook">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
    </button>
    <button onClick={() => handleShare("twitter")} className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 transition-colors" title="Share on Twitter">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
    </button>
    <button onClick={() => handleShare("instagram")} className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors" title="Share on Instagram">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    </button>
    <button onClick={() => handleShare("copy")} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="Copy Link">
      <LinkIcon size={16} />
    </button>
  </div>
 </div>

 {/* Trust Badges */}
 <div className="grid grid-cols-3 gap-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50 ">
 <div className="flex flex-col items-center gap-1 text-center">
 <Truck size={18} className="text-teal-600 " />
 <span className="text-[10px] md:text-xs font-medium text-charcoal ">{product.isFreeDelivery ? "Free Delivery" : "Delivery Fee Applies"}</span>
 <span className="text-[9px] text-slate ">{product.isFreeDelivery ? "Available everywhere" : "Calculated at checkout"}</span>
 </div>
  <div className="flex flex-col items-center gap-1 text-center">
  {product.isReturnable ? (
    <>
      <RefreshCw size={18} className="text-teal-600 " />
      <span className="text-[10px] md:text-xs font-medium text-charcoal ">7 Day Easy Returns</span>
      <span className="text-[9px] text-slate ">Available</span>
    </>
  ) : (
    <>
      <RefreshCw size={18} className="text-slate-400 " />
      <span className="text-[10px] md:text-xs font-medium text-slate-500 ">No Return Available</span>
      <span className="text-[9px] text-slate ">For this product</span>
    </>
  )}
  </div>
 <div className="flex flex-col items-center gap-1 text-center">
 <Shield size={18} className="text-teal-600 " />
 <span className="text-[10px] md:text-xs font-medium text-charcoal ">100% Genuine</span>
 <span className="text-[9px] text-slate ">Quality Certified</span>
 </div>
 </div>

 {/* WhatsApp CTA */}
 {session && (
 <a
  href={`https://wa.me/${(companyProfile?.contactNumber || '+919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`}
  target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 mt-4 py-3 rounded-full border-2 border-green-500 text-green-600 font-semibold text-sm hover:bg-green-50 :bg-green-900/10 transition-colors"
 >
 <MessageCircle size={18} /> Chat About This Fabric
 </a>
 )}
 </div>
 </div>

 {/* Tabs: Description / Details / Reviews */}
 <div className="mt-12 md:mt-16">
 <div className="flex gap-1 border-b border-charcoal/10 mb-6">
 {(["description", "details", "reviews"] as const).map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={cn(
 "px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px",
 activeTab === tab
 ? "border-teal-600 text-teal-600 "
 : "border-transparent text-slate hover:text-charcoal :text-dark-text"
 )}
 >
 {tab} {tab === "reviews" && `(${product.reviewCount})`}
 </button>
 ))}
 </div>

 <AnimatePresence mode="wait">
 <motion.div
 key={activeTab}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 transition={{ duration: 0.2 }}
 >
 {activeTab === "description" && (
 <div className="prose prose-sm max-w-none text-slate ">
 <p className="text-base leading-relaxed">{product.description}</p>
 </div>
 )}

 {activeTab === "details" && (
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {[
 { label: "Fabric", value: product.fabric },
 { label: "Category", value: (() => {
    try {
      const cats = JSON.parse(product.category);
      if (Array.isArray(cats)) return cats.map(c => c.replace("-", " ").replace(/\b\w/g, (char: string) => char.toUpperCase())).join(", ");
    } catch(e) {}
    return product.category.replace("-", " ").replace(/\b\w/g, (char: string) => char.toUpperCase());
  })() },
 { label: "Type", value: product.type.charAt(0).toUpperCase() + product.type.slice(1) },
 { label: "Occasion", value: product.occasion?.join(", ") || "All" },
 { label: "SKU", value: selectedVariant?.sku || "N/A" },
 { label: "Gender", value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1) },
 ].map((detail) => (
 <div key={detail.label} className="p-4 rounded-xl bg-cream-dark/50 border border-charcoal/5 ">
 <p className="text-xs text-slate font-medium uppercase tracking-wider">{detail.label}</p>
 <p className="text-sm font-semibold text-charcoal mt-1">{detail.value}</p>
 </div>
 ))}
 </div>
 )}

 {activeTab === "reviews" && (
  <div className="py-6">
    <div className="flex items-center justify-between mb-8">
      <div>
        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal">
          Customer Reviews
        </h3>
        <p className="text-sm text-slate mt-1">
          {product.rating.toFixed(1)} out of 5 based on {product.reviewCount} reviews
        </p>
      </div>
      <button 
        onClick={() => setReviewForm(!reviewForm)}
        className="btn-primary py-2 px-4 text-sm"
      >
        {reviewForm ? "Cancel" : "Write a Review"}
      </button>
    </div>

    <AnimatePresence>
      {reviewForm && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-10 overflow-hidden"
        >
          <form 
            action={(formData) => {
              formData.append("productId", product.id);
              startTransition(async () => {
                const res = await addReview(formData);
                if (res.success) {
                  toast.success("Review submitted!");
                  setReviewForm(false);
                } else {
                  toast.error(res.error || "Failed to submit review");
                }
              });
            }}
            className="p-6 bg-cream-dark/30 rounded-2xl border border-charcoal/5 flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Your Name</label>
              <input required name="userName" type="text" className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Rating (1-5)</label>
              <input required name="rating" type="number" min="1" max="5" defaultValue="5" className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">Your Review</label>
              <textarea required name="comment" rows={4} className="w-full p-3 rounded-xl border border-charcoal/10 focus:outline-none focus:border-teal-600" placeholder="What did you like about this product?"></textarea>
            </div>
            <button disabled={isPending} type="submit" className="btn-primary self-start mt-2">
              {isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>

    {product.reviews && product.reviews.length > 0 ? (
      <div className="space-y-6">
        {product.reviews.map((r, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-charcoal/5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} size={14} className={idx < r.rating ? "fill-gold text-gold" : "text-slate/30"} />
                ))}
              </div>
              <span className="text-sm font-semibold text-charcoal">{r.userName || "Verified Buyer"}</span>
            </div>
            <p className="text-sm text-slate leading-relaxed">{r.comment}</p>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 bg-cream-dark/30 rounded-2xl">
        <Star size={40} className="text-slate/30 mx-auto mb-4" />
        <p className="text-sm text-slate">No reviews yet. Be the first to review this product!</p>
      </div>
    )}
  </div>
  )}
 </motion.div>
 </AnimatePresence>
 </div>

 {/* Size Guide Modal */}
  {isSizeGuideOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-4 right-4 p-2 text-slate hover:text-charcoal bg-slate/10 hover:bg-slate/20 rounded-full transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-playfair)] text-charcoal mb-2">Size Guide</h2>
        <p className="text-sm text-slate mb-6">Measurements are in inches. Please allow ± 0.5" tolerance.</p>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate/5 text-charcoal border-b border-charcoal/10">
              <tr>
                <th className="py-3 px-4 font-semibold">Size</th>
                <th className="py-3 px-4 font-semibold">Bust</th>
                <th className="py-3 px-4 font-semibold">Waist</th>
                <th className="py-3 px-4 font-semibold">Hip</th>
                <th className="py-3 px-4 font-semibold">Shoulder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 text-charcoal">
              <tr className="hover:bg-slate/5 transition-colors">
                <td className="py-3 px-4 font-bold">XS</td>
                <td className="py-3 px-4">32</td>
                <td className="py-3 px-4">26</td>
                <td className="py-3 px-4">34</td>
                <td className="py-3 px-4">13.5</td>
              </tr>
              <tr className="hover:bg-slate/5 transition-colors">
                <td className="py-3 px-4 font-bold">S</td>
                <td className="py-3 px-4">34</td>
                <td className="py-3 px-4">28</td>
                <td className="py-3 px-4">36</td>
                <td className="py-3 px-4">14</td>
              </tr>
              <tr className="hover:bg-slate/5 transition-colors">
                <td className="py-3 px-4 font-bold">M</td>
                <td className="py-3 px-4">36</td>
                <td className="py-3 px-4">30</td>
                <td className="py-3 px-4">38</td>
                <td className="py-3 px-4">14.5</td>
              </tr>
              <tr className="hover:bg-slate/5 transition-colors">
                <td className="py-3 px-4 font-bold">L</td>
                <td className="py-3 px-4">38.5</td>
                <td className="py-3 px-4">32.5</td>
                <td className="py-3 px-4">40.5</td>
                <td className="py-3 px-4">15</td>
              </tr>
              <tr className="hover:bg-slate/5 transition-colors">
                <td className="py-3 px-4 font-bold">XL</td>
                <td className="py-3 px-4">41</td>
                <td className="py-3 px-4">35</td>
                <td className="py-3 px-4">43</td>
                <td className="py-3 px-4">15.5</td>
              </tr>
              <tr className="hover:bg-slate/5 transition-colors">
                <td className="py-3 px-4 font-bold">XXL</td>
                <td className="py-3 px-4">43.5</td>
                <td className="py-3 px-4">37.5</td>
                <td className="py-3 px-4">45.5</td>
                <td className="py-3 px-4">16</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )}

 {/* Related Products */}
 {related.length > 0 && (
 <section className="mt-16 md:mt-20">
 <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-charcoal mb-8">
 You May Also Like
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
 {related.map((p, i) => (
 <ProductCard key={p.id} product={p} index={i} />
 ))}
 </div>
 </section>
 )}

 {/* Lightbox Modal */}
 <AnimatePresence>
   {isLightboxOpen && (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl"
       onClick={() => setIsLightboxOpen(false)}
     >
       <button 
         onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
         className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full z-50"
       >
         <X size={24} />
       </button>
       
       {product.images && product.images.length > 0 && (
         <motion.div 
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           exit={{ scale: 0.95, opacity: 0 }}
           transition={{ type: "spring", damping: 25, stiffness: 300 }}
           className="relative w-[100vw] h-[100vh] flex items-center justify-center p-4 md:p-12"
           onClick={(e) => e.stopPropagation()}
         >
           <div className="relative w-full h-full max-w-5xl max-h-[85vh]">
             <Image
               src={product.images[selectedImage]?.url || product.images[0].url}
               alt={product.name}
               fill
               className="object-contain"
               quality={100}
               priority
             />
           </div>
           
           {/* Lightbox Thumbnails */}
           {product.images.length > 1 && (
             <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-x-auto max-w-[90vw] shadow-2xl">
               {product.images.map((img, i) => (
                 <div
                   key={img.id}
                   onClick={() => setSelectedImage(i)}
                   className={cn(
                     "relative w-16 h-16 md:w-20 md:h-20 rounded-xl flex-shrink-0 flex items-center justify-center cursor-pointer border-2 transition-all overflow-hidden",
                     i === selectedImage ? "border-teal-400 opacity-100 ring-4 ring-teal-400/20" : "border-transparent opacity-50 hover:opacity-100"
                   )}
                 >
                   <Image src={img.url} alt="thumbnail" fill className="object-cover" />
                 </div>
               ))}
             </div>
           )}
         </motion.div>
       )}
     </motion.div>
   )}
 </AnimatePresence>
 </div>
 );
}
