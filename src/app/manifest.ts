import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UTSlovakia',
    short_name: 'UTSlovakia',
    description: 'Katalog produktów UTSlovakia',
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
