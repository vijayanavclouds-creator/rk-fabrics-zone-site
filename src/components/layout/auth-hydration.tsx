"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useWishlistStore } from "@/store"
import { syncWishlist } from "@/actions/wishlist"

export function AuthHydration() {
  const { data: session, status } = useSession()
  const { items, setItems } = useWishlistStore()

  useEffect(() => {
    // Only run when session is authenticated
    if (status === "authenticated" && session?.user) {
      const syncData = async () => {
        // Sync local Zustand items with DB
        const result = await syncWishlist(items)
        if (result.success && result.items) {
          // If the arrays are different in length or content, update local store
          // (This prevents infinite update loops)
          const isDifferent = 
            result.items.length !== items.length || 
            !result.items.every((id: string) => items.includes(id));
            
          if (isDifferent) {
            setItems(result.items)
          }
        }
      }
      syncData()
    }
  }, [status, session, setItems]) // Intentionally omitting 'items' to run only on auth status change

  return null
}
