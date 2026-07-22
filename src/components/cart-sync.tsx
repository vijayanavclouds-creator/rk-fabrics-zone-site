"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store";
import { syncCartToDb } from "@/actions/cart";

export function CartSync() {
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const isFirstRender = useRef(true);
  const previousItemsLength = useRef(items.length);

  useEffect(() => {
    // Only sync for logged in customers
    if (session?.user && session.user.role !== "ADMIN") {
      // Avoid syncing on initial render if nothing changed, 
      // but if the cart was empty on server and local has items, we should sync.
      // To keep it simple, let's sync whenever items change after first render, 
      // or if items length > 0 on first render.
      
      const shouldSync = isFirstRender.current || items !== useCartStore.getState().items || previousItemsLength.current !== items.length;

      if (shouldSync) {
        // debounce slightly
        const timer = setTimeout(() => {
          syncCartToDb(items);
        }, 2000);
        
        isFirstRender.current = false;
        previousItemsLength.current = items.length;
        
        return () => clearTimeout(timer);
      }
    }
  }, [items, session]);

  return null; // This is a silent functional component
}
