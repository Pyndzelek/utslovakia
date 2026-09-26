import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UTSlovakia',
    short_name: 'UTSlovakia',
    description: 'Systemy płatności i komponenty dla branży gamingowej, vendingowej i rozrywkowej.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#080e21',
    background_color: '#080e21',
    icons: [
      {
        src: '/uts_icon.png',
        sizes: '574x589',
        type: 'image/png',
      },
    ],
  }
}
