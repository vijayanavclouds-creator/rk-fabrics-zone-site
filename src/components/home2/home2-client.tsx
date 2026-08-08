"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Home2Client({ heroHtml, carouselHtml }: { heroHtml: string, carouselHtml: string }) {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {heroHtml ? (
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: heroHtml }} />
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

      {carouselHtml ? (
        <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: carouselHtml }} />
      ) : (
        <div className="py-20 text-center text-slate-500">
          Carousel HTML not set yet.
        </div>
      )}
    </div>
  );
}
