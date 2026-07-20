"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Shield, Truck, RefreshCw, Headphones, Sparkles, Crown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBanners } from "@/actions/admin";
import { useEffect, useState } from "react";

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

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-0 w-full">
        <div className="grid md:grid-cols-2 gap-[5px] md:gap-12 items-center">
          {/* Text */}
          <div className="text-center md:text-left z-10 order-2 md:order-1">
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

          {/* Hero Visual - Floating Garments */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative block order-1 md:order-2 mb-8 md:mb-0"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto md:ml-auto">
              
              {/* Decorative Background Glows */}
              <div className="absolute inset-10 rounded-full bg-gradient-to-br from-cream to-transparent shadow-2xl opacity-60" />

              {/* Floating Garment 1 - T-Shirt (Top Left) */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[5%] left-[5%] w-[45%] aspect-square z-20"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getImg(0)}
                    alt="Hero Image 1"
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
                {/* Dynamic Drop Shadow */}
                <motion.div
                  animate={{ scale: [1, 0.8, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-black/40 blur-md rounded-[100%]"
                />
              </motion.div>

              {/* Floating Garment 2 - Jeans (Top Right) */}
              <motion.div
                animate={{ y: [12, -12, 12] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-[10%] right-[0%] w-[40%] aspect-[3/4] z-10"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getImg(1)}
                    alt="Hero Image 2"
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
                {/* Dynamic Drop Shadow */}
                <motion.div
                  animate={{ scale: [0.8, 1, 0.8], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-3 bg-black/40 blur-md rounded-[100%]"
                />
              </motion.div>

              {/* Floating Garment 3 - Jacket (Bottom Left) */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[5%] left-[0%] w-[50%] aspect-square z-30"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getImg(2)}
                    alt="Hero Image 3"
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
                {/* Dynamic Drop Shadow */}
                <motion.div
                  animate={{ scale: [1, 0.85, 1], opacity: [0.3, 0.15, 0.3] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-5 bg-black/40 blur-md rounded-[100%]"
                />
              </motion.div>

              {/* Floating Garment 4 - Kurta (Bottom Right) */}
              <motion.div
                animate={{ y: [15, -15, 15] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-[0%] right-[5%] w-[45%] aspect-[3/4] z-20"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getImg(3)}
                    alt="Hero Image 4"
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
                {/* Dynamic Drop Shadow */}
                <motion.div
                  animate={{ scale: [0.85, 1, 0.85], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-black/40 blur-md rounded-[100%]"
                />
              </motion.div>

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
  
  const getBanner = (idx: number) => carouselBanners[idx % carouselBanners.length];

  return (
    <section className="py-20 bg-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal mb-4">
              From Our Looms <br/><span className="text-teal-600">To Your Wardrobe</span>
            </h2>
            <p className="text-slate text-lg mb-8 max-w-md">
              We weave stories in every thread. Explore our handcrafted collections, from rich festive silks to breezy summer cottons.
            </p>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
              View All Categories <ArrowRight size={18} />
            </Link>
          </div>
          
          {/* RIGHT SIDE - 4 Small Squares (Irregular Staggered Masonry) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4 md:gap-6 relative"
          >
            <div className="space-y-4 md:space-y-6 mt-12">
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-neo-card group">
                <Image src={getBanner(1).imageUrl} fill alt="Fabric 2" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl">{getBanner(1).title || "Category"}</h3>
                </div>
              </div>
              <div className="w-full aspect-square rounded-3xl overflow-hidden relative shadow-neo-card group">
                <Image src={getBanner(3).imageUrl} fill alt="Fabric 4" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl">{getBanner(3).title || "Category"}</h3>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 md:space-y-6 -ml-8 md:-ml-12 lg:-ml-24 relative z-10">
              <div className="w-full aspect-square rounded-3xl overflow-hidden relative shadow-neo-card group bg-white p-2">
                <div className="w-full h-full relative rounded-2xl overflow-hidden">
                  <Image src={getBanner(0).imageUrl} fill alt="Fabric 1" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl">{getBanner(0).title || "Category"}</h3>
                  </div>
                </div>
              </div>
              <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden relative shadow-neo-card group">
                <Image src={getBanner(2).imageUrl} fill alt="Fabric 3" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl">{getBanner(2).title || "Category"}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
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
export default function Home() {
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [carouselBanners, setCarouselBanners] = useState<any[]>([]);

  useEffect(() => {
    getBanners().then(res => {
      if (res.success && res.banners) {
        setHeroBanners(res.banners.filter((b: any) => b.type === "hero"));
        setCarouselBanners(res.banners.filter((b: any) => b.type === "carousel"));
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection banners={heroBanners} />
      <USPBar />
      <CustomCategories banners={carouselBanners} />
      <WhyChooseUs />
    </div>
  );
}
