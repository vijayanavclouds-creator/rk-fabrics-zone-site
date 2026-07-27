"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, User, ShoppingBag, Mail } from "lucide-react";
import { useUIStore } from "@/store";
import { globalAdminSearch } from "@/actions/admin";

export function AdminSearchOverlay() {
  const { isAdminSearchOpen, closeAdminSearch } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ products: [], users: [], orders: [], newsletters: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdminSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setQuery("");
      setResults({ products: [], users: [], orders: [], newsletters: [] });
    }
  }, [isAdminSearchOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const res = await globalAdminSearch(query);
        if (res.success) {
          setResults(res.results);
        }
        setIsLoading(false);
      } else {
        setResults({ products: [], users: [], orders: [], newsletters: [] });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const hasResults = results.products.length > 0 || results.users.length > 0 || results.orders.length > 0 || results.newsletters.length > 0;

  return (
    <AnimatePresence>
      {isAdminSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          onClick={closeAdminSearch}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25 }}
            className="max-w-3xl mx-auto mt-0 md:mt-28 w-full md:w-auto h-[100dvh] md:h-auto md:max-h-[80vh] bg-[#f8fafc] md:bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-4 md:py-5 bg-white border-b border-charcoal/10">
              <div className="flex-1 flex items-center h-10 gap-2 bg-[#F6FAFD] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),inset_-1px_-1px_3px_rgba(0,0,0,0.1),2px_2px_8px_rgba(0,0,0,0.05)] rounded-full px-3 border border-white/50 transition-colors focus-within:border-teal-200">
                <Search size={18} className="text-slate-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products, orders, users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-slate/60 !outline-none !ring-0 !border-0 focus:!border-transparent p-0 w-full"
                />
                {isLoading && <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin shrink-0"></div>}
              </div>
              <button onClick={closeAdminSearch} className="btn-icon" aria-label="Close">
                <X size={18} className="text-slate-500 stroke-[1.5]" />
              </button>
            </div>

            {/* Results */}
            <div 
              className="flex-1 max-h-none md:max-h-[60vh] overflow-y-auto p-4 md:p-6 space-y-6 [&::-webkit-scrollbar]:hidden bg-[#f8fafc] md:bg-white"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {query.length >= 2 && !hasResults && !isLoading && (
                <div className="text-center py-12 text-slate">
                  <Search size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="font-medium text-charcoal">No admin results found</p>
                  <p className="text-sm mt-1">Try a different name, email, or order ID.</p>
                </div>
              )}

              {query.length < 2 && (
                <div className="text-center py-12 text-slate">
                  <p className="font-medium">Type at least 2 characters to search globally.</p>
                </div>
              )}

              {results.orders?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ShoppingBag size={14} className="text-blue-500" /> Orders
                  </h3>
                  <div className="space-y-2">
                    {results.orders.map((order: any) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/user/${order.userId || order.email || 'unknown'}`}
                        onClick={closeAdminSearch}
                        className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-blue-50 transition-colors border border-charcoal/5"
                      >
                        <div>
                          <p className="text-sm font-bold text-charcoal">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-slate">{order.user?.name || order.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-charcoal">₹{order.totalAmount?.toLocaleString() || 0}</p>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-slate uppercase font-bold">{order.status}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.users?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User size={14} className="text-amber-500" /> Users
                  </h3>
                  <div className="space-y-2">
                    {results.users.map((user: any) => (
                      <Link
                        key={user.id}
                        href="/admin?tab=users"
                        onClick={closeAdminSearch}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-amber-50 transition-colors border border-charcoal/5"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-charcoal">{user.name || "Unnamed User"}</p>
                          <p className="text-xs text-slate">{user.email}</p>
                        </div>
                        {user.role === 'ADMIN' && (
                          <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase font-bold">Admin</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.products?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Package size={14} className="text-emerald-500" /> Products
                  </h3>
                  <div className="space-y-2">
                    {results.products.map((product: any) => (
                      <Link
                        key={product.id}
                        href="/admin?tab=list"
                        onClick={closeAdminSearch}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-emerald-50 transition-colors border border-charcoal/5"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden relative shrink-0">
                          {product.images && product.images[0] ? (
                            <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <Package size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-charcoal line-clamp-1">{product.name}</p>
                          <p className="text-xs text-slate capitalize">{product.category.replace('-', ' ')}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {results.newsletters?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Mail size={14} className="text-purple-500" /> Newsletter Subscribers
                  </h3>
                  <div className="space-y-2">
                    {results.newsletters.map((sub: any) => (
                      <Link
                        key={sub.id}
                        href="/admin?tab=newsletters"
                        onClick={closeAdminSearch}
                        className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-purple-50 transition-colors border border-charcoal/5"
                      >
                        <p className="text-sm font-medium text-charcoal">{sub.email}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded-full uppercase font-bold bg-emerald-100 text-emerald-700">
                          Subscribed
                        </span>
                      </Link>
                    ))}
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
