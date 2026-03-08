import type { Supermarket } from '@shopper/shared'

export interface ScrapedProduct {
  name: string
  price: number
  priceText: string
  unitPrice: string | null
  imageUrl: string | null
  productUrl: string
  available: boolean
}

export interface Scraper {
  supermarket: Supermarket
  search(ingredient: string): Promise<ScrapedProduct[]>
}
