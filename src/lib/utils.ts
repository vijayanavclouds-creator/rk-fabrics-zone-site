import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
 return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
 return new Intl.NumberFormat("en-IN", {
 style: "currency",
 currency: "INR",
 minimumFractionDigits: 0,
 maximumFractionDigits: 0,
 }).format(price);
}

export function calculateDiscount(original: number, sale: number): number {
 return Math.round(((original - sale) / original) * 100);
}

export function slugify(text: string): string {
 return text
 .toLowerCase()
 .replace(/[^\w ]+/g, "")
 .replace(/ +/g, "-");
}

export function truncate(str: string, length: number): string {
 return str.length > length ? str.substring(0, length) + "..." : str;
}
