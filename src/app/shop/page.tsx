"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { products, categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const sortOptions = [
 { value: "newest", label: "Newest First" },
 { value: "price-low", label: "Price: Low to High" },
 { value: "price-high", label: "Price: High to Low" },
 { value: "popular", label: "Most Popular" },
 { value: "rating", label: "Highest Rated" },
];

const fabricFilters = ["Silk", "Cotton", "Linen", "Khadi", "Georgette", "Chiffon", "Chanderi"];
const sizeFilters = ["S", "M", "L", "XL", "XXL", "Free Size", "Per Meter"];

function ShopContent() {
 const searchParams = useSearchParams();
 const categoryParam = searchParams.get("category");
 const filterParam = searchParams.get("filter");

 const [sortBy, setSortBy] = useState("newest");
 const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
 const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
 const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
 const [showFilters, setShowFilters] = useState(false);
 const [gridCols, setGridCols] = useState<2 | 3 | 4>(3);
 const [isSortOpen, setIsSortOpen] = useState(false);

 useEffect(() => {
   if (categoryParam) {
     setSelectedCategories([categoryParam]);
   } else {
     setSelectedCategories([]);
   }
 }, [categoryParam]);

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

 // URL Filter (New/Sale)
 if (filterParam === "new") {
   result = result.filter(p => p.isNewArrival === true);
 }
 if (filterParam === "sale") {
   result = result.filter(p => p.isOnSale === true);
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
 }, [sortBy, selectedCategories, selectedFabrics, priceRange, filterParam]);

 const toggleCategory = (cat: string) => {
 setSelectedCategories((prev) =>
 prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
 );
 };

 const toggleFabric = (fab: string) => {
 setSelectedFabrics((prev) =>
 prev.includes(fab) ? prev.filter((f) => f !== fab) : [...prev, fab]
 );
 };

 const clearFilters = () => {
 setSelectedCategories([]);
 setSelectedFabrics([]);
 setPriceRange([0, 25000]);
 };

 const hasActiveFilters = selectedCategories.length > 0 || selectedFabrics.length > 0 || priceRange[0] > 0 || priceRange[1] < 25000;

 return (
 <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
 {/* Page Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-8"
 >
 <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-charcoal mt-1">
 Our Exclusives
 </h1>
 <p className="text-sm text-slate mt-2">
 Showing {filteredProducts.length} of {products.length} products
 </p>
 </motion.div>

 {/* Toolbar */}
 <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
 <div className="flex items-center gap-2">
 {/* Filter Toggle */}
 <button
 onClick={() => setShowFilters(!showFilters)}
 className={cn(
 "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors",
 showFilters
 ? "bg-teal-600 text-white border-teal-600"
 : "bg-white text-charcoal border-charcoal/10 hover:border-teal-600"
 )}
 >
 <SlidersHorizontal size={16} />
 Filters
 {hasActiveFilters && (
 <span className="w-5 h-5 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
 {selectedCategories.length + selectedFabrics.length}
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
 <div className="hidden md:flex items-center gap-1 border border-charcoal/10 rounded-lg p-0.5">
 {([2, 3, 4] as const).map((cols) => (
 <button
 key={cols}
 onClick={() => setGridCols(cols)}
 className={cn(
 "p-2 rounded-md transition-colors",
 gridCols === cols
 ? "bg-teal-600 text-white"
 : "text-slate hover:text-charcoal :text-dark-text"
 )}
 >
 {cols === 2 ? <LayoutGrid size={16} /> : <Grid3X3 size={16} />}
 </button>
 ))}
 </div>

 {/* Sort */}
 <div className="relative">
    <button
      onClick={() => setIsSortOpen(!isSortOpen)}
      onBlur={() => setTimeout(() => setIsSortOpen(false), 150)}
      className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-xl text-sm font-medium bg-white border border-charcoal/10 text-charcoal focus:outline-none transition-colors hover:border-charcoal/20"
    >
      {sortOptions.find((opt) => opt.value === sortBy)?.label}
      <ChevronDown size={14} className={cn("text-slate transition-transform", isSortOpen && "rotate-180")} />
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
 key={fab}
 onClick={() => toggleFabric(fab)}
 className={cn(
 "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
 selectedFabrics.includes(fab)
 ? "bg-teal-600 text-white border-teal-600"
 : "bg-transparent text-slate border-charcoal/10 hover:border-teal-500"
 )}
 >
 {fab}
 </button>
 ))}
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
 gridCols === 2 && "md:grid-cols-2",
 gridCols === 3 && "md:grid-cols-3",
 gridCols === 4 && "md:grid-cols-4"
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
 </div>

 {/* Mobile Filter Sheet (Simplified) */}
 {showFilters && (
 <div className="md:hidden fixed inset-x-0 bottom-16 z-40 bg-cream border-t border-charcoal/10 rounded-t-2xl shadow-2xl p-4 max-h-[60vh] overflow-y-auto">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold text-charcoal ">Filters</h3>
 <button onClick={() => setShowFilters(false)} className="p-1 text-slate"><X size={20} /></button>
 </div>

 <div className="space-y-4">
 <div>
 <h4 className="text-xs font-medium text-slate uppercase mb-2">Category</h4>
 <div className="flex flex-wrap gap-2">
 {categories.slice(0, 6).map((cat) => (
 <button
 key={cat.id}
 onClick={() => toggleCategory(cat.id)}
 className={cn(
 "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
 selectedCategories.includes(cat.id)
 ? "bg-teal-600 text-white border-teal-600"
 : "bg-white text-slate border-charcoal/10 "
 )}
 >
 {cat.name}
 </button>
 ))}
 </div>
 </div>

 <div>
 <h4 className="text-xs font-medium text-slate uppercase mb-2">Fabric</h4>
 <div className="flex flex-wrap gap-2">
 {fabricFilters.map((fab) => (
 <button
 key={fab}
 onClick={() => toggleFabric(fab)}
 className={cn(
 "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
 selectedFabrics.includes(fab)
 ? "bg-teal-600 text-white border-teal-600"
 : "bg-white text-slate border-charcoal/10 "
 )}
 >
 {fab}
 </button>
 ))}
 </div>
 </div>
 </div>

 <button
 onClick={() => setShowFilters(false)}
 className="btn-primary w-full mt-4"
 >
 Show {filteredProducts.length} Results
 </button>
 </div>
 )}
 </div>
 );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}
