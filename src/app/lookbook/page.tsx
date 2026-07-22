import Image from "next/image";
import Link from "next/link";

const lookbookItems = [
  { id: 1, title: "Summer Cottons", url: "https://images.unsplash.com/photo-1584447128309-b66b7a4d1b63?q=80&w=1964&auto=format&fit=crop" },
  { id: 2, title: "Bridal Silk", url: "https://images.unsplash.com/photo-1610034604855-320d750c822e?q=80&w=2070&auto=format&fit=crop" },
  { id: 3, title: "Festive Embroideries", url: "https://images.unsplash.com/photo-1583391733958-d25e77b224c6?q=80&w=2024&auto=format&fit=crop" },
  { id: 4, title: "Casual Prints", url: "https://images.unsplash.com/photo-1506444856417-0951a8775f0a?q=80&w=2070&auto=format&fit=crop" },
  { id: 5, title: "Royal Velvets", url: "https://images.unsplash.com/photo-1634812328224-1180fbdfbbf6?q=80&w=2070&auto=format&fit=crop" },
  { id: 6, title: "Organza Magic", url: "https://images.unsplash.com/photo-1620803504383-7fa25dc56453?q=80&w=1964&auto=format&fit=crop" },
];

export default function LookbookPage() {
  return (
    <div className="bg-cream min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="font-[family-name:var(--font-cinzel)] text-sm tracking-[0.3em] text-teal-600 uppercase mb-4 block">
            Inspiration
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold text-charcoal mb-6">
            Our Lookbook
          </h1>
          <p className="text-lg md:text-xl text-slate max-w-2xl mx-auto leading-relaxed">
            Discover the elegance of our latest collections. Get inspired for your next bespoke creation.
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {lookbookItems.map((item) => (
            <div key={item.id} className="break-inside-avoid group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all border border-white">
              <img 
                src={item.url} 
                alt={item.title} 
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <h3 className="text-white font-[family-name:var(--font-playfair)] text-2xl font-bold">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-charcoal font-bold mb-6 text-lg">Inspired? Explore our full range of fabrics.</p>
          <Link href="/shop" className="inline-block bg-charcoal text-white font-bold px-10 py-4 rounded-full hover:bg-teal-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Shop The Collection
          </Link>
        </div>

      </div>
    </div>
  );
}
