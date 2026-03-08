import type { Pill } from './types.ts'

export const PILLS: Pill[] = [
  // Dietary
  { id: 'gluten-free', label: 'Gluten-free', category: 'dietary' },
  { id: 'dairy-free', label: 'Dairy-free', category: 'dietary' },
  { id: 'vegan', label: 'Vegan', category: 'dietary' },
  { id: 'vegetarian', label: 'Vegetarian', category: 'dietary' },
  { id: 'pescatarian', label: 'Pescatarian', category: 'dietary' },
  { id: 'halal', label: 'Halal', category: 'dietary' },
  { id: 'kosher', label: 'Kosher', category: 'dietary' },
  // Quality
  { id: 'organic', label: 'Organic', category: 'quality' },
  { id: 'non-processed', label: 'Non-processed', category: 'quality' },
  { id: 'whole-foods', label: 'Whole foods', category: 'quality' },
  { id: 'free-range', label: 'Free-range', category: 'quality' },
  { id: 'grass-fed', label: 'Grass-fed', category: 'quality' },
  // Health
  { id: 'low-sodium', label: 'Low-sodium', category: 'health' },
  { id: 'low-sugar', label: 'Low-sugar', category: 'health' },
  { id: 'high-protein', label: 'High-protein', category: 'health' },
  { id: 'low-carb', label: 'Low-carb', category: 'health' },
  { id: 'high-fibre', label: 'High-fibre', category: 'health' },
  { id: 'low-fat', label: 'Low-fat', category: 'health' },
  // Lifestyle
  { id: 'budget-friendly', label: 'Budget-friendly', category: 'lifestyle' },
  { id: 'easy-to-find', label: 'Easy to find', category: 'lifestyle' },
  { id: 'seasonal', label: 'Seasonal', category: 'lifestyle' },
  { id: 'local-produce', label: 'Local produce', category: 'lifestyle' },
]

export const PILL_CATEGORIES: { key: Pill['category']; label: string }[] = [
  { key: 'dietary', label: 'Dietary' },
  { key: 'quality', label: 'Quality' },
  { key: 'health', label: 'Health' },
  { key: 'lifestyle', label: 'Lifestyle' },
]
