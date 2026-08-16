import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RK Fabrics Zone',
    short_name: 'RK Fabrics',
    description: 'Shop premium fabrics from RK Fabrics Zone.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBFDF9',
    theme_color: '#FBFDF9',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
