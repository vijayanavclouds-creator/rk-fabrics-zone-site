import { getCompanyProfile } from "@/actions/system";
import Link from "next/link";
import { Heart, Shield, Sparkles, MapPin, Phone, Mail, Building2, Truck, RefreshCw } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
};



export default async function AboutPage() {
  const companyProfile = await getCompanyProfile();

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-charcoal text-white pt-24 pb-32">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <span className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.3em] text-gold uppercase mb-4 block">
            Our Heritage
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl font-bold mb-6">
            RK Fabrics <span className="font-[family-name:var(--font-cinzel)] font-normal text-3xl md:text-5xl text-white/70">Zone</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {companyProfile?.companyDescription || "Premium fabrics and stylish wear, curated with love and crafted to perfection. Direct from the heart of Jaipur."}
          </p>
        </div>
      </section>

      {/* Story & Philosophy Section */}
      <section id="story" className="w-full mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square md:aspect-auto md:h-full min-h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
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
                The RK Fabrics Zone Promise
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal">
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
      </section>

      {/* Stats/Highlight Banner */}
      <section className="bg-charcoal py-16 text-white border-y border-white/10">
        <div className="w-full mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
            <div className="px-4">
              <Sparkles className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mb-1">Premium</div>
              <div className="text-sm text-white/60">Quality Materials</div>
            </div>
            <div className="px-4">
              <MapPin className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mb-1">Jaipur</div>
              <div className="text-sm text-white/60">Direct to you</div>
            </div>
            <div className="px-4">
              <RefreshCw className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mb-1">7 Days</div>
              <div className="text-sm text-white/60">Easy Returns</div>
            </div>
            <div className="px-4">
              <Truck className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-3xl font-[family-name:var(--font-playfair)] font-bold mb-1">Pan India</div>
              <div className="text-sm text-white/60">Delivery Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information Details */}
      <section className="w-full mx-auto px-4 md:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-charcoal mb-4">
            Company Information
          </h2>
          <p className="text-slate">
            Get in touch with us or drop by our registered office. We are always happy to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-charcoal/5 shadow-sm text-center group hover:border-teal-500 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={28} className="text-teal-600" />
            </div>
            <h3 className="font-bold text-charcoal text-lg mb-2">Registered Entity</h3>
            <p className="text-slate mb-1 font-medium">{companyProfile?.ownerName || "RK Fabrics Zone"}</p>
            <p className="text-slate text-sm leading-relaxed">{companyProfile?.address || "Johari Bazaar, Jaipur, Rajasthan 302003, India"}</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-charcoal/5 shadow-sm text-center group hover:border-teal-500 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Phone size={28} className="text-teal-600" />
            </div>
            <h3 className="font-bold text-charcoal text-lg mb-2">Contact Numbers</h3>
            <p className="text-slate mb-1">
              <span className="font-medium">Sales:</span> {companyProfile?.contactNumber || "+91 98765 43210"}
            </p>
            <p className="text-slate">
              <span className="font-medium">Support:</span> {companyProfile?.helpCenterNumber || "+91 98765 43210"}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-charcoal/5 shadow-sm text-center group hover:border-teal-500 hover:shadow-md transition-all">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Mail size={28} className="text-teal-600" />
            </div>
            <h3 className="font-bold text-charcoal text-lg mb-2">Email Us</h3>
            <p className="text-slate mb-1">
              <a href={`mailto:${companyProfile?.supportEmail || 'hello@rkfabricszone.com'}`} className="hover:text-teal-600 transition-colors">
                {companyProfile?.supportEmail || "hello@rkfabricszone.com"}
              </a>
            </p>
            <p className="text-slate text-sm mt-4">
              <Link href="/contact" className="font-medium text-teal-600 hover:underline">
                Go to Contact Form →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
