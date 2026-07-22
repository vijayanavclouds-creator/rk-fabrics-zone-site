import { PrismaClient } from '@prisma/client';
import { products } from '../src/lib/data';

process.env.DATABASE_URL = "file:./dev.db";
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database from JSON data...');
  
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        category: p.category,
        subcategory: p.subcategory || null,
        gender: p.gender,
        type: p.type,
        basePrice: p.basePrice,
        salePrice: p.salePrice || null,
        fabric: p.fabric,
        occasion: p.occasion || [],
        tags: p.tags || [],
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured || false,
        isNewArrival: p.isNewArrival || false,
        isBestseller: p.isBestseller || false,
        
        variants: {
          create: p.variants.map(v => ({
            id: v.id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            price: v.price,
            salePrice: v.salePrice || null,
            stock: v.stock
          }))
        },
        
        images: {
          create: p.images.map(img => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary
          }))
        }
      },
    });
    console.log(`Created product: ${product.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
