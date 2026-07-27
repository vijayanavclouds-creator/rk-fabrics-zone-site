"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store";
import { syncCartToDb, fetchUserCart } from "@/actions/cart";
import { getGSTRates } from "@/actions/system";

export function CartSync() {
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const setItems = useCartStore((state) => state.setItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const setGSTRates = useCartStore((state) => state.setGSTRates);
  const isFirstRender = useRef(true);
  const previousSession = useRef<string | null>(null);

  // Fetch GST rates on mount
  useEffect(() => {
    getGSTRates().then((rates) => {
      setGSTRates(rates);
    }).catch(console.error);
  }, [setGSTRates]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && session.user.role !== "ADMIN") {
      const userEmail = session.user.email || "";

      // If user just logged in or session mounted
      if (previousSession.current !== userEmail) {
        previousSession.current = userEmail;
        
        // Fetch cart from DB
        fetchUserCart().then((res) => {
          if (res.success && res.items.length > 0) {
            // Simple logic: if local cart is empty, restore DB cart.
            // If local cart has items, we assume they added them while logged out 
            // and want to keep them (they will sync to DB shortly).
            if (useCartStore.getState().items.length === 0) {
              setItems(res.items);
            }
          }
        });
      }

      // Sync logic
      const shouldSync = !isFirstRender.current; 
      if (shouldSync) {
        const timer = setTimeout(() => {
          syncCartToDb(items);
        }, 2000);
        return () => clearTimeout(timer);
      }
      isFirstRender.current = false;
      
    } else if (status === "unauthenticated") {
      // If user just logged out
      if (previousSession.current !== null) {
        previousSession.current = null;
        clearCart();
        isFirstRender.current = true;
      }
    }
  }, [items, session, status]);

  return null; // This is a silent functional component
}
