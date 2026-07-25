import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getStoreTaxonomyData } from "@/lib/data/system";
import { ShopContent } from "./shop-content";

export const revalidate = 60; // Revalidate every 60 seconds for near-instant loads

export default async function ShopPage() {
  // Fetch products from database
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: true, images: true, reviews: true },
    orderBy: { createdAt: 'desc' }
  });
  const { categories: storeCats, fabrics: storeFabs } = await getStoreTaxonomyData();

  // Format categories for the UI using the exact predefined options from the database
  const categories = storeCats.map((c: any) => ({
    id: c.value,
    name: c.label
  }));

  const fabricFilters = storeFabs.map((f: any) => ({
    id: f.value,
    name: f.label
  }));

  return (
    <Suspense fallback={null}>
      <ShopContent 
        products={products} 
        categories={categories} 
        fabricFilters={fabricFilters} 
      />
    </Suspense>
  );
}
