import type { Pill } from './types'

export const PILLS: Pill[] = [
  // Dietary
  { id: 'gluten-free', label: 'Gluten-free', category: 'dietary', promptDescription: 'All ingredients must be gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free', category: 'dietary', promptDescription: 'All ingredients must be dairy-free (no milk, cheese, butter, cream)' },
  { id: 'vegan', label: 'Vegan', category: 'dietary', promptDescription: 'All ingredients must be vegan (no animal products)' },
  { id: 'vegetarian', label: 'Vegetarian', category: 'dietary', promptDescription: 'All ingredients must be vegetarian (no meat or fish)' },
  { id: 'pescatarian', label: 'Pescatarian', category: 'dietary', promptDescription: 'No meat except fish and seafood' },
  { id: 'halal', label: 'Halal', category: 'dietary', promptDescription: 'All ingredients must be halal-certified' },
  { id: 'kosher', label: 'Kosher', category: 'dietary', promptDescription: 'All ingredients must be kosher' },
  // Quality
  { id: 'organic', label: 'Organic', category: 'quality', promptDescription: 'Prefer organic ingredients where available' },
  { id: 'non-processed', label: 'Non-processed', category: 'quality', promptDescription: 'Avoid processed or ultra-processed ingredients' },
  { id: 'whole-foods', label: 'Whole foods', category: 'quality', promptDescription: 'Use whole, unrefined ingredients' },
  { id: 'free-range', label: 'Free-range', category: 'quality', promptDescription: 'Use free-range eggs and poultry' },
  { id: 'grass-fed', label: 'Grass-fed', category: 'quality', promptDescription: 'Use grass-fed meat and dairy' },
  // Health
  { id: 'low-sodium', label: 'Low-sodium', category: 'health', promptDescription: 'Minimize sodium/salt content' },
  { id: 'low-sugar', label: 'Low-sugar', category: 'health', promptDescription: 'Minimize sugar content' },
  { id: 'high-protein', label: 'High-protein', category: 'health', promptDescription: 'Maximize protein content' },
  { id: 'low-carb', label: 'Low-carb', category: 'health', promptDescription: 'Minimize carbohydrate content' },
  { id: 'high-fibre', label: 'High-fibre', category: 'health', promptDescription: 'Maximize fibre content' },
  { id: 'low-fat', label: 'Low-fat', category: 'health', promptDescription: 'Minimize fat content' },
  // Lifestyle
  { id: 'budget-friendly', label: 'Budget-friendly', category: 'lifestyle', promptDescription: 'Use affordable, budget-friendly ingredients' },
  { id: 'easy-to-find', label: 'Easy to find', category: 'lifestyle', promptDescription: 'Use common ingredients easily found in Irish supermarkets' },
  { id: 'seasonal', label: 'Seasonal', category: 'lifestyle', promptDescription: 'Prefer seasonal ingredients' },
  { id: 'local-produce', label: 'Local produce', category: 'lifestyle', promptDescription: 'Prefer locally produced Irish ingredients' },
]

export const PILL_CATEGORIES: { key: Pill['category']; label: string }[] = [
  { key: 'dietary', label: 'Dietary' },
  { key: 'quality', label: 'Quality' },
  { key: 'health', label: 'Health' },
  { key: 'lifestyle', label: 'Lifestyle' },
]
