// Product types for RK Fabrics Zone
export interface Product {
 id: string;
 name: string;
 slug: string;
 description: string;
 shortDescription: string;
 category: Category;
 subcategory?: string;
 gender: "women" | "men" | "unisex";
 type: "readymade" | "fabric" | "unstitched";
 basePrice: number;
 salePrice: number | null;
 discountPercent: number;
 isOnSale: boolean;
 isFreeDelivery: boolean;
 variants: ProductVariant[];
 images: ProductImage[];
 fabric: string;
 fabricDetails?: string | null;
 occasion?: string[];
 tags: string[];
 rating: number;
 reviewCount: number;
 isFeatured: boolean;
 isNewArrival: boolean;
 isBestseller: boolean;
 createdAt: string;
 reviews?: { id?: string; userName: string; rating: number; comment: string; productId?: string; createdAt?: any; }[];
}

export interface ProductVariant {
 id: string;
 sku: string;
 size: string;
 color: string;
 colorHex: string;
 price: number;
 salePrice?: number | null;
 stock: number;
 productId?: string;
 images?: string[];
}

export interface ProductImage {
 id: string;
 url: string;
 alt: string;
 isPrimary: boolean;
 productId?: string;
}

export type Category =
 | "women-ethnic"
 | "women-western"
 | "men-formal"
 | "men-casual"
 | "men-ethnic"
 | "fabrics"
 | "unstitched"
 | "accessories"
 | string;

export interface CategoryInfo {
 id: Category;
 name: string;
 slug: string;
 description: string;
 image: string;
 productCount: number;
}

export interface CartItem {
 product: Product;
 variant: ProductVariant;
 quantity: number;
}

export interface WishlistItem {
 productId: string;
 addedAt: string;
}

export interface User {
 id: string;
 name: string;
 email: string;
 phone?: string;
 avatar?: string;
 addresses: Address[];
 loyaltyPoints: number;
}

export interface Address {
 id: string;
 name: string;
 phone: string;
 line1: string;
 line2?: string;
 city: string;
 state: string;
 pincode: string;
 isDefault: boolean;
}

export interface Order {
 id: string;
 items: CartItem[];
 total: number;
 subtotal: number;
 shipping: number;
 discount: number;
 status: OrderStatus;
 paymentMethod: string;
 paymentStatus: "pending" | "paid" | "failed" | "refunded";
 address: Address;
 createdAt: string;
 updatedAt: string;
 trackingId?: string;
}

export type OrderStatus =
 | "placed"
 | "confirmed"
 | "processing"
 | "shipped"
 | "delivered"
 | "cancelled"
 | "returned";

export interface Review {
 id: string;
 userId: string;
 userName: string;
 rating: number;
 title: string;
 body: string;
 images?: string[];
 isVerified: boolean;
 createdAt: string;
 helpful: number;
}

export interface BlogPost {
 id: string;
 title: string;
 slug: string;
 excerpt: string;
 content: string;
 coverImage: string;
 category: string;
 author: string;
 readTime: number;
 createdAt: string;
 tags: string[];
}

export interface FilterState {
 categories: Category[];
 priceRange: [number, number];
 colors: string[];
 sizes: string[];
 fabrics: string[];
 occasions: string[];
 gender: string[];
 sortBy: "newest" | "price-low" | "price-high" | "popular" | "rating";
 inStock: boolean;
 onSale: boolean;
}
