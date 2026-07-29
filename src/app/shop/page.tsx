import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getStoreTaxonomyData } from "@/lib/data/system";
import { ShopContent } from "./shop-content";

import { Metadata } from 'next'

export const revalidate = 3600; // Revalidate every 1 hour

export const metadata: Metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium fabrics, sarees, lehengas, and ethnic wear.',
  alternates: {
    canonical: 'https://www.rkfabricszone.com/shop',
  }
}

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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://www.rkfabricszone.com/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Shop',
        'item': 'https://www.rkfabricszone.com/shop'
      }
    ]
  }

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </head>
      <Suspense fallback={null}>
        <ShopContent 
          products={products} 
          categories={categories} 
          fabricFilters={fabricFilters} 
        />
      </Suspense>
    </>
  );
}
