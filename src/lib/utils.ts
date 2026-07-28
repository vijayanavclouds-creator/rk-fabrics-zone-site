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

/**
 * Generates a human-readable diff string between two objects.
 * Useful for logging exactly what changed (old vs new values).
 */
export function generateDiffString(oldObj: any, newObj: any, excludeKeys: string[] = []): string {
  if (!oldObj || !newObj) return "";
  const changes: string[] = [];
  
  for (const key of Object.keys(newObj)) {
    if (excludeKeys.includes(key)) continue;
    
    let oldVal = oldObj[key];
    let newVal = newObj[key];
    
    // Convert arrays/objects to strings for comparison if needed
    const oldStr = typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal);
    const newStr = typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal);
    
    if (oldStr !== newStr && oldStr !== 'undefined') {
      // Format cleanly for boolean and empty values
      const formattedOld = oldVal === "" ? "empty" : (oldVal === true ? "Yes" : (oldVal === false ? "No" : oldVal));
      const formattedNew = newVal === "" ? "empty" : (newVal === true ? "Yes" : (newVal === false ? "No" : newVal));
      
      changes.push(`<b>${key}</b> from <i>${formattedOld}</i> to <i>${formattedNew}</i>`);
    }
  }
  
  return changes.length > 0 ? changes.join(', ') : "";
}
