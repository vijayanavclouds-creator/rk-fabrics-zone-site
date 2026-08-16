"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export function Home2Client({ heroHtml, carouselHtml }: { heroHtml: string, carouselHtml: string }) {
  const router = useRouter();

  // Clean HTML by removing <script> tags to hide them from Elements tab
  const { cleanHeroHtml, cleanCarouselHtml } = useMemo(() => {
    let finalHero = heroHtml || "";
    let finalCarousel = carouselHtml || "";

    if (finalCarousel) {
      // Strip all script tags from Carousel HTML so it's hidden from the DOM Elements inspector
      finalCarousel = finalCarousel.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    if (finalHero) {
      // Strip all script tags from Hero HTML too
      finalHero = finalHero.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    return { cleanHeroHtml: finalHero, cleanCarouselHtml: finalCarousel };
  }, [heroHtml, carouselHtml]);

  useEffect(() => {
    // 1. Run Carousel scroll UI logic securely inside React instead of inline scripts
    document.querySelectorAll('.rfz-carousel-wrapper').forEach(wrapper => {
      const container = wrapper.querySelector('.rfz-product-grid-4, .rfz-category-grid-5');
      const leftBtn = wrapper.querySelector('.left-arrow') as HTMLElement;
      const rightBtn = wrapper.querySelector('.right-arrow') as HTMLElement;

      if(container) {
        const updateArrows = () => {
          const canScroll = container.scrollWidth > container.clientWidth;
          if (!canScroll) {
            if (leftBtn) leftBtn.style.display = 'none';
            if (rightBtn) rightBtn.style.display = 'none';
          } else {
            if (leftBtn) leftBtn.style.display = 'flex';
            if (rightBtn) rightBtn.style.display = 'flex';
          }
        };

        // Initial setup
        updateArrows();
        
        // Listeners
        window.addEventListener('resize', updateArrows);

        if(leftBtn) {
          leftBtn.onclick = () => container.scrollBy({ left: -300, behavior: 'smooth' });
        }
        if(rightBtn) {
          rightBtn.onclick = () => container.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    });

    // 2. Fast Navigation Interceptor for dynamically injected <a> tags
    // This allows the admin to write <a href="/product/..."> in the Handlebars template
    // and it will route instantly without a slow full-page reload!
    const handleInjectedClicks = (e: Event) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        router.push(target.pathname + target.search);
      }
    };

    const container = document.querySelector('.rfz-carousel-wrapper');
    if (container) {
      container.addEventListener('click', handleInjectedClicks);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleInjectedClicks);
      }
    };
  }, [cleanCarouselHtml, router]);
  return (
    <div className="w-full flex flex-col min-h-screen">
      {cleanHeroHtml ? (
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: cleanHeroHtml }} />
      ) : (
        <section className="relative flex items-center pt-2 md:pt-6 pb-2 md:pb-12 overflow-hidden bg-white">
          <div className="relative w-full">
            <div className="flex flex-col items-center justify-center w-full bg-cream pt-12 pb-16 relative overflow-hidden">
              <div className="text-center z-10 relative px-4 mt-8 md:mt-32">
                <h1 className="font-[family-name:var(--font-playfair)] text-5xl lg:text-7xl font-bold text-charcoal leading-[1.15] mb-4">
                  Premium <span className="text-slate-600">Fabrics</span><br />
                  Stylish <span className="text-slate-600">You</span>
                </h1>
                <p className="text-lg lg:text-xl text-slate-700 max-w-2xl mx-auto mb-8 font-medium tracking-wide">
                  Curated collections of premium fabrics and designer ethnic wear for the fashion-forward you at RK Fabrics Zone, Jaipur.
                </p>
                <div className="flex items-center gap-4 justify-center">
                  <Link href="/shop" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
                    Explore Collection <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {cleanCarouselHtml ? (
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: cleanCarouselHtml }} />
      ) : (
        <div className="py-20 text-center text-slate-500">
          Carousel HTML not set yet.
        </div>
      )}
    </div>
  );
}
