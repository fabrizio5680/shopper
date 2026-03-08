export type Supermarket = 'tesco' | 'supervalu' | 'dunnes' | 'aldi' | 'lidl'

export type GroupStatus = 'extracting' | 'awaiting_approval' | 'searching' | 'done' | 'error'

export type SearchStatus = 'pending' | 'searching' | 'done' | 'error'

export type IngredientSource = 'ai' | 'manual'

export interface Pill {
  id: string
  label: string
  category: 'dietary' | 'quality' | 'health' | 'lifestyle'
}

export interface Product {
  id: string
  supermarket: Supermarket
  name: string
  price: number
  priceText: string
  unitPrice: string | null
  imageUrl: string | null
  productUrl: string
  available: boolean
}

export interface Ingredient {
  id: string
  name: string
  quantity: string
  notes: string
  searchStatus: SearchStatus
  source: IngredientSource
  products: Product[]
  selectedProducts: Partial<Record<Supermarket, string>> | null
}

export interface SuggestedIngredient {
  name: string
  quantity: string
  notes: string
}

export interface RecipeSearch {
  id: string
  recipeName: string
  activePills: string[]
  keywords: string[]
  status: GroupStatus
  errorMessage: string | null
  createdAt: Date
  ingredients: Ingredient[]
}
