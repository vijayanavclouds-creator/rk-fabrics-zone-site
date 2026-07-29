import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { getProductBySlug } from '@/lib/data'

export const revalidate = 3600 // ISR: Revalidate every hour

type Props = {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  // Try Prisma first, fallback to mock data
  let product: any = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { images: true }
  })
  
  if (!product) {
    product = getProductBySlug(slug)
  }

  if (!product) {
    return { title: 'Product Not Found' }
  }

  const imageUrl = product.images?.[0]?.url || '/logo.png'

  return {
    title: product.name,
    description: product.shortDescription || product.description?.substring(0, 160),
    alternates: {
      canonical: `https://www.rkfabricszone.com/product/${slug}`
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.substring(0, 160),
      url: `https://www.rkfabricszone.com/product/${slug}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    }
  }
}

export default async function ProductLayout({ params, children }: Props) {
  const { slug } = await params
  
  // Try Prisma first, fallback to mock data
  let product: any = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { images: true, variants: true }
  })
  
  if (!product) {
    product = getProductBySlug(slug)
  }

  // If no product is found, just return children (page will handle the 404 state)
  if (!product) {
    return <>{children}</>
  }

  const categoryName = product.category || 'Shop'
  const price = product.variants?.[0]?.price || product.basePrice || 0
  const imageUrl = product.images?.[0]?.url || '/logo.png'

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': [
      `https://www.rkfabricszone.com${imageUrl}`
    ],
    'description': product.description,
    'sku': product.id,
    'offers': {
      '@type': 'Offer',
      'url': `https://www.rkfabricszone.com/product/${slug}`,
      'priceCurrency': 'INR',
      'price': price,
      'availability': 'https://schema.org/InStock'
    }
  }

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
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': categoryName,
        'item': `https://www.rkfabricszone.com/shop?category=${encodeURIComponent(categoryName)}`
      },
      {
        '@type': 'ListItem',
        'position': 4,
        'name': product.name,
        'item': `https://www.rkfabricszone.com/product/${slug}`
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  )
}
