/** One active eBay listing, shaped by fetch.ts and consumed by import.ts. */
export type EbayListing = {
  itemId: string
  /** Seller's "Custom label (SKU)", if set. */
  sku?: string
  title: string
  url: string
  /** Name of the seller's eBay Store category (the `store_cat` filter on the store page). */
  storeCategory?: string
  ebayCategory?: string
  condition?: string
  conditionDescription?: string
  price: Money
  quantityAvailable: number
  /** Item specifics as [name, value] pairs, e.g. ["Brand", "JCM"]. */
  specifics: [string, string][]
  /** Seller description converted from HTML to plain text (paragraphs split by blank lines). */
  description: string
  /** Full-size photo URLs, main photo first. */
  images: string[]
  variations: EbayVariation[]
}

export type EbayVariation = {
  /** Variation specifics joined, e.g. "Blue / USB". */
  name: string
  sku?: string
  price: Money
  quantityAvailable: number
}

export type Money = { value: number; currency: string }
