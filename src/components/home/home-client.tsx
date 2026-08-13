"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Shield, Truck, RefreshCw, Headphones, Sparkles, Crown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
/* ── Decorative SVG Components ── */
const ThreadSpool = ({ color = "#b89f92", className = "" }: { color?: string, className?: string }) => (
  <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ filter: 'drop-shadow(3px 8px 12px rgba(0,0,0,0.15))', overflow: 'visible' }}>
    <defs>
      <linearGradient id={`shade-${color}`} x1="10" y1="30" x2="38" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#000" stopOpacity="0.4"/>
        <stop offset="0.3" stopColor="#fff" stopOpacity="0.3"/>
        <stop offset="0.7" stopColor="#fff" stopOpacity="0.1"/>
        <stop offset="1" stopColor="#000" stopOpacity="0.5"/>
      </linearGradient>
      <linearGradient id="wood" x1="4" y1="0" x2="44" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#c2b2a1"/>
        <stop offset="0.5" stopColor="#dfd2c4"/>
        <stop offset="1" stopColor="#a39281"/>
      </linearGradient>
    </defs>

    {/* Thread body */}
    <rect x="10" y="8" width="28" height="44" fill={color} />
    
    {/* Thread texture */}
    {[...Array(20)].map((_, i) => (
      <line key={i} x1="10" y1={10 + i * 2} x2="38" y2={10 + i * 2} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
    ))}
    
    {/* Thread shading */}
    <rect x="10" y="8" width="28" height="44" fill={`url(#shade-${color})`} />

    {/* Bottom wooden rim */}
    <rect x="4" y="48" width="40" height="6" fill="url(#wood)" rx="1" />
    <ellipse cx="24" cy="54" rx="20" ry="4" fill="#dfd2c4" />
    <ellipse cx="24" cy="48" rx="20" ry="4" fill="#a39281" />

    {/* Top wooden rim */}
    <rect x="4" y="6" width="40" height="6" fill="url(#wood)" rx="1" />
    <ellipse cx="24" cy="12" rx="20" ry="4" fill="#a39281" />
    <ellipse cx="24" cy="6" rx="20" ry="4" fill="#dfd2c4" />
    <ellipse cx="24" cy="6" rx="6" ry="1.5" fill="#8c7a6b" />
  </svg>
);

const SewingPin = ({ className = "" }: { className?: string }) => (
  <svg width="80" height="16" viewBox="0 0 80 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ filter: 'drop-shadow(2px 4px 4px rgba(0,0,0,0.15))', overflow: 'visible' }}>
    <defs>
      <radialGradient id="pearl" cx="0.35" cy="0.35" r="0.6">
        <stop stopColor="#ffffff" offset="0%"/>
        <stop stopColor="#f8fafc" offset="30%"/>
        <stop stopColor="#cbd5e1" offset="70%"/>
        <stop stopColor="#94a3b8" offset="100%"/>
      </radialGradient>
      <linearGradient id="needle" x1="0" y1="8" x2="72" y2="8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#94a3b8" />
        <stop offset="0.5" stopColor="#f1f5f9" />
        <stop offset="1" stopColor="#64748b" />
      </linearGradient>
    </defs>
    
    {/* Needle */}
    <line x1="2" y1="8" x2="68" y2="8" stroke="url(#needle)" strokeWidth="1.5" strokeLinecap="round"/>
    
    {/* Pearl head */}
    <circle cx="72" cy="8" r="7" fill="url(#pearl)" />
    {/* Specular highlight */}
    <circle cx="69" cy="5" r="2" fill="white" opacity="0.9" filter="blur(0.5px)" />
  </svg>
);

const SewingButton = ({ color = "#e5e7eb", className = "" }: { color?: string, className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ filter: 'drop-shadow(1px 3px 4px rgba(0,0,0,0.15))' }}>
    <circle cx="15" cy="15" r="14" fill={color} stroke="rgba(0,0,0,0.05)" strokeWidth="1"/>
    <circle cx="15" cy="15" r="10" fill="transparent" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
    <circle cx="15" cy="15" r="10" fill="rgba(0,0,0,0.02)"/>
    <circle cx="12" cy="12" r="1.5" fill="#a8a29e" />
    <circle cx="18" cy="12" r="1.5" fill="#a8a29e" />
    <circle cx="12" cy="18" r="1.5" fill="#a8a29e" />
    <circle cx="18" cy="18" r="1.5" fill="#a8a29e" />
    <line x1="12" y1="12" x2="18" y2="18" stroke="#fdfbf7" strokeWidth="1.5" opacity="0.8"/>
    <line x1="18" y1="12" x2="12" y2="18" stroke="#fdfbf7" strokeWidth="1.5" opacity="0.8"/>
  </svg>
);

/* ── Hero Section ── */
function HeroSection({ banners }: { banners: any[] }) {
  const heroImages = banners.length > 0 
    ? banners.map(b => b.imageUrl) 
    : [
        "/hero/hero_one.png",
        "/hero/hero_two.png",
        "/hero/hero_three.png",
        "/hero/hero_four.png"
      ];

  const getImg = (idx: number) => heroImages[idx % heroImages.length];
  return (
    <section className="relative flex items-center pt-2 md:pt-6 pb-2 md:pb-12 overflow-hidden bg-white">
      {/* Background patterns for mobile */}
      <div className="absolute inset-0 pattern-dots opacity-[0.03] dark:opacity-[0.05] md:hidden" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cream to-transparent rounded-full blur-[100px] -z-10 md:hidden" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 md:hidden" />

      <div className="relative w-full px-2 md:px-4 py-2 md:py-0">
        {/* Desktop View - Horizontal Scattered Collage */}
        <div className="hidden md:flex flex-col items-center justify-center w-full bg-cream rounded-[2.5rem] pt-12 pb-16 relative overflow-hidden shadow-sm border border-charcoal/5">
          {/* Desktop background subtle texture */}
          <div className="absolute inset-0 pattern-dots opacity-[0.04]" />

          {/* Desktop Image Collage */}
          <div className="relative w-full h-[350px] lg:h-[450px] max-w-6xl mx-auto z-10 mb-6 mt-4">
            
            {/* Decorative elements are now rendered inside the cards below */}

            {heroImages.slice(0, 5).map((imgSrc, i) => {
              const desktopPositions = [
                "top-[10%] left-[8%] w-[18%] -rotate-2 z-10",
                "top-[25%] left-[28%] w-[20%] rotate-3 z-20",
                "top-[2%] left-[50%] -translate-x-1/2 w-[22%] -rotate-1 z-30", // center (largest)
                "top-[30%] right-[25%] w-[18%] rotate-2 z-20",
                "top-[12%] right-[8%] w-[19%] -rotate-3 z-10",
              ];
              
              return (
                <motion.div
                  key={i}
                  className={cn("absolute rounded-2xl overflow-visible shadow-xl border-[6px] lg:border-[8px] border-white bg-white", desktopPositions[i])}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.7 }}
                  whileHover={{ scale: 1.05, zIndex: 40, transition: { duration: 0.2 } }}
                >
                  <div className="relative w-full aspect-[3/4] rounded-[10px] lg:rounded-[12px] overflow-hidden">
                    <Image src={imgSrc} alt={`Hero Banner ${i}`} fill className="object-cover" sizes="25vw" priority />
                  </div>
                  
                  {/* Decorative Elements Attached to Specific Cards */}
                  {i === 0 && (
                    <div className="absolute left-0 bottom-0 z-40 pointer-events-none">
                      <ThreadSpool color="#c29f98" className="-rotate-12 absolute -left-10 -top-6 scale-90" />
                      <ThreadSpool color="#d4c4a8" className="rotate-[15deg] absolute -left-2 -top-3 scale-90" />
                      <SewingPin className="-rotate-[30deg] absolute -left-12 top-4" />
                      <SewingButton color="#c2b2a1" className="absolute -left-14 top-2 rotate-12 scale-90" />
                    </div>
                  )}
                  {i === 1 && (
                    <div className="absolute left-0 bottom-0 z-40 pointer-events-none">
                      <SewingPin className="-rotate-[120deg] absolute -left-14 top-2 scale-90" />
                      <SewingButton color="#c29f98" className="absolute -left-6 -top-2 scale-75" />
                    </div>
                  )}
                  {i === 2 && (
                    <div className="absolute right-0 top-0 z-40 pointer-events-none">
                      <SewingPin className="-rotate-[30deg] absolute -right-14 -top-2 scale-90" />
                      <SewingButton color="#c29f98" className="absolute -right-6 -top-6 scale-75" />
                    </div>
                  )}
                  {i === 3 && (
                    <div className="absolute left-0 bottom-0 z-40 pointer-events-none">
                      <ThreadSpool color="#2c5d63" className="-rotate-[15deg] absolute -left-8 top-2 scale-90" />
                      <ThreadSpool color="#437a80" className="rotate-[20deg] absolute -left-0 top-6 scale-90" />
                      <SewingPin className="-rotate-[25deg] absolute -left-12 -top-2" />
                    </div>
                  )}
                  {i === 4 && (
                    <div className="absolute right-0 top-0 z-40 pointer-events-none">
                      <ThreadSpool color="#c29f98" className="rotate-[25deg] absolute -right-12 -top-10 scale-90" />
                      <ThreadSpool color="#d4c4a8" className="-rotate-6 absolute -right-2 -top-12 scale-90" />
                      <SewingPin className="rotate-[45deg] absolute -right-10 top-0" />
                      <SewingButton color="#dfd2c4" className="absolute -right-1 -top-14 -rotate-12 scale-90" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Text Below */}
          <div className="text-center z-10 relative px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="font-[family-name:var(--font-playfair)] text-5xl lg:text-7xl font-bold text-charcoal leading-[1.15] mb-4"
            >
              Premium <span className="text-slate-600">Fabrics</span><br />
              Stylish <span className="text-slate-600">You</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-lg lg:text-xl text-slate-700 max-w-2xl mx-auto mb-8 font-medium tracking-wide"
            >
              Curated collections of premium fabrics and designer ethnic wear for the fashion-forward you at RK Fabrics Zone, Jaipur.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex items-center gap-4 justify-center"
            >
              <Link href="/shop" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                Explore Collection <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Mobile View (Preserved) */}
        <div className="block md:hidden w-full relative pt-2">
          {/* Mobile Visual - Scattered Collage */}
          <div className="relative w-full aspect-[3/4] sm:aspect-square mt-0 z-10 mb-8">
            {heroImages.slice(0, 5).map((imgSrc, i) => {
              const positions = [
                "top-[2%] left-[10%] w-[34%] -rotate-6 z-10",
                "top-[8%] right-[8%] w-[38%] rotate-3 z-20",
                "top-[35%] left-[50%] -translate-x-1/2 w-[42%] rotate-0 z-40",
                "bottom-[8%] left-[8%] w-[35%] -rotate-3 z-50",
                "bottom-[12%] right-[10%] w-[32%] rotate-6 z-20",
              ];

              return (
                <motion.div
                  key={i}
                  className={cn("absolute rounded-xl overflow-visible shadow-lg border-[4px] border-white bg-white", positions[i])}
                  initial={{ opacity: 0, y: 20, rotate: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6, type: "spring" }}
                  whileHover={{ scale: 1.05, zIndex: 60, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 1.05, zIndex: 60, transition: { duration: 0.2 } }}
                >
                  <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
                    <Image
                      src={imgSrc}
                      alt={`Hero Banner ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="50vw"
                      priority
                    />
                  </div>

                  {/* Decorative Elements Attached to Specific Cards (Scaled down for mobile) */}
                  {i === 0 && (
                    <div className="absolute left-0 bottom-0 z-40 pointer-events-none scale-[0.55] origin-bottom-left">
                      <ThreadSpool color="#c29f98" className="-rotate-12 absolute -left-10 -top-6 scale-90" />
                      <ThreadSpool color="#d4c4a8" className="rotate-[15deg] absolute -left-2 -top-3 scale-90" />
                      <SewingPin className="-rotate-[30deg] absolute -left-12 top-4" />
                      <SewingButton color="#c2b2a1" className="absolute -left-14 top-2 rotate-12 scale-90" />
                    </div>
                  )}
                  {i === 1 && (
                    <div className="absolute left-0 bottom-0 z-40 pointer-events-none scale-[0.55] origin-bottom-left">
                      <SewingPin className="-rotate-[120deg] absolute -left-14 top-2 scale-90" />
                      <SewingButton color="#c29f98" className="absolute -left-6 -top-2 scale-75" />
                    </div>
                  )}
                  {i === 2 && (
                    <div className="absolute right-0 top-0 z-40 pointer-events-none scale-[0.55] origin-top-right">
                      <SewingPin className="-rotate-[30deg] absolute -right-14 -top-2 scale-90" />
                      <SewingButton color="#c29f98" className="absolute -right-6 -top-6 scale-75" />
                    </div>
                  )}
                  {i === 3 && (
                    <div className="absolute left-0 bottom-0 z-40 pointer-events-none scale-[0.55] origin-bottom-left">
                      <ThreadSpool color="#2c5d63" className="-rotate-[15deg] absolute -left-8 top-2 scale-90" />
                      <ThreadSpool color="#437a80" className="rotate-[20deg] absolute -left-0 top-6 scale-90" />
                      <SewingPin className="-rotate-[25deg] absolute -left-12 -top-2" />
                    </div>
                  )}
                  {i === 4 && (
                    <div className="absolute right-0 top-0 z-40 pointer-events-none scale-[0.55] origin-top-right">
                      <ThreadSpool color="#c29f98" className="rotate-[25deg] absolute -right-12 -top-10 scale-90" />
                      <ThreadSpool color="#d4c4a8" className="-rotate-6 absolute -right-2 -top-12 scale-90" />
                      <SewingPin className="rotate-[45deg] absolute -right-10 top-0" />
                      <SewingButton color="#dfd2c4" className="absolute -right-1 -top-14 -rotate-12 scale-90" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Text */}
          <div className="text-center z-10 mb-8 mt-12">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl font-bold text-charcoal leading-[1.1] mb-6"
            >
              <span className="block text-base sm:text-xl text-rose font-medium mb-2 font-[family-name:var(--font-cinzel)] uppercase tracking-widest">RK Fabrics Zone</span>
              Premium <span className="text-gradient-gold">Fabrics</span>
              <br />
              Stylish <span className="text-teal-600">You</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-slate max-w-lg mx-auto mb-8 leading-relaxed"
            >
              Discover handcrafted fabrics, designer ethnic wear & contemporary fashion — direct from RK Fabrics Zone in Jaipur to your wardrobe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center"
            >
              <Link
                href="/shop"
                className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
              >
                Explore Collection <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── USP Bar ── */
function USPBar() {
  const usps = [
    { icon: Truck, text: "Free Shipping ₹999+", color: "text-teal-600" },
    { icon: Shield, text: "100% Genuine Fabrics", color: "text-gold-dark" },
    { icon: RefreshCw, text: "Easy 7-Day Returns", color: "text-teal-600" },
    { icon: Headphones, text: "WhatsApp Support", color: "text-gold-dark" },
  ];

  return (
    <section className="bg-white border-y border-charcoal/5 py-4 md:py-5">
      <div className="w-full mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {usps.map((usp) => (
            <div key={usp.text} className="flex items-center justify-center gap-2.5 group">
              <usp.icon
                size={20}
                className={cn(usp.color, "group-hover:scale-110 transition-transform")}
              />
              <span className="text-xs md:text-sm font-medium text-charcoal">
                {usp.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Custom Categories Carousel ── */
function CustomCategories({ banners }: { banners: any[] }) {
  const carouselBanners = banners.length > 0 
    ? banners 
    : [
        { imageUrl: "/carousel/carousel_one.png", title: "Cottons" },
        { imageUrl: "/carousel/carousel_two.png", title: "Silks" },
        { imageUrl: "/carousel/carousel_three.png", title: "Kurtis" },
        { imageUrl: "/carousel/carousel_four.png", title: "Prints" }
      ];

  // Swiper needs at least 2x the slidesPerView to loop perfectly. 
  // Duplicating the array ensures it never glitches on ultra-wide screens.
  const extendedBanners = [...carouselBanners, ...carouselBanners, ...carouselBanners, ...carouselBanners];
  
  return (
    <section className="pt-8 pb-4 md:py-24 bg-cream relative overflow-hidden flex flex-col items-center">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-2 md:mb-12 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal mb-4">
          From Our Looms <br className="md:hidden" /><span className="text-teal-600">To Your Wardrobe</span>
        </h2>
        <p className="text-slate text-lg mx-auto max-w-2xl mb-8">
          We weave stories in every thread. Explore our handcrafted collections, from rich festive silks to breezy summer cottons.
        </p>
      </div>
      
      {/* 3D Coverflow Swiper Carousel */}
      <div className="relative w-full pb-8 pt-4 md:pb-16 md:pt-8 max-w-[100vw] overflow-hidden">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          loop={true}
          initialSlide={1}
          coverflowEffect={{
            rotate: 30, // Angle of the side cards
            stretch: 0, // Space between cards
            depth: 250, // Z-depth push for side cards
            modifier: 1.5, // Effect multiplier
            slideShadows: true, // Auto-generate 3D shadows
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          modules={[EffectCoverflow, Pagination, Autoplay]}
          className="w-full max-w-[1200px] !pb-12"
        >
          {extendedBanners.map((banner: any, i: number) => (
            <SwiperSlide key={i} className="!w-[280px] md:!w-[350px]">
              <div 
                className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(13,148,136,0.25)] group"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Image */}
                <Image 
                  src={banner.imageUrl} 
                  alt={banner.title || `Category`} 
                  fill
                  sizes="(max-width: 768px) 280px, 350px"
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                
                {/* 3D Glass & Shadow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-teal-500/10 mix-blend-multiply transition-colors duration-500 z-10" />
                <div className="absolute inset-0 rounded-[2rem] border-[2px] border-white/20 z-30 pointer-events-none shadow-[inset_0_0_30px_rgba(255,255,255,0.2)]" />

                {/* Sweeping Holographic Glare */}
                <div className="absolute top-[-50%] left-[-150%] w-[100%] h-[200%] bg-gradient-to-r from-transparent via-white/40 to-transparent rotate-[35deg] z-20 group-hover:left-[200%] transition-all duration-[1.5s] ease-in-out pointer-events-none" />

                {/* Floating Content */}
                <div 
                  className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-40 pointer-events-none"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <h3 className="text-white font-[family-name:var(--font-playfair)] font-bold text-3xl md:text-4xl tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {banner.title || "Category"}
                  </h3>
                  <div className="w-12 h-[3px] bg-gold mt-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="mt-2 md:mt-8 relative z-10">
        <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
          View All Categories <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

/* ── Why Choose Us ── */
function WhyChooseUs() {
  const reasons = [
    { title: "Premium Quality", desc: "Rigorous quality checks for perfect weave and color.", icon: CheckCircle2 },
    { title: "Factory Prices", desc: "Direct from manufacturers, eliminating middlemen.", icon: Star },
    { title: "Sustainable", desc: "Eco-friendly dyes and sustainable weaving practices.", icon: Sparkles },
    { title: "Global Shipping", desc: "We deliver our heritage fabrics worldwide securely.", icon: Truck },
  ];
  return (
    <section className="pt-6 pb-0 md:py-24 bg-cream">
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-charcoal mb-4">
            The RK Promise
          </h2>
          <p className="text-slate text-lg">
            Why thousands of boutiques and designers trust RK Fabrics Zone.
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-transparent rounded-2xl md:rounded-3xl p-3 md:p-8 text-center shadow-neo-card hover:shadow-neo-card-pressed transition-all duration-300 group"
            >
              <div className="w-10 h-10 md:w-16 md:h-16 mx-auto rounded-full bg-cream shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] flex items-center justify-center mb-3 md:mb-6 group-hover:scale-110 transition-transform">
                <r.icon className="text-teal-600 w-5 h-5 md:w-7 md:h-7" />
              </div>
              <h3 className="text-[11px] md:text-xl font-bold text-charcoal mb-1 md:mb-3">{r.title}</h3>
              <p className="text-[9px] md:text-sm text-slate leading-snug md:leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main Page Component ── */
export function HomeClient({ heroBanners, carouselBanners }: { heroBanners: any[], carouselBanners: any[] }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection banners={heroBanners} />
      <USPBar />
      <CustomCategories banners={carouselBanners} />
      <WhyChooseUs />
    </div>
  );
}
