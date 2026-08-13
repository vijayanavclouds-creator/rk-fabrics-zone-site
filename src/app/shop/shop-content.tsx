"use client";

import React, { useState, useMemo, useEffect, Fragment } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Grid3X3, LayoutGrid, X, ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export interface TaxonomyOption {
  value: string;
  label: string;
  subcategories?: TaxonomyOption[];
}

const sortOptions = [
 { value: "newest", label: "Newest First" },
 { value: "price-low", label: "Price: Low to High" },
 { value: "price-high", label: "Price: High to Low" },
 { value: "popular", label: "Most Popular" },
 { value: "rating", label: "Highest Rated" },
];
export function ShopContent({ 
  products, 
  categories 
}: { 
  products: Product[], 
  categories: TaxonomyOption[] 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");


 const [sortBy, setSortBy] = useState("newest");
 const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
 const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
 const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
 const [selectedDiscount, setSelectedDiscount] = useState<number>(0);
 const [priceRange, setPriceRange] = useState<[number, number]>([0, 25000]);
 const [showFilters, setShowFilters] = useState(false);
 const [gridCols, setGridCols] = useState<3 | 5 | 7>(5);
 const [isSortOpen, setIsSortOpen] = useState(false);
 const [initialParams, setInitialParams] = useState<string>("");

  const handleToggleFilters = () => {
    if (showFilters) {
      setShowFilters(false);
    } else {
      setInitialParams(searchParams.toString());
      setShowFilters(true);
    }
  };

  const handleCloseFiltersWithoutSaving = () => {
    router.replace(`${pathname}?${initialParams}`, { scroll: false });
    setShowFilters(false);
  };

  const handleShowResults = () => {
    setShowFilters(false);
  };

  const featuresParam = searchParams.get("features");
  const discountParam = searchParams.get("discount");

  useEffect(() => {
    if (categoryParam) {
      const cats = categoryParam.split(',');
      // eslint-disable-next-line
      setSelectedCategories(cats);
      // eslint-disable-next-line
      setExpandedCategories(prev => Array.from(new Set([...prev, ...cats])));
    } else {
      // eslint-disable-next-line
      setSelectedCategories([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParam]);



  useEffect(() => {
    let features: string[] = [];
    if (featuresParam) {
      features = featuresParam.split(',');
    }
    
    // Support legacy URL parameters
    if (filterParam === "new" && !features.includes("new_arrival")) features.push("new_arrival");
    if (filterParam === "sale" && !features.includes("on_sale")) features.push("on_sale");
    
    // eslint-disable-next-line
    setSelectedFeatures(features);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuresParam, filterParam]);

  useEffect(() => {
    // eslint-disable-next-line
    if (discountParam) setSelectedDiscount(parseInt(discountParam) || 0);
    // eslint-disable-next-line
    else setSelectedDiscount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountParam]);

 const filteredProducts = useMemo(() => {
 let result = [...products];

  // Category filter
  if (selectedCategories.length > 0) {
    result = result.filter((p) => {
      const pCats: string[] = [];
      try { if (p.category) { const parsed = JSON.parse(p.category as string); if (Array.isArray(parsed)) { pCats.push(...parsed); } else { pCats.push(p.category as string); } } } catch(e) { if (p.category) pCats.push(p.category as string); }
      try { if (p.subcategory) { const parsed = JSON.parse(p.subcategory as string); if (Array.isArray(parsed)) { pCats.push(...parsed); } else { pCats.push(p.subcategory as string); } } } catch(e) { if (p.subcategory) pCats.push(p.subcategory as string); }
      try { if (p.subSubcategory) { const parsed = JSON.parse(p.subSubcategory as string); if (Array.isArray(parsed)) { pCats.push(...parsed); } else { pCats.push(p.subSubcategory as string); } } } catch(e) { if (p.subSubcategory) pCats.push(p.subSubcategory as string); }
      // Helper to get all descendant values for a selected category
      const getFamilyValues = (catValue: string): string[] => {
        const family = [catValue];
        const mainCat = categories.find((c: TaxonomyOption) => c.value === catValue);
        if (mainCat) {
          mainCat.subcategories?.forEach((sub: TaxonomyOption) => {
            family.push(sub.value);
            sub.subcategories?.forEach((subSub: TaxonomyOption) => family.push(subSub.value));
          });
          return family;
        }
        for (const main of categories) {
          const subCat = main.subcategories?.find((s: TaxonomyOption) => s.value === catValue);
          if (subCat) {
            subCat.subcategories?.forEach((subSub: TaxonomyOption) => family.push(subSub.value));
            return family;
          }
        }
        return family;
      };

      // If a parent and child are both selected, only apply the child's filter
      const effectiveCategories = selectedCategories.filter(sc => {
        const family = getFamilyValues(sc);
        const descendants = family.slice(1);
        return !selectedCategories.some(otherSc => descendants.includes(otherSc));
      });

      return effectiveCategories.some(sc => {
        const familyValues = getFamilyValues(sc);
        
        const hasCategory = familyValues.some(val => pCats.includes(val) || pCats.some(c => typeof c === 'string' && c.startsWith(val)));
        
        const hasFabric = p.fabric && familyValues.some(val => {
          const normalizedVal = val.toLowerCase().replace(/-/g, ' ');
          const normalizedFabric = p.fabric.toLowerCase().replace(/-/g, ' ');
          return normalizedFabric.includes(normalizedVal);
        });
        
        return hasCategory || hasFabric;
      });
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
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [sortBy, selectedCategories, selectedFeatures, selectedDiscount, priceRange, filterParam, products]);

  const updateUrl = (key: string, values: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (values.length > 0) {
      params.set(key, values.join(','));
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategoryClick = (catValue: string, isMainOrSub: boolean = false) => {
    const hasSelectedChild = () => {
      const mainCat = categories.find((c: TaxonomyOption) => c.value === catValue);
      if (mainCat) {
        return mainCat.subcategories?.some((sub: TaxonomyOption) => 
          selectedCategories.includes(sub.value) || 
          sub.subcategories?.some((ss: TaxonomyOption) => selectedCategories.includes(ss.value))
        );
      }
      for (const main of categories) {
        const subCat = main.subcategories?.find((s: TaxonomyOption) => s.value === catValue);
        if (subCat) {
          return subCat.subcategories?.some((ss: TaxonomyOption) => selectedCategories.includes(ss.value));
        }
      }
      return false;
    };

    if (isMainOrSub && hasSelectedChild()) {
      setExpandedCategories(prev => 
        prev.includes(catValue) ? prev.filter(c => c !== catValue) : [...prev, catValue]
      );
    } else {
      const next = selectedCategories.includes(catValue) 
        ? selectedCategories.filter((c) => c !== catValue) 
        : [...selectedCategories, catValue];
      setSelectedCategories(next);
      updateUrl('category', next);
      
      if (!selectedCategories.includes(catValue)) {
        setExpandedCategories(prev => Array.from(new Set([...prev, catValue])));
      } else {
        setExpandedCategories(prev => prev.filter(c => c !== catValue));
      }
    }
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

    setSelectedFeatures([]);
    setSelectedDiscount(0);
    setPriceRange([0, 25000]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');

    params.delete('features');
    params.delete('discount');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

 const hasActiveFilters = selectedCategories.length > 0 || selectedFeatures.length > 0 || selectedDiscount > 0 || priceRange[0] > 0 || priceRange[1] < 25000;

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
 <div className="flex items-center justify-between mb-6 gap-2 md:gap-4">
 <div className="flex items-center gap-1.5 md:gap-2">
  {/* Filter Toggle */}
  <button
  onClick={handleToggleFilters}
  className={cn(
  "btn-primary !py-2 md:!py-2.5 !px-2.5 md:!px-4 flex items-center gap-1.5 md:gap-2 text-[11px] md:text-sm font-medium transition-all whitespace-nowrap",
  showFilters ? "shadow-neo-pressed scale-[0.97]" : ""
  )}
  >
  <SlidersHorizontal size={14} className="w-3.5 h-3.5 md:w-4 md:h-4" />
  Filters
  {hasActiveFilters && (
  <span className="w-4 h-4 md:w-5 md:h-5 bg-gold text-white text-[9px] md:text-[10px] font-bold rounded-full flex items-center justify-center">
  {selectedCategories.length + selectedFeatures.length + (selectedDiscount > 0 ? 1 : 0)}
  </span>
  )}
  </button>

  {/* Clear Filters */}
  {hasActiveFilters && (
  <button
  onClick={clearFilters}
  className="flex items-center gap-1 px-1.5 md:px-2 py-2 md:py-2.5 rounded-xl text-[11px] md:text-xs font-medium text-rose hover:bg-rose/5 transition-colors whitespace-nowrap"
  >
  <X size={12} className="md:w-[14px] md:h-[14px]" /> Clear All
  </button>
  )}
  </div>

  <div className="flex items-center gap-1.5 md:gap-3">
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
        className="btn-primary !py-2 md:!py-2.5 !px-2.5 md:!px-4 flex items-center gap-1.5 md:gap-2 text-[11px] md:text-sm font-medium transition-all whitespace-nowrap"
      >
        {sortOptions.find((opt) => opt.value === sortBy)?.label}
        <ChevronDown size={14} className={cn("transition-transform w-3.5 h-3.5 md:w-4 md:h-4", isSortOpen && "rotate-180")} />
      </button>
    
    {isSortOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute right-0 top-full mt-1.5 w-32 md:w-48 bg-white border border-charcoal/10 rounded-xl shadow-lg shadow-charcoal/5 py-1 md:py-1.5 z-50 overflow-hidden"
      >
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setSortBy(opt.value);
              setIsSortOpen(false);
            }}
            className={cn(
              "w-full text-left px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-sm transition-colors",
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
 <div className="bg-white rounded-2xl p-5 border border-charcoal/5 space-y-2">
   {categories.map((cat: TaxonomyOption) => (
     <div key={cat.value}>
       <button 
         onClick={() => handleCategoryClick(cat.value, true)}
         className={cn(
           "text-left w-full font-semibold text-sm transition-colors",
           selectedCategories.includes(cat.value) ? "text-emerald-600" : "text-charcoal hover:text-emerald-600"
         )}
       >
         {cat.label}
       </button>
       {expandedCategories.includes(cat.value) && (
          <div className="space-y-2 pl-6 mt-2">
            {cat.subcategories?.map((sub: TaxonomyOption) => (
              <div key={sub.value}>
                <div className="flex items-center group">
                  <label className="flex items-center gap-2 cursor-pointer text-sm w-full">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(sub.value)}
                      onChange={() => handleCategoryClick(sub.value, true)}
                      className="rounded border-charcoal/20 text-emerald-600 focus:ring-emerald-600 w-4 h-4"
                    />
                    <span className={cn(
                      "transition-colors",
                      selectedCategories.includes(sub.value) ? "text-emerald-700 font-medium" : "text-charcoal group-hover:text-emerald-600"
                    )}>{sub.label}</span>
                  </label>
                </div>
                {expandedCategories.includes(sub.value) && sub.subcategories && (
                  <div className="space-y-1 pl-6 mt-1.5 border-l-2 border-emerald-100/50">
                    {sub.subcategories.map((subSub: TaxonomyOption) => (
                     <button
                       key={subSub.value}
                       onClick={() => handleCategoryClick(subSub.value, false)}
                       className={cn(
                         "text-left w-full text-sm transition-colors block py-1",
                         selectedCategories.includes(subSub.value) ? "text-emerald-600 font-medium" : "text-slate hover:text-emerald-600"
                       )}
                     >
                       {subSub.label}
                     </button>
                   ))}
                 </div>
               )}
             </div>
           ))}
         </div>
       )}
     </div>
   ))}
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
       <button
         key={feat.id}
         onClick={() => toggleFeature(feat.id)}
         className={cn(
           "text-left w-full text-sm transition-colors",
           selectedFeatures.includes(feat.id) ? "text-emerald-600 font-medium" : "text-slate hover:text-emerald-600"
         )}
       >
         {feat.label}
       </button>
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
        <button
          key={disc.value}
          onClick={() => updateDiscount(selectedDiscount === disc.value ? 0 : disc.value)}
          className={cn(
            "text-left w-full text-sm transition-colors",
            selectedDiscount === disc.value ? "text-emerald-600 font-medium" : "text-slate hover:text-emerald-600"
          )}
        >
          {disc.label}
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
      <button onClick={handleCloseFiltersWithoutSaving} className="p-2 -mr-2 text-charcoal hover:bg-slate-200 rounded-full transition-colors">
        <X size={20} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      <div>
        <h4 className="text-xs font-bold text-charcoal uppercase mb-3 tracking-wide">Categories</h4>
        <div className="space-y-4">
          {categories.map((cat: any) => (
            <div key={cat.value}>
              <div className="mb-2">
                <button
                  onClick={() => handleCategoryClick(cat.value, true)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold border transition-all",
                    selectedCategories.includes(cat.value)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-charcoal border-charcoal/10 hover:border-charcoal/30"
                  )}
                >
                  {cat.label}
                </button>
              </div>
              {expandedCategories.includes(cat.value) && (
                <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-charcoal/10 ml-4 mb-4">
                  {(cat.subcategories || []).map((sub: any) => (
                    <Fragment key={sub.value}>
                      <button
                        onClick={() => handleCategoryClick(sub.value, true)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                          selectedCategories.includes(sub.value)
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 border-charcoal/10 hover:border-charcoal/30"
                        )}
                      >
                        {sub.label}
                      </button>
                      
                      {expandedCategories.includes(sub.value) && (sub.subcategories || []).map((subSub: any) => (
                        <button
                          key={subSub.value}
                          onClick={() => handleCategoryClick(subSub.value, false)}
                          className={cn(
                            "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                            selectedCategories.includes(subSub.value)
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-50 text-slate-700 border-charcoal/10 hover:border-charcoal/30"
                          )}
                        >
                          {subSub.label}
                        </button>
                      ))}
                    </Fragment>
                  ))}
                </div>
              )}
            </div>
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
                  ? "bg-emerald-600 text-white border-emerald-600"
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
              onClick={() => updateDiscount(selectedDiscount === disc.value ? 0 : disc.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
                selectedDiscount === disc.value
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-charcoal/10 hover:border-charcoal/30"
              )}
            >
              {disc.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-charcoal uppercase mb-3 tracking-wide">Price Range</h4>
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
          <span className="font-medium text-teal-600">₹{priceRange[1].toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>

    <div className="p-4 bg-slate-50 border-t border-charcoal/10 mt-auto sticky bottom-0 z-10">
      <button
        onClick={handleShowResults}
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
