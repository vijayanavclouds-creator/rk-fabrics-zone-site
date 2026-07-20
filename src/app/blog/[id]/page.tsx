import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.id === resolvedParams.id);
  if (!post) {
    return { title: "Blog Post Not Found" };
  }
  return {
    title: `${post.title} | RK Fabrics Zone Blog`,
    description: post.excerpt,
  };
}

// Simple text parser for basic markdown features
function renderContent(content: string) {
  const paragraphs = content.trim().split('\n\n');
  return paragraphs.map((para, i) => {
    let p = para.trim();
    
    // Headings
    if (p.startsWith('### ')) {
      return (
        <h3 key={i} className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal mt-8 mb-4">
          {p.replace('### ', '')}
        </h3>
      );
    }
    
    // Lists
    if (p.startsWith('- ')) {
      const listItems = p.split('\n').map((item, j) => {
        const text = item.replace('- ', '');
        // Bold parsing for list items
        const parts = text.split(/\\*\\*(.*?)\\*\\*/g);
        return (
          <li key={j} className="mb-2">
            {parts.map((part, k) => k % 2 === 1 ? <strong key={k} className="text-charcoal font-semibold">{part}</strong> : part)}
          </li>
        );
      });
      return <ul key={i} className="list-disc pl-5 mb-6 text-slate">{listItems}</ul>;
    }
    
    // Regular paragraphs with bold text
    const parts = p.split(/\\*\\*(.*?)\\*\\*/g);
    return (
      <p key={i} className="mb-6 text-slate leading-relaxed">
        {parts.map((part, k) => k % 2 === 1 ? <strong key={k} className="text-charcoal font-semibold">{part}</strong> : part)}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.id === resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 animate-in fade-in duration-500">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-900 font-bold mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Blog
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-cream-dark text-charcoal">
            {post.category}
          </span>
          <span className="text-sm flex items-center gap-1 text-slate font-medium">
            <Clock size={14} /> {post.readTime} min read
          </span>
          <span className="text-sm text-slate font-medium hidden sm:inline-block">
            • {post.date}
          </span>
        </div>
        
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-6">
          {post.emoji} {post.title}
        </h1>
        
        <p className="text-xl text-slate leading-relaxed border-l-4 border-teal-500 pl-4 italic">
          {post.excerpt}
        </p>
      </header>

      <div className="prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-playfair)] prose-a:text-teal-700 hover:prose-a:text-teal-900">
        {renderContent(post.content)}
      </div>

      <div className="mt-16 pt-8 border-t border-charcoal/10 flex justify-between items-center">
        <p className="text-sm text-slate font-medium">
          Published on {post.date}
        </p>
        <Link href="/shop" className="inline-block bg-charcoal text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-charcoal/20 hover:-translate-y-0.5">
          Explore Our Collection
        </Link>
      </div>
    </div>
  );
}
