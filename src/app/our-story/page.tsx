import { getCompanyProfile } from "@/actions/system";
import Image from "next/image";
import { Heart, Shield } from "lucide-react";

export default async function OurStoryPage() {
  const companyProfile = await getCompanyProfile();

  return (
    <div className="bg-cream min-h-screen pt-24 pb-20">
      <div className="w-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.3em] text-teal-600 uppercase mb-4 block">
            Our Heritage
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold text-charcoal mb-6">
            The Story of RK Fabrics Zone
          </h1>
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto leading-relaxed">
            From the vibrant streets of Jaipur to wardrobes across India, our journey is woven with tradition, quality, and a passion for textiles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="relative aspect-square md:aspect-auto md:h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <Image 
              src="https://images.unsplash.com/photo-1605001007204-62e921e13b8e?q=80&w=2070&auto=format&fit=crop"
              alt="Fabrics weaving process"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent flex items-end p-8">
              <div>
                <p className="font-[family-name:var(--font-cinzel)] text-gold font-bold tracking-widest text-sm uppercase mb-2">Since the beginning</p>
                <p className="text-white font-[family-name:var(--font-playfair)] text-2xl italic">"We believe every thread tells a story."</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <span className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.2em] text-teal-600 uppercase mb-2 block">
                The Foundation
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-charcoal">
                Quality Meets Tradition
              </h2>
            </div>
            
            <p className="text-slate leading-relaxed text-lg">
              Based in the culturally rich city of Jaipur, we are deeply rooted in India's textile heritage. Our mission is to bridge the gap between traditional craftsmanship and modern elegance, bringing you premium fabrics directly from the source.
            </p>
            
            <p className="text-slate leading-relaxed text-lg">
              Every piece in our collection is meticulously selected. Whether it's intricately woven silk, breathable summer cottons, or bespoke ethnic wear, we guarantee authenticity, quality, and a touch of royal elegance.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-charcoal/10">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-teal-600" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal">100% Genuine</h4>
                  <p className="text-sm text-slate">Quality certified</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center shrink-0">
                  <Heart size={20} className="text-rose" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal">Made with Love</h4>
                  <p className="text-sm text-slate">In Jaipur, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
