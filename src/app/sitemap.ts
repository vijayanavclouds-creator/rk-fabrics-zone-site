import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Invalidate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.rkfabricszone.com'

  // Fetch all active products
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    select: {
      slug: true,
      createdAt: true,
      category: true,
    },
  })

  // Extract unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean)

  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.createdAt, // Using createdAt as we don't have updatedAt in the schema
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/shop?category=${encodeURIComponent(category)}`,
    lastModified: new Date(), // We don't have a timestamp for categories, but they rarely change
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/our-story`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/lookbook`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  return [...staticUrls, ...categoryUrls, ...productUrls]
}
