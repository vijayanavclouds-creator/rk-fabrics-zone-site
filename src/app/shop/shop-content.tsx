"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const sortOptions = [
 { value: "newest", label: "Newest First" },
 { value: "price-low", label: "Price: Low to High" },
 { value: "price-high", label: "Price: High to Low" },
 { value: "popular", label: "Most Popular" },
 { value: "rating", label: "Highest Rated" },
];

export function ShopContent({ 
  products, 
  categories, 
  fabricFilters 
}: { 
  products: any[], 
  categories: { id: string, name: string }[], 
  fabricFilters: { id: string, name: string }[] 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const fabricParam = searchParams.get("fabric");

 const [sortBy, setSortBy] = useState("newest");
 const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
 const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
 const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
 const [selectedDiscount, setSelectedDiscount] = useState<number>(0);
 const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
 const [showFilters, setShowFilters] = useState(false);
 const [gridCols, setGridCols] = useState<3 | 5 | 7>(5);
 const [isSortOpen, setIsSortOpen] = useState(false);

  const featuresParam = searchParams.get("features");
  const discountParam = searchParams.get("discount");

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (fabricParam) {
      setSelectedFabrics(fabricParam.split(','));
    } else {
      setSelectedFabrics([]);
    }
  }, [fabricParam]);

  useEffect(() => {
    let features: string[] = [];
    if (featuresParam) {
      features = featuresParam.split(',');
    }
    
    // Support legacy URL parameters
    if (filterParam === "new" && !features.includes("new_arrival")) features.push("new_arrival");
    if (filterParam === "sale" && !features.includes("on_sale")) features.push("on_sale");
    
    setSelectedFeatures(features);
  }, [featuresParam, filterParam]);

  useEffect(() => {
    if (discountParam) setSelectedDiscount(parseInt(discountParam) || 0);
    else setSelectedDiscount(0);
  }, [discountParam]);

 const filteredProducts = useMemo(() => {
 let result = [...products];

 // Category filter
 if (selectedCategories.length > 0) {
   result = result.filter((p) => {
     try {
       const pCats = JSON.parse(p.category);
       if (Array.isArray(pCats)) {
         return selectedCategories.some(sc => {
           if (sc === "women") return pCats.some(c => c.startsWith("women"));
           if (sc === "men") return pCats.some(c => c.startsWith("men"));
           return pCats.includes(sc);
         });
       }
     } catch(e) {}
     // fallback
     if (selectedCategories.includes("women")) return p.category.startsWith("women");
     if (selectedCategories.includes("men")) return p.category.startsWith("men");
     return selectedCategories.includes(p.category);
   });
 }

  // URL Filter (legacy support)
  if (filterParam === "new") {
    result = result.filter(p => p.isNewArrival === true);
  }
  if (filterParam === "sale") {
    result = result.filter(p => p.isOnSale === true);
  }

  // Features filter
  if (selectedFeatures.includes("free_delivery")) result = result.filter(p => p.isFreeDelivery);
  if (selectedFeatures.includes("new_arrival")) result = result.filter(p => p.isNewArrival);
  if (selectedFeatures.includes("bestseller")) result = result.filter(p => p.isBestseller);
  if (selectedFeatures.includes("featured")) result = result.filter(p => p.isFeatured);
  if (selectedFeatures.includes("on_sale")) result = result.filter(p => p.isOnSale);

  // Discount filter
  if (selectedDiscount > 0) {
    result = result.filter(p => p.discountPercent >= selectedDiscount);
  }

 // Fabric filter
 if (selectedFabrics.length > 0) {
 result = result.filter((p) =>
 selectedFabrics.some((f) => p.fabric.toLowerCase().includes(f.toLowerCase()))
 );
 }

 // Price filter
 result = result.filter((p) => {
 const price = p.salePrice || p.basePrice;
 return price >= priceRange[0] && price <= priceRange[1];
 });

 // Sort
 switch (sortBy) {
 case "price-low":
 result.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
 break;
 case "price-high":
 result.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
 break;
 case "popular":
 result.sort((a, b) => b.reviewCount - a.reviewCount);
 break;
 case "rating":
 result.sort((a, b) => b.rating - a.rating);
 break;
 default:
 result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
 }

 return result;
 }, [sortBy, selectedCategories, selectedFabrics, selectedFeatures, selectedDiscount, priceRange, filterParam]);

  const updateUrl = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(','));
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat) 
      ? selectedCategories.filter((c) => c !== cat) 
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    updateUrl('category', next);
  };

  const toggleFabric = (fab: string) => {
    const next = selectedFabrics.includes(fab) 
      ? selectedFabrics.filter((f) => f !== fab) 
      : [...selectedFabrics, fab];
    setSelectedFabrics(next);
    updateUrl('fabric', next);
  };

  const toggleFeature = (feat: string) => {
    const next = selectedFeatures.includes(feat) 
      ? selectedFeatures.filter((f) => f !== feat) 
      : [...selectedFeatures, feat];
    setSelectedFeatures(next);
    updateUrl('features', next);
  };

  const updateDiscount = (discount: number) => {
    setSelectedDiscount(discount);
    updateUrl('discount', discount > 0 ? [discount.toString()] : []);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedFabrics([]);
    setSelectedFeatures([]);
    setSelectedDiscount(0);
    setPriceRange([0, 25000]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('fabric');
    params.delete('features');
    params.delete('discount');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

 const hasActiveFilters = selectedCategories.length > 0 || selectedFabrics.length > 0 || selectedFeatures.length > 0 || selectedDiscount > 0 || priceRange[0] > 0 || priceRange[1] < 25000;

 return (
 <div className="w-full mx-auto px-4 md:px-6 lg:px-8 pt-4 pb-8 md:py-12">
 {/* Page Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-6 md:mb-8 flex flex-row items-baseline gap-3 flex-wrap"
 >
 <h1 className="font-[family-name:var(--font-playfair)] text-[22px] md:text-4xl font-bold text-charcoal">
 Our Exclusives
 </h1>
 <p className="text-sm text-slate">
 ({filteredProducts.length}/{products.length})
 </p>
 </motion.div>

 {/* Toolbar */}
 <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
 <div className="flex items-center gap-2">
 {/* Filter Toggle */}
 <button
 onClick={() => setShowFilters(!showFilters)}
 className={cn(
 "btn-primary !py-2.5 !px-4 flex items-center gap-2 text-sm font-medium transition-all",
 showFilters ? "shadow-neo-pressed scale-[0.97]" : ""
 )}
 >
 <SlidersHorizontal size={16} />
 Filters
 {hasActiveFilters && (
 <span className="w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
 {selectedCategories.length + selectedFabrics.length + selectedFeatures.length + (selectedDiscount > 0 ? 1 : 0)}
 </span>
 )}
 </button>

 {/* Clear Filters */}
 {hasActiveFilters && (
 <button
 onClick={clearFilters}
 className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium text-rose hover:bg-rose/5 transition-colors"
 >
 <X size={14} /> Clear All
 </button>
 )}
 </div>

 <div className="flex items-center gap-3">
 {/* Grid Toggle */}
 <div className="hidden md:flex items-center gap-1 btn-primary !p-1 !px-1.5">
 {([3, 5, 7] as const).map((cols) => (
 <button
 key={cols}
 onClick={() => setGridCols(cols)}
 className={cn(
 "p-1.5 rounded-xl transition-all flex items-center justify-center",
 gridCols === cols
 ? "shadow-neo-pressed text-teal-600 scale-[0.97]"
 : "text-slate hover:text-charcoal"
 )}
 >
 {cols === 3 ? <LayoutGrid size={16} /> : <Grid3X3 size={16} />}
 </button>
 ))}
 </div>

 {/* Sort */}
 <div className="relative">
    <button
      onClick={() => setIsSortOpen(!isSortOpen)}
      onBlur={() => setTimeout(() => setIsSortOpen(false), 150)}
      className="btn-primary !py-2.5 !px-4 flex items-center gap-2 text-sm font-medium transition-all"
    >
      {sortOptions.find((opt) => opt.value === sortBy)?.label}
      <ChevronDown size={14} className={cn("transition-transform", isSortOpen && "rotate-180")} />
    </button>
    
    {isSortOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute right-0 top-full mt-2 w-48 bg-white border border-charcoal/10 rounded-xl shadow-lg shadow-charcoal/5 py-1.5 z-50 overflow-hidden"
      >
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setSortBy(opt.value);
              setIsSortOpen(false);
            }}
            className={cn(
              "w-full text-left px-4 py-2 text-sm transition-colors",
              sortBy === opt.value
                ? "bg-teal-50 text-teal-700 font-medium"
                : "text-charcoal hover:bg-slate/5"
            )}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>
    )}
 </div>
 </div>
 </div>

 <div className="flex gap-6">
 {/* Sidebar Filters */}
 {showFilters && (
 <motion.aside
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 className="hidden md:block w-64 shrink-0"
 >
 <div className="sticky top-28 space-y-6">
 {/* Categories */}
 <div className="bg-white rounded-2xl p-5 border border-charcoal/5 ">
 <h3 className="font-semibold text-sm text-charcoal mb-3">Categories</h3>
 <div className="space-y-2">
 {categories.map((cat) => (
 <label
 key={cat.id}
 className="flex items-center gap-2.5 cursor-pointer group"
 >
 <input
 type="checkbox"
 checked={selectedCategories.includes(cat.id)}
 onChange={() => toggleCategory(cat.id)}
 className="w-4 h-4 rounded border-2 border-charcoal/20 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
 />
 <span className="text-sm text-slate group-hover:text-charcoal :text-dark-text transition-colors">
 {cat.name}
 </span>
 </label>
 ))}
 </div>
 </div>

 {/* Fabrics */}
 <div className="bg-white rounded-2xl p-5 border border-charcoal/5 ">
 <h3 className="font-semibold text-sm text-charcoal mb-3">Fabric Type</h3>
 <div className="flex flex-wrap gap-2">
 {fabricFilters.map((fab) => (
            <button
              key={fab.id}
              onClick={() => toggleFabric(fab.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                selectedFabrics.includes(fab.id)
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-transparent text-slate border-charcoal/10 hover:border-teal-500"
              )}
            >
              {fab.name}
            </button>
          ))}
 </div>
 </div>

 {/* Highlights */}
 <div className="bg-white rounded-2xl p-5 border border-charcoal/5 ">
   <h3 className="font-semibold text-sm text-charcoal mb-3">Highlights</h3>
   <div className="space-y-2">
     {[
       { id: "free_delivery", label: "Free Delivery" },
       { id: "new_arrival", label: "New Arrival" },
       { id: "bestseller", label: "Bestseller" },
       { id: "featured", label: "Featured" },
       { id: "on_sale", label: "On Sale" }
     ].map((feat) => (
       <label key={feat.id} className="flex items-center gap-2.5 cursor-pointer group">
         <input
           type="checkbox"
           checked={selectedFeatures.includes(feat.id)}
           onChange={() => toggleFeature(feat.id)}
           className="w-4 h-4 rounded border-2 border-charcoal/20 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
         />
         <span className="text-sm text-slate group-hover:text-charcoal transition-colors">
           {feat.label}
         </span>
       </label>
     ))}
   </div>
 </div>

 {/* Discount */}
 <div className="bg-white rounded-2xl p-5 border border-charcoal/5 ">
   <h3 className="font-semibold text-sm text-charcoal mb-3">Discount</h3>
   <div className="space-y-2">
     {[
       { value: 10, label: "10% or more" },
       { value: 20, label: "20% or more" },
       { value: 30, label: "30% or more" },
       { value: 40, label: "40% or more" },
       { value: 50, label: "50% or more" }
     ].map((disc) => (
       <label key={disc.value} className="flex items-center gap-2.5 cursor-pointer group">
         <input
           type="radio"
           name="discount"
           checked={selectedDiscount === disc.value}
           onChange={() => updateDiscount(disc.value)}
           className="w-4 h-4 rounded-full border-2 border-charcoal/20 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-600"
         />
         <span className="text-sm text-slate group-hover:text-charcoal transition-colors">
           {disc.label}
         </span>
       </label>
     ))}
     {selectedDiscount > 0 && (
       <button onClick={() => updateDiscount(0)} className="text-xs text-rose hover:underline mt-2">
         Clear Discount Filter
       </button>
     )}
   </div>
 </div>

 {/* Price Range */}
 <div className="bg-white rounded-2xl p-5 border border-charcoal/5 ">
 <h3 className="font-semibold text-sm text-charcoal mb-3">Price Range</h3>
 <input
 type="range"
 min="0"
 max="25000"
 step="500"
 value={priceRange[1]}
 onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
 className="w-full accent-teal-600"
 />
 <div className="flex justify-between text-xs text-slate mt-2">
 <span>₹0</span>
 <span className="font-medium text-teal-600 ">₹{priceRange[1].toLocaleString("en-IN")}</span>
 </div>
 </div>
 </div>
 </motion.aside>
 )}

 {/* Product Grid */}
 <div className="flex-1">
 {filteredProducts.length > 0 ? (
 <div
 className={cn(
 "grid gap-4 md:gap-6",
 `grid-cols-2`,
 gridCols === 3 && "md:grid-cols-3",
 gridCols === 5 && "md:grid-cols-5",
 gridCols === 7 && "md:grid-cols-7"
 )}
 >
 {filteredProducts.map((product, i) => (
 <ProductCard key={product.id} product={product} index={i} />
 ))}
 </div>
 ) : (
 <div className="text-center py-20">
 <span className="text-6xl block mb-4">🔍</span>
 <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-charcoal mb-2">
 No products found
 </h3>
 <p className="text-sm text-slate mb-4">
 Try adjusting your filters or search criteria
 </p>
 <button onClick={clearFilters} className="btn-primary">
 Clear All Filters
 </button>
 </div>
 )}
 </div>
 {/* Mobile Filter Sheet (Full Screen) */}
  {showFilters && (
  <div className="md:hidden fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-in slide-in-from-bottom-2 duration-300">
    <div className="flex items-center justify-between p-4 border-b border-charcoal/10">
      <h3 className="font-bold text-charcoal text-lg">Filters</h3>
      <button onClick={() => setShowFilters(false)} className="p-2 -mr-2 text-charcoal hover:bg-slate-200 rounded-full transition-colors">
        <X size={20} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div>
        <h4 className="text-xs font-bold text-charcoal uppercase mb-3 tracking-wide">Category</h4>
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                selectedCategories.includes(cat.id)
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-white text-slate-700 border-charcoal/10 hover:border-charcoal/30"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-charcoal uppercase mb-3 tracking-wide">Fabric</h4>
        <div className="flex flex-wrap gap-2">
          {fabricFilters.map((fab) => (
            <button
              key={fab.id}
              onClick={() => toggleFabric(fab.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                selectedFabrics.includes(fab.id)
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-white text-slate-700 border-charcoal/10 hover:border-charcoal/30"
              )}
            >
              {fab.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-charcoal uppercase mb-3 tracking-wide">Highlights</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "free_delivery", label: "Free Delivery" },
            { id: "new_arrival", label: "New Arrival" },
            { id: "bestseller", label: "Bestseller" },
            { id: "featured", label: "Featured" },
            { id: "on_sale", label: "On Sale" }
          ].map((feat) => (
            <button
              key={feat.id}
              onClick={() => toggleFeature(feat.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                selectedFeatures.includes(feat.id)
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-white text-slate-700 border-charcoal/10 hover:border-charcoal/30"
              )}
            >
              {feat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-charcoal uppercase mb-3 tracking-wide">Discount</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 10, label: "10%+" },
            { value: 20, label: "20%+" },
            { value: 30, label: "30%+" },
            { value: 40, label: "40%+" },
            { value: 50, label: "50%+" }
          ].map((disc) => (
            <button
              key={disc.value}
              onClick={() => updateDiscount(disc.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                selectedDiscount === disc.value
                  ? "bg-charcoal text-white border-charcoal"
                  : "bg-white text-slate-700 border-charcoal/10 hover:border-charcoal/30"
              )}
            >
              {disc.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="p-4 bg-slate-50 border-t border-charcoal/10 mt-auto sticky bottom-0 z-10">
      <button
        onClick={() => setShowFilters(false)}
        className="btn-primary w-full py-4 text-base shadow-xl shadow-teal-600/20"
      >
        Show {filteredProducts.length} Results
      </button>
    </div>
  </div>
  )}
  </div>
  </div>
 );
}
