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
 gstRates: { below1000: number, above1000: number, shipping: number } | null;
 setGSTRates: (rates: { below1000: number, above1000: number, shipping: number }) => void;
 getGSTAmount: () => number;
}

export const useCartStore = create<CartStore>()(
 persist(
 (set, get) => ({
 items: [],
 isOpen: false,
 couponCode: null,
 discountAmount: 0,
 gstRates: null,

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

 clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),
 setItems: (items) => set({ items }),
 toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
 openCart: () => set({ isOpen: true }),
 closeCart: () => set({ isOpen: false }),
 applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
 removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),
 setGSTRates: (rates) => set({ gstRates: rates }),

 getSubtotal: () => {
 return get().items.reduce((total, item) => {
 const price = item.variant.salePrice || item.variant.price;
 return total + price * item.quantity;
 }, 0);
 },

 getShipping: () => {
 const subtotal = get().getSubtotal();
 return subtotal >= 999 ? 0 : 79;
 },

 getPlatformFee: () => {
 const subtotal = get().getSubtotal();
 return Math.round(subtotal * 0.02 * 100) / 100; // 2% platform fee
 },

 getGSTAmount: () => {
   const rates = get().gstRates || { below1000: 5, above1000: 12, shipping: 18 };
   let gstAmount = 0;
   const subtotal = get().getSubtotal();
   const discount = get().discountAmount;
   
   if (subtotal > 0) {
     get().items.forEach(item => {
       const originalPrice = item.variant.salePrice || item.variant.price;
       const itemTotal = originalPrice * item.quantity;
       const itemWeight = itemTotal / subtotal;
       const itemDiscount = discount * itemWeight;
       const finalItemTotal = itemTotal - itemDiscount;
       const finalItemPrice = finalItemTotal / item.quantity;
       
       const rate = finalItemPrice <= 1000 ? rates.below1000 : rates.above1000;
       gstAmount += finalItemTotal * (rate / 100);
     });
   }
   
   const platformFee = get().getPlatformFee();
   const shipping = get().getShipping();
   gstAmount += (platformFee + shipping) * (rates.shipping / 100);
   
   return Math.round(gstAmount * 100) / 100;
 },

 getTotal: () => {
   const total = get().getSubtotal() + get().getShipping() + get().getPlatformFee() + get().getGSTAmount();
   return Math.max(0, total - get().discountAmount);
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
