import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.rkfabricszone.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/_next/',
        '/api/',
        '/account/',
        '/checkout/',
        '/cart/',
        '/admin/',
        '/portal/',
        '/*?*sort=*',
        '/*?*color=*',
        '/*?*q=*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
