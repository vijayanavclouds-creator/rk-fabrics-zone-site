"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { globalAdminSearch } from "@/actions/admin";
import { searchProducts } from "@/lib/data";

export function InlineDesktopSearch() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Click outside to collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setQuery("");
        setResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle focus when expanded
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        if (isAdmin) {
          const res = await globalAdminSearch(query);
          if (res.success && res.results) {
            // Flatten admin results to look exactly identical
            let flatResults: any[] = [];
            if (res.results.products) flatResults.push(...res.results.products.map((p: any) => ({ ...p, type: 'product', href: '/admin?tab=list' })));
            if (res.results.orders) flatResults.push(...res.results.orders.map((o: any) => ({ ...o, name: `Order #${o.id.slice(-6).toUpperCase()}`, type: 'order', href: `/admin/orders/user/${o.userId || o.email || 'unknown'}` })));
            if (res.results.users) flatResults.push(...res.results.users.map((u: any) => ({ ...u, type: 'user', href: '/admin?tab=users' })));
            if (res.results.newsletters) flatResults.push(...res.results.newsletters.map((n: any) => ({ ...n, name: n.email, type: 'newsletter', href: '/admin?tab=newsletters' })));
            setResults(flatResults);
          }
        } else {
          // Customer search
          const res = searchProducts(query).slice(0, 5);
          setResults(res.map((p: any) => ({ ...p, type: 'product', href: `/product/${p.slug}` })));
        }
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isAdmin]);

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <motion.div
        layout
        initial={false}
        animate={{
          width: isExpanded ? 300 : 40,
          borderRadius: 9999,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`flex items-center overflow-hidden h-10 ${isExpanded ? 'btn-primary !p-0 !pl-4 !pr-1' : 'btn-icon cursor-pointer'}`}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="icon-only"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="w-full h-full flex items-center justify-center"
            >
              <Search size={18} className="text-slate-500 stroke-[1.5]" />
            </motion.div>
          ) : (
            <motion.div
              key="expanded-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center h-full gap-2 w-full"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent !border-none !outline-none !ring-0 focus:!ring-0 focus:!border-none focus:!outline-none text-sm text-charcoal placeholder:text-slate/60 w-full"
              />
              {isLoading ? (
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <button 
                  className="w-8 h-8 flex items-center justify-center shrink-0 text-slate-500 hover:text-teal-600 transition-colors"
                >
                  <Search size={18} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isExpanded && query.length >= 2 && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-[120%] left-0 w-full bg-white rounded-3xl shadow-neo-card border border-charcoal/5 p-4 z-50 flex flex-col gap-3"
          >
            {results.map((result, idx) => {
              const matchIndex = result.name.toLowerCase().indexOf(query.toLowerCase());
              const before = matchIndex >= 0 ? result.name.slice(0, matchIndex) : "";
              const match = matchIndex >= 0 ? result.name.slice(matchIndex, matchIndex + query.length) : "";
              const after = matchIndex >= 0 ? result.name.slice(matchIndex + query.length) : result.name;

              return (
                <Link
                  key={result.id || idx}
                  href={result.href}
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-3 group"
                >
                  <Search size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {matchIndex >= 0 ? (
                      <>
                        <span className="text-slate-400 font-normal">{before}</span>
                        <span className="text-slate-400 font-normal">{match}</span>
                        <span className="text-charcoal font-bold">{after}</span>
                      </>
                    ) : (
                      <span className="text-charcoal">{result.name}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
