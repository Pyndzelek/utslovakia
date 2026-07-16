import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pl', 'en', 'sk', 'pt-br'],
  defaultLocale: 'pl',
  localePrefix: 'as-needed', // Hides '/pl' on default root URLs

  pathnames: {
    '/': '/',
    '/about': {
      pl: '/o-nas',
      en: '/about',
      sk: '/o-nas',
      'pt-br': '/sobre-nos',
    },
    '/contact': {
      pl: '/kontakt',
      en: '/contact',
      sk: '/kontakt',
      'pt-br': '/contato',
    },
    '/products': {
      pl: '/produkty',
      en: '/products',
      sk: '/produkty',
      'pt-br': '/produtos',
    },
    '/category': {
      pl: '/kategoria',
      en: '/category',
      sk: '/kategoria',
      'pt-br': '/categoria',
    },
    '/products/[slug]': {
      pl: '/produkty/[slug]',
      en: '/products/[slug]',
      sk: '/produkty/[slug]',
      'pt-br': '/produtos/[slug]',
    },
    '/category/[slug]': {
      pl: '/kategoria/[slug]',
      en: '/category/[slug]',
      sk: '/kategoria/[slug]',
      'pt-br': '/categoria/[slug]',
    },
  },
})

export type Pathnames = keyof typeof routing.pathnames
export type Locale = (typeof routing.locales)[number]
