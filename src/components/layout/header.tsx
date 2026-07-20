"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
 Search,
 ShoppingBag,
 Heart,
 User,
 Sun,
 Moon,
 Menu,
 X,
 ChevronDown,
 Phone,
 MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore, useWishlistStore, useUIStore } from "@/store";
import { SearchOverlay } from "@/components/ui/search-overlay";

const navLinks = [
 {
 label: "Women",
 href: "/shop?category=women-ethnic",
 submenu: [
 { label: "Sarees", href: "/shop?category=women-ethnic&sub=sarees" },
 { label: "Salwar Suits", href: "/shop?category=women-ethnic&sub=suits" },
 { label: "Lehengas", href: "/shop?category=women-ethnic&sub=lehengas" },
 { label: "Kurtis", href: "/shop?category=women-western&sub=kurtis" },
 { label: "Anarkali", href: "/shop?category=women-ethnic&sub=anarkali" },
 { label: "Dresses", href: "/shop?category=women-western" },
 ],
 },
 {
 label: "Men",
 href: "/shop?category=men-casual",
 submenu: [
 { label: "Formal Shirts", href: "/shop?category=men-formal" },
 { label: "Casual Shirts", href: "/shop?category=men-casual" },
 { label: "Kurtas", href: "/shop?category=men-ethnic" },
 { label: "Trousers", href: "/shop?category=men-formal&sub=trousers" },
 { label: "Sherwanis", href: "/shop?category=men-ethnic&sub=sherwanis" },
 ],
 },
 {
 label: "Fabrics",
 href: "/shop?category=fabrics",
 submenu: [
 { label: "Silk", href: "/shop?category=fabrics&sub=silk" },
 { label: "Cotton", href: "/shop?category=fabrics&sub=cotton" },
 { label: "Linen", href: "/shop?category=fabrics&sub=linen" },
 { label: "Khadi", href: "/shop?category=fabrics&sub=khadi" },
 { label: "Chiffon", href: "/shop?category=fabrics&sub=chiffon" },
 ],
 },
 { label: "New Arrivals", href: "/shop?filter=new" },
 { label: "Sale", href: "/shop?filter=sale" },
 { label: "Blog", href: "/blog" },
];

export function Header() {
 const pathname = usePathname();
 const { data: session } = useSession();
 const [scrolled, setScrolled] = useState(false);
 const [activeMenu, setActiveMenu] = useState<string | null>(null);
 const { theme, setTheme } = useTheme();
 const [mounted, setMounted] = useState(false);
 const { isSearchOpen, toggleSearch } = useUIStore();
 const cartItemCount = useCartStore((s) => s.getItemCount());
 const wishlistCount = useWishlistStore((s) => s.items.length);
 const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

 useEffect(() => {
 setMounted(true);
 const onScroll = () => setScrolled(window.scrollY > 20);
 window.addEventListener("scroll", onScroll, { passive: true });
 return () => window.removeEventListener("scroll", onScroll);
 }, []);

 return (
 <>
 {/* Announcement Bar */}
 <div className="w-full bg-charcoal text-white text-center text-xs md:text-sm py-2 px-4 font-medium relative z-50">
 <div className="flex items-center justify-center gap-2">
 <span className="hidden md:inline">🎉</span>
 <span>
 <strong>FREE SHIPPING</strong> on orders above ₹999 |{" "}
 <span className="text-gold-light font-semibold">FLAT 30% OFF</span> — Use code{" "}
 <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">RK30</span>
 </span>
 </div>
 </div>

 {/* Main Header */}
 <header
 className={cn(
 "sticky top-0 z-40 transition-all duration-500",
 scrolled
 ? "bg-cream shadow-neo-card"
 : "bg-cream/80 backdrop-blur-sm"
 )}
 >
 <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
 <div className="flex items-center justify-between h-14 md:h-16">
 {/* Logo */}
 <Link href="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
 <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-gold/30 group-hover:ring-gold transition-all duration-300">
 <Image
 src="/logo.png?v=3"
 alt="RK Fabrics Zone"
 fill
 className="object-cover"
 unoptimized
 priority
 />
 </div>
 <div className="hidden sm:block">
 <h1 className="font-[family-name:var(--font-playfair)] text-lg md:text-xl font-bold text-charcoal leading-none">
 RK Fabrics
 </h1>
 <div className="relative">
 <span className="font-[family-name:var(--font-cinzel)] text-[10px] md:text-xs tracking-[0.2em] text-gold-dark uppercase">
 Zone
 </span>
 <motion.div
 className="absolute -bottom-0.5 left-0 h-[1px] bg-gold"
 initial={{ width: 0 }}
 whileHover={{ width: "100%" }}
 transition={{ duration: 0.3 }}
 style={{ width: 0 }}
 />
 </div>
 </div>
 </Link>

 {/* Desktop Navigation */}
 <nav className="hidden md:flex items-center gap-1">
 {navLinks.map((link) => (
 <div
 key={link.label}
 className="relative"
 onMouseEnter={() => setActiveMenu(link.label)}
 onMouseLeave={() => setActiveMenu(null)}
 >
 <Link
 href={link.href}
 className={cn(
 "flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-colors rounded-lg",
 "text-charcoal hover:text-teal-600 :text-teal-400",
 link.label === "Sale" && "!text-rose dark:!text-rose"
 )}
 >
 {link.label}
 {link.submenu && <ChevronDown size={14} className="opacity-50" />}
 </Link>

 {/* Dropdown */}
 <AnimatePresence>
 {link.submenu && activeMenu === link.label && (
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 8 }}
 transition={{ duration: 0.2 }}
 className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl shadow-black/15 border border-charcoal/10 p-2"
 >
 {link.submenu.map((sub) => (
 <Link
 key={sub.label}
 href={sub.href}
 className="block px-3 py-2.5 text-sm font-medium text-charcoal hover:text-teal-600 :text-teal-400 hover:bg-teal-50 :bg-teal-900/20 rounded-lg transition-colors"
 >
 {sub.label}
 </Link>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ))}
 </nav>

 {/* Right Actions */}
 <div className="flex items-center gap-1 md:gap-2">
 {/* Search */}
 <button
 onClick={toggleSearch}
 className="p-2 text-charcoal/70 hover:text-teal-600 :text-teal-400 transition-colors"
 aria-label="Search"
 >
 <Search size={20} />
 </button>



 {/* Wishlist */}
 <Link
 href="/wishlist"
 className="hidden md:flex relative p-2 text-charcoal/70 hover:text-teal-600 :text-teal-400 transition-colors"
 aria-label="Wishlist"
 >
 <Heart size={20} />
 {wishlistCount > 0 && (
 <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose text-white text-[10px] font-bold flex items-center justify-center rounded-full">
 {wishlistCount}
 </span>
 )}
 </Link>

 {/* Account or Auth Buttons */}
 {session ? (
  <Link
  href="/account"
  className="hidden md:flex p-2 text-charcoal/70 hover:text-teal-600 :text-teal-400 transition-colors"
  aria-label="Account"
  >
  <User size={20} />
  </Link>
 ) : pathname !== '/login' && pathname !== '/register' ? (
  <Link
    href="/login"
    className="hidden md:flex items-center gap-1.5 p-2 text-sm font-semibold text-charcoal/70 hover:text-teal-600 transition-colors"
  >
    <User size={20} />
    Login
  </Link>
 ) : null}

 {/* Cart */}
 <button
 onClick={() => useCartStore.getState().toggleCart()}
 className="hidden md:flex relative p-2 text-charcoal/70 hover:text-teal-600 :text-teal-400 transition-colors"
 aria-label="Cart"
 >
 <ShoppingBag size={20} />
 {cartItemCount > 0 && (
 <motion.span
 key={cartItemCount}
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full"
 >
 {cartItemCount}
 </motion.span>
 )}
 </button>

 {/* Mobile Menu Button */}
 <button
 onClick={toggleMobileMenu}
 className="md:hidden p-2 -mr-2 text-charcoal hover:text-teal-600 transition-colors"
 aria-label="Toggle menu"
 >
 {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
 </button>
 </div>
 </div>
 </div>
 </header>

 {/* Mobile Menu Overlay */}
 <AnimatePresence>
 {isMobileMenuOpen && (
 <motion.div
 initial={{ opacity: 0, x: "100%" }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: "100%" }}
 transition={{ type: "spring", damping: 25, stiffness: 200 }}
 className="fixed inset-0 z-30 pt-24 bg-cream md:hidden"
 >
 <div 
 className="px-6 pt-4 pb-24 space-y-1 overflow-y-auto h-full [&::-webkit-scrollbar]:hidden"
 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
 >
 {navLinks.map((link) => (
 <div key={link.label}>
 <Link
 href={link.href}
 onClick={closeMobileMenu}
 className={cn(
 "block py-3 text-lg font-medium border-b border-charcoal/5 ",
 "text-charcoal ",
 link.label === "Sale" && "text-rose font-bold"
 )}
 >
 {link.label}
 </Link>
 {link.submenu && (
 <div className="pl-4 py-1 space-y-1">
 {link.submenu.map((sub) => (
 <Link
 key={sub.label}
 href={sub.href}
 onClick={closeMobileMenu}
 className="block py-2 text-sm text-slate hover:text-teal-600 transition-colors"
 >
 {sub.label}
 </Link>
 ))}
 </div>
 )}
 </div>
 ))}

 <div className="pt-6 border-t border-charcoal/10 space-y-3">
 <Link href="/account" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-slate ">
 <User size={18} /> My Account
 </Link>
 <Link href="/about" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-slate ">
 <MapPin size={18} /> About Us
 </Link>
 <Link href="/contact" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-slate ">
 <Phone size={18} /> Contact
 </Link>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Search Overlay */}
 <SearchOverlay />
 </>
 );
}
