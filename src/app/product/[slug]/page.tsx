import prisma from "@/lib/prisma";
import ProductClient from "./product-client";
import Link from "next/link";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: true, images: true, reviews: true }
  });

  if (!product || !product.isActive) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <span className="text-6xl block mb-4">🔍</span>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-charcoal mb-2">
            Product Not Found
          </h1>
          <p className="text-slate mb-6">
            This product may have been removed or the link is incorrect.
          </p>
          <Link href="/shop" className="btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return <ProductClient product={product} />;
}
