import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CheckoutAddress {
  id?: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
}

interface CheckoutStore {
  selectedAddress: CheckoutAddress | null
  setAddress: (address: CheckoutAddress) => void
  clearCheckout: () => void
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set) => ({
      selectedAddress: null,
      setAddress: (address) => set({ selectedAddress: address }),
      clearCheckout: () => set({ selectedAddress: null }),
    }),
    {
      name: "rk-fabrics-checkout",
    }
  )
)
