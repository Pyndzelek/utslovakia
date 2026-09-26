import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UTSlovakia',
    short_name: 'UTSlovakia',
    description: 'Systemy płatności i komponenty dla branży gamingowej, vendingowej i rozrywkowej.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#080e21',
    background_color: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
