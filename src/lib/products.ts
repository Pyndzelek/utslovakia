export type Product = {
  id: number
  name: string
  price: string
  image: string
  priceNote?: string
}

const baseProduct = {
  name: 'JCM UBA 10',
  price: '36.00 $',
  image: '/maszynka.png',
}

export const bestsellers: Product[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  ...baseProduct,
  priceNote: i < 4 ? 'Najniższa cena w okresie 30 dni przed obniżką: 24.00 $ -50%' : undefined,
}))

export const promotions: Product[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  ...baseProduct,
}))

export const newProducts: Product[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  ...baseProduct,
}))
