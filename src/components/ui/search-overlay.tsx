"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, Clock } from "lucide-react";
import { useUIStore } from "@/store";
import { searchProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

export function SearchOverlay() {
 const { isSearchOpen, closeSearch } = useUIStore();
 const [query, setQuery] = useState("");
 const [results, setResults] = useState<Product[]>([]);
 const inputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 if (isSearchOpen) {
 setTimeout(() => inputRef.current?.focus(), 200);
 } else {
 setQuery("");
 setResults([]);
 }
 }, [isSearchOpen]);

 useEffect(() => {
 if (query.length >= 2) {
 setResults(searchProducts(query).slice(0, 6));
 } else {
 setResults([]);
 }
 }, [query]);

 const trending = ["Banarasi Silk", "Linen Shirt", "Jaipuri Print", "Lehenga", "Khadi"];

 return (
 <AnimatePresence>
 {isSearchOpen && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
 onClick={closeSearch}
 >
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 transition={{ type: "spring", damping: 25 }}
 className="max-w-2xl mx-auto mt-0 md:mt-28 w-full md:w-auto h-[100dvh] md:h-auto bg-cream md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 {/* Search Input */}
 <div className="flex items-center gap-3 px-4 py-4 border-b border-charcoal/10">
 <div className="flex-1 flex items-center gap-2 shadow-neo-input bg-cream rounded-xl px-4 py-2.5 transition-colors">
 <Search size={18} className="text-teal-600 shrink-0" />
 <input
 ref={inputRef}
 type="text"
 placeholder="Search for sarees, fabrics, shirts..."
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 className="flex-1 bg-transparent text-charcoal text-base placeholder:text-slate/50 !outline-none !ring-0 !border-0 focus:!border-transparent p-0"
 />
 </div>
 <button onClick={closeSearch} className="p-2 text-slate hover:text-charcoal transition-colors">
 <X size={24} strokeWidth={1.5} />
 </button>
 </div>

 {/* Results / Suggestions */}
 <div 
 className="flex-1 max-h-none md:max-h-[60vh] overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden"
 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
 >
 {results.length > 0 ? (
 <div className="space-y-2">
 <p className="text-xs font-medium text-slate uppercase tracking-wider mb-3">
 {results.length} results found
 </p>
 {results.map((product) => (
 <Link
 key={product.id}
 href={`/product/${product.slug}`}
 onClick={closeSearch}
 className="flex items-center gap-4 p-3 rounded-xl hover:bg-teal-50/60 :bg-teal-900/10 transition-colors group"
 >
 <div className="w-14 h-14 rounded-lg bg-cream-dark flex items-center justify-center text-2xl shrink-0">
 🧵
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium text-charcoal truncate group-hover:text-teal-600 :text-teal-400 transition-colors">
 {product.name}
 </p>
 <p className="text-xs text-slate truncate">
 {product.fabric} • {product.shortDescription}
 </p>
 </div>
 <div className="text-right shrink-0">
 <p className="text-sm font-semibold text-teal-600 ">
 {formatPrice(product.salePrice || product.basePrice)}
 </p>
 {product.salePrice && (
 <p className="text-xs text-slate line-through">
 {formatPrice(product.basePrice)}
 </p>
 )}
 </div>
 </Link>
 ))}
 </div>
 ) : query.length > 0 && query.length < 2 ? (
 <p className="text-sm text-slate text-center py-8">
 Type at least 2 characters to search...
 </p>
 ) : query.length >= 2 ? (
 <p className="text-sm text-slate text-center py-8">
 No results for &ldquo;{query}&rdquo;. Try a different search.
 </p>
 ) : (
 <div className="space-y-6">
 {/* Trending */}
 <div>
 <p className="flex items-center gap-2 text-xs font-medium text-slate uppercase tracking-wider mb-3">
 <TrendingUp size={14} /> Trending Now
 </p>
 <div className="flex flex-wrap gap-2">
 {trending.map((term) => (
 <button
 key={term}
 onClick={() => setQuery(term)}
 className="px-3 py-1.5 text-sm bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 :bg-teal-900/30 transition-colors"
 >
 {term}
 </button>
 ))}
 </div>
 </div>

 {/* Popular Categories */}
 <div>
 <p className="flex items-center gap-2 text-xs font-medium text-slate uppercase tracking-wider mb-3">
 <Clock size={14} /> Popular Categories
 </p>
 <div className="grid grid-cols-2 gap-2">
 {["Women's Sarees", "Men's Shirts", "Premium Fabrics", "Ethnic Wear"].map((cat) => (
 <Link
 key={cat}
 href="/shop"
 onClick={closeSearch}
 className="px-4 py-3 text-sm font-medium text-charcoal bg-cream-dark rounded-xl hover:bg-teal-50 :bg-teal-900/20 transition-colors text-center"
 >
 {cat}
 </Link>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
