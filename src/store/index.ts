import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";

interface CartStore {
 items: CartItem[];
 isOpen: boolean;
 addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
 removeItem: (variantId: string) => void;
 updateQuantity: (variantId: string, quantity: number) => void;
 clearCart: () => void;
 toggleCart: () => void;
 openCart: () => void;
 closeCart: () => void;
 getTotal: () => number;
 getSubtotal: () => number;
 getItemCount: () => number;
 getShipping: () => number;
 getPlatformFee: () => number;
 couponCode: string | null;
 discountAmount: number;
 applyCoupon: (code: string, discount: number) => void;
 removeCoupon: () => void;
 setItems: (items: CartItem[]) => void;
 gstRates: { threshold: number, belowThreshold: number, aboveThreshold: number, shippingFee: number, expressShippingFee?: number, platformFeePercent: number } | null;
 setGSTRates: (rates: { threshold: number, belowThreshold: number, aboveThreshold: number, shippingFee: number, expressShippingFee?: number, platformFeePercent: number }) => void;
 getGSTAmount: () => number;
 shippingMode: "Surface" | "Express";
 setShippingMode: (mode: "Surface" | "Express") => void;
}

export const useCartStore = create<CartStore>()(
 persist(
 (set, get) => ({
 items: [],
 isOpen: false,
 couponCode: null,
 discountAmount: 0,
 gstRates: null,
 shippingMode: "Surface",

 addItem: (product, variant, quantity = 1) => {
 set((state) => {
 const existingIndex = state.items.findIndex(
 (item) => item.variant.id === variant.id
 );

 if (existingIndex > -1) {
 const newItems = [...state.items];
 newItems[existingIndex] = {
 ...newItems[existingIndex],
 quantity: newItems[existingIndex].quantity + quantity,
 };
 return { items: newItems };
 }

 return {
 items: [...state.items, { product, variant, quantity }],
 };
 });
 },

 removeItem: (variantId) => {
 set((state) => ({
 items: state.items.filter((item) => item.variant.id !== variantId),
 }));
 },

 updateQuantity: (variantId, quantity) => {
 if (quantity <= 0) {
 get().removeItem(variantId);
 return;
 }
 set((state) => ({
 items: state.items.map((item) =>
 item.variant.id === variantId ? { ...item, quantity } : item
 ),
 }));
 },

 clearCart: () => set({ items: [], couponCode: null, discountAmount: 0, shippingMode: "Surface" }),
 setItems: (items) => set({ items }),
 toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
 openCart: () => set({ isOpen: true }),
 closeCart: () => set({ isOpen: false }),
 applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
 removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),
 setGSTRates: (rates) => set({ gstRates: rates }),
 setShippingMode: (mode) => set({ shippingMode: mode }),

 getSubtotal: () => {
 return get().items.reduce((total, item) => {
 const price = item.variant.salePrice || item.product.salePrice || item.variant.price || item.product.basePrice;
 return total + (price || 0) * item.quantity;
 }, 0);
 },

 getShipping: () => {
    const subtotal = get().getSubtotal();
    const mode = get().shippingMode;
    if (mode === "Express") {
      return get().gstRates?.expressShippingFee ?? 150;
    }
    const shippingFee = get().gstRates?.shippingFee ?? 79;
    return subtotal >= 999 ? 0 : shippingFee;
  },

  getPlatformFee: () => {
    const subtotal = get().getSubtotal();
    const percent = get().gstRates?.platformFeePercent ?? 2;
    return Math.round(subtotal * (percent / 100) * 100) / 100;
  },

 getGSTAmount: () => {
    const rates = get().gstRates || { threshold: 2500, belowThreshold: 5, aboveThreshold: 12, shippingFee: 79, platformFeePercent: 2 };
   let gstAmount = 0;
   const subtotal = get().getSubtotal();
   const discount = get().discountAmount;
      if (subtotal > 0) {
      get().items.forEach(item => {
        const originalPrice = item.variant.salePrice || item.product.salePrice || item.variant.price || item.product.basePrice;
        const itemTotal = (originalPrice || 0) * item.quantity;
        const itemWeight = itemTotal / subtotal;
        const itemDiscount = discount * itemWeight;
        const finalItemTotal = itemTotal - itemDiscount;
        const finalItemPrice = finalItemTotal / item.quantity;
        
        const rate = finalItemPrice <= rates.threshold ? rates.belowThreshold : rates.aboveThreshold;
        // Inclusive GST formula: GST = Total - (Total / (1 + (Rate/100)))
        gstAmount += finalItemTotal - (finalItemTotal / (1 + (rate / 100)));
      });
    }
    
    const platformFee = get().getPlatformFee();
    const shipping = get().getShipping();
    // Assuming 18% inclusive GST for shipping and platform fee
    gstAmount += (platformFee + shipping) - ((platformFee + shipping) / 1.18);
    
    return Math.round(gstAmount * 100) / 100;
  },

  getTotal: () => {
    const subtotal = Number(get().getSubtotal()) || 0;
    const shipping = Number(get().getShipping()) || 0;
    const platformFee = Number(get().getPlatformFee()) || 0;
    const discount = Number(get().discountAmount) || 0;
    
    const total = subtotal + shipping + platformFee;
    return Math.max(0, total - discount);
  },

 getItemCount: () => {
 return get().items.reduce((count, item) => count + item.quantity, 0);
 },
 }),
 {
 name: "rk-fabrics-cart",
 }
 )
);

// Wishlist Store
interface WishlistStore {
 items: string[];
 toggleItem: (productId: string) => void;
 isInWishlist: (productId: string) => boolean;
 clearWishlist: () => void;
 setItems: (items: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
 persist(
 (set, get) => ({
 items: [],

 toggleItem: (productId) => {
 set((state) => {
 if (state.items.includes(productId)) {
 return { items: state.items.filter((id) => id !== productId) };
 }
 return { items: [...state.items, productId] };
 });
 },

 isInWishlist: (productId) => {
 return get().items.includes(productId);
 },

 clearWishlist: () => set({ items: [] }),
 setItems: (items) => set({ items }),
 }),
 {
 name: "rk-fabrics-wishlist",
 }
 )
);

// UI Store
interface UIStore {
 isMobileMenuOpen: boolean;
 isSearchOpen: boolean;
 isAdminSearchOpen: boolean;
 toggleMobileMenu: () => void;
 toggleSearch: () => void;
 toggleAdminSearch: () => void;
 closeMobileMenu: () => void;
 closeSearch: () => void;
 closeAdminSearch: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
 isMobileMenuOpen: false,
 isSearchOpen: false,
 isAdminSearchOpen: false,
 toggleMobileMenu: () =>
 set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
 toggleSearch: () =>
 set((state) => ({ isSearchOpen: !state.isSearchOpen })),
 toggleAdminSearch: () =>
 set((state) => ({ isAdminSearchOpen: !state.isAdminSearchOpen })),
 closeMobileMenu: () => set({ isMobileMenuOpen: false }),
 closeSearch: () => set({ isSearchOpen: false }),
 closeAdminSearch: () => set({ isAdminSearchOpen: false }),
}));
