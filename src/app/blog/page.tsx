import Link from "next/link";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

export const metadata = {
 title: "Fabric Care Blog",
 description: "Expert fabric care tips, styling guides, and textile knowledge from RK Fabrics Zone, Jaipur.",
};

export default function BlogPage() {
  const cardStyles = [
    { bg: "#0A1931", text: "#F6FAFD", subText: "#B3CFE5", iconBg: "#1A3D63" },
    { bg: "#B3CFE5", text: "#0A1931", subText: "#1A3D63", iconBg: "#F6FAFD" },
    { bg: "#4A7FA7", text: "#F6FAFD", subText: "#B3CFE5", iconBg: "#1A3D63" },
    { bg: "#1A3D63", text: "#F6FAFD", subText: "#B3CFE5", iconBg: "#0A1931" },
    { bg: "#F6FAFD", text: "#0A1931", subText: "#4A7FA7", iconBg: "#B3CFE5" },
    { bg: "#0A1931", text: "#F6FAFD", subText: "#B3CFE5", iconBg: "#4A7FA7" },
  ];

  return (
  <div className="w-full mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
  <div className="text-center mb-12">
  <span className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.3em] text-gold-dark uppercase flex items-center justify-center gap-2">
  <BookOpen size={14} /> From Our Looms
  </span>
  <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-charcoal mt-2">
  Fabric Care Blog
  </h1>
  <p className="text-slate mt-3 max-w-lg mx-auto">
  Expert fabric care tips, styling guides, and textile knowledge from our 15+ years of experience.
  </p>
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {blogPosts.map((post, index) => {
    const style = cardStyles[index % cardStyles.length];
    return (
      <Link href={`/blog/${post.id}`} key={post.id} className="group relative rounded-[2rem] overflow-hidden shadow-[8px_8px_20px_rgba(0,0,0,0.1),-8px_-8px_20px_rgba(255,255,255,0.05)] hover:shadow-[12px_12px_25px_rgba(0,0,0,0.15),-12px_-12px_25px_rgba(255,255,255,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col block" style={{ backgroundColor: style.bg }}>
        <article className="flex flex-col h-full">
          {/* Recessed Icon Container */}
          <div className="pt-10 pb-6 flex items-center justify-center relative">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-neo-pressed relative z-10"
              style={{ backgroundColor: style.iconBg }}
            >
              <span className="group-hover:scale-110 transition-transform duration-500">{post.emoji}</span>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute top-4 right-6 w-16 h-16 rounded-full opacity-10 bg-white mix-blend-overlay"></div>
            <div className="absolute bottom-4 left-8 w-12 h-12 rounded-full opacity-5 bg-white mix-blend-overlay"></div>
          </div>
  
          {/* Content Area */}
          <div className="p-8 pt-4 flex flex-col flex-grow">
            <div className="flex items-center gap-3 mb-4">
              <span 
                className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: style.iconBg, color: style.text }}
              >
                {post.category}
              </span>
              <span className="text-xs flex items-center gap-1 opacity-70" style={{ color: style.subText }}>
                <Clock size={12} /> {post.readTime} min
              </span>
            </div>
            
            <h2 
              className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-3 leading-snug group-hover:text-white transition-colors"
              style={{ color: style.text }}
            >
              {post.title}
            </h2>
            
            <p className="text-sm leading-relaxed mb-6 flex-grow" style={{ color: style.subText }}>
              {post.excerpt}
            </p>
  
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <span className="text-xs font-medium" style={{ color: style.subText }}>{post.date}</span>
              <span 
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-neo-btn group-hover:shadow-neo-pressed transition-all"
                style={{ backgroundColor: style.iconBg, color: style.text }}
              >
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  })}
 </div>
 </div>
 );
}
