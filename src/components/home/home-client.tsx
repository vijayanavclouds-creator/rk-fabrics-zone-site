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
    <section className="relative min-h-[90vh] flex items-center pt-8 md:pt-24 overflow-hidden bg-white">
      {/* Background patterns */}
      <div className="absolute inset-0 pattern-dots opacity-[0.03] dark:opacity-[0.05]" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cream to-transparent rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10" />

      <div className="relative max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-0 w-full">
        <div className="grid lg:grid-cols-12 md:grid-cols-2 gap-[5px] md:gap-12 items-center">
          {/* Text */}
          <div className="text-center md:text-left z-10 order-2 md:order-1 lg:col-span-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-[1.1] mb-6"
            >
              Premium <span className="text-gradient-gold">Fabrics</span>
              <br />
              Stylish <span className="text-teal-600">You</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-slate max-w-lg mx-auto md:mx-0 mb-8 leading-relaxed"
            >
              Discover handcrafted fabrics, designer ethnic wear & contemporary fashion — direct from our looms in Jaipur to your wardrobe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            >
              <Link
                href="/shop"
                className="btn-primary text-base px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Explore Collection <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop?category=fabrics"
                className="px-8 py-4 text-base font-semibold text-teal-600 border-2 border-teal-600/20 rounded-full hover:bg-teal-600/5 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Shop Fabrics <Sparkles size={16} />
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 flex items-center gap-6 justify-center md:justify-start"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 border-2 border-cream flex items-center justify-center text-[10px] text-white font-bold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="text-xs text-slate">
                  <strong className="text-charcoal">2,500+</strong> Happy Customers
                </p>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual - Floating Bento Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative block order-1 md:order-2 mb-8 md:mb-0 w-full lg:col-span-6"
          >
            {/* Decorative Background Glows */}
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-cream to-transparent shadow-2xl opacity-60 pointer-events-none" />

            <div className="columns-2 md:columns-3 gap-4 md:gap-5 lg:gap-6 w-[85%] sm:w-full mx-auto relative z-10 overflow-visible pb-8">
              {heroImages.slice(0, 10).map((imgSrc, i) => {
                const duration = 4 + (i % 3);
                const delay = i * 0.2;

                return (
                  <div key={i} className="break-inside-avoid mb-3 md:mb-5" style={{ perspective: 1200 }}>
                    <motion.div
                      animate={{ 
                        y: [-5, 5, -5],
                        rotateX: [-1, 1, -1],
                        rotateY: [-1, 1, -1]
                      }}
                      whileHover={{ 
                        scale: 1.05, 
                        rotateX: 4, 
                        rotateY: -4,
                        z: 20,
                        transition: { duration: 0.3 }
                      }}
                      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
                      className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-200/50 transition-shadow duration-300 bg-white"
                    >
                      <img
                        src={imgSrc}
                        alt={`Hero Banner ${i + 1}`}
                        className="w-full h-auto"
                      />
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </motion.div>
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
      <div className="max-w-7xl mx-auto px-4 md:px-6">
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
    <section className="py-24 bg-cream relative overflow-hidden flex flex-col items-center">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal mb-4">
          From Our Looms <br className="md:hidden" /><span className="text-teal-600">To Your Wardrobe</span>
        </h2>
        <p className="text-slate text-lg mx-auto max-w-2xl mb-8">
          We weave stories in every thread. Explore our handcrafted collections, from rich festive silks to breezy summer cottons.
        </p>
      </div>
      
      {/* 3D Coverflow Swiper Carousel */}
      <div className="relative w-full pb-16 pt-8 max-w-[100vw] overflow-hidden">
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
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title || `Category`} 
                  className="w-full h-full object-contain bg-white group-hover:scale-110 transition-transform duration-700" 
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

      <div className="mt-8 relative z-10">
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
    <section className="py-16 md:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-charcoal mb-4">
            The RK Promise
          </h2>
          <p className="text-slate text-lg">
            Why thousands of boutiques and designers trust RK Fabrics Zone.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-transparent rounded-3xl p-8 text-center shadow-neo-card hover:shadow-neo-card-pressed transition-all duration-300 group"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-cream shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.7)] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <r.icon size={28} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-charcoal mb-3">{r.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{r.desc}</p>
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
