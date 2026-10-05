import { Price } from 'utslovakia'

const prices = { PLN: 1299, EUR: 299, USD: 329, BRL: 1650 }

export const Sizes = () => (
  <div style={{ display: 'grid', gap: 12, padding: 16 }}>
    <Price prices={prices as never} size="sm" />
    <Price prices={prices as never} size="md" />
    <Price prices={prices as never} size="lg" />
  </div>
)

export const OnRequest = () => (
  <div style={{ padding: 16 }}>
    <Price prices={{ PLN: 0 } as never} size="lg" />
  </div>
)
