// Re-export shared types so existing imports continue to work
export type {
  Supermarket,
  GroupStatus,
  SearchStatus,
  IngredientSource,
  Pill,
  Product,
  Ingredient,
  SuggestedIngredient,
  RecipeSearch,
} from '@shopper/shared'

import type { Supermarket, Product } from '@shopper/shared'

// Frontend-only types

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
}

// Manual search panel state machine
export type ManualSearchPanelState =
  | { phase: 'idle' }
  | { phase: 'searching' }
  | { phase: 'preview'; results: ManualSearchResult[]; normalizedQuery: string }
  | { phase: 'saving' }
  | { phase: 'saved'; ingredientId: string }

export interface ManualSearchResult {
  supermarket: Supermarket
  products: Product[]
  status: 'ok' | 'empty' | 'error'
}
