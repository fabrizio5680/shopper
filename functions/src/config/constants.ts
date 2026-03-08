export const RATE_LIMITS = {
  extractIngredients: { max: 30, windowMs: 60 * 60 * 1000 }, // 30/hr
  searchProducts: { max: 20, windowMs: 60 * 60 * 1000 },
  manualSearch: { max: 30, windowMs: 60 * 60 * 1000 },
} as const

export const KEYWORD_ALLOWLIST_PATTERN = /^[a-zA-Z0-9\s\-]+$/
export const MAX_KEYWORDS = 5
export const MAX_KEYWORD_LENGTH = 50
export const MAX_RECIPE_NAME_LENGTH = 80
export const MIN_RECIPE_NAME_LENGTH = 3
export const MAX_PILLS = 8
export const MAX_INGREDIENTS_PER_GROUP = 50
