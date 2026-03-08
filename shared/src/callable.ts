import type { SuggestedIngredient, Supermarket, Product } from './types'

// extractIngredients
export interface ExtractIngredientsRequest {
  recipeName: string
  activePills: string[]
  keywords: string[]
}

export interface ExtractIngredientsResponse {
  groupId: string
  recipeName: string
  suggestions: SuggestedIngredient[]
}

// saveIngredients
export interface SaveIngredientsRequest {
  groupId: string
  ingredients: SuggestedIngredient[]
}

export interface SaveIngredientsResponse {
  ingredientIds: string[]
}

// rescanIngredients
export interface RescanIngredientsRequest {
  groupId: string
}

export interface RescanIngredientsResponse {
  suggestions: SuggestedIngredient[]
}

// searchIngredientQuery (manual search)
export interface SearchIngredientQueryRequest {
  query: string
}

export interface SearchIngredientQueryResponse {
  results: {
    supermarket: Supermarket
    products: Product[]
    status: 'ok' | 'empty' | 'error'
  }[]
  normalizedQuery: string
}

// saveManualIngredient
export interface SaveManualIngredientRequest {
  groupId: string
  name: string
  quantity: string
  notes: string
  products: Product[]
}

export interface SaveManualIngredientResponse {
  ingredientId: string
}

// deleteRecipeSearch
export interface DeleteRecipeSearchRequest {
  groupId: string
}

export interface DeleteRecipeSearchResponse {
  success: boolean
}
