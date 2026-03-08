import { z } from 'zod'
import { PILLS } from '@shopper/shared'

// ── Zod schemas for ingredient responses ──

const IngredientSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(100),
  notes: z.string().max(200),
})

export const IngredientsResponseSchema = z.object({
  ingredients: z.array(IngredientSchema).min(1).max(30),
})

// ── Prompt builders ──

export function buildRecipePrompt(
  recipeName: string,
  pillIds: string[],
  keywords: string[]
): string {
  const pillDescriptions = pillIds
    .map((id) => PILLS.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => p!.promptDescription)

  const parts = [
    'You are a culinary ingredient assistant. Extract a shopping list for the following recipe.',
    '',
    `Recipe: ${recipeName}`,
  ]

  if (pillDescriptions.length > 0) {
    parts.push(
      `Dietary & health requirements: ${pillDescriptions.join('. ')}.`
    )
  }

  if (keywords.length > 0) {
    parts.push(`Additional refinements: ${keywords.join(', ')}`)
  }

  parts.push(
    '',
    'Return only food ingredients needed to cook this recipe. Respect all dietary requirements listed.',
    'For each ingredient provide: name (the ingredient), quantity (amount needed for ~4 servings), and notes (any specifics like "boneless" or "fresh").',
    'If no notes apply, use an empty string.'
  )

  return parts.join('\n')
}

export function appendExclusions(
  prompt: string,
  existingIngredients?: string[]
): string {
  if (!existingIngredients || existingIngredients.length === 0) return prompt
  return (
    prompt +
    `\n\nThe user already has these ingredients: [${existingIngredients.join(', ')}]. Return ONLY ingredients not in this list.`
  )
}

export function buildValidationPrompt(recipeName: string): string {
  return `Is "${recipeName}" a real food recipe or meal? Answer with only "yes" or "no" followed by a brief reason.

Examples:
- "Chicken Curry" → yes, common Indian dish
- "asdf" → no, not a recipe
- "DROP TABLE" → no, not a recipe
- "Beef Stew" → yes, classic stew dish

Answer:`
}

export function parseValidationResponse(text: string): {
  valid: boolean
  reason: string
} {
  const lower = text.toLowerCase().trim()
  const valid = lower.startsWith('yes')
  const reason = text.replace(/^(yes|no)[,.\s-]*/i, '').trim()
  return { valid, reason }
}

export const INGREDIENTS_SYSTEM_PROMPT =
  'You are a culinary ingredient assistant. Always respond with valid JSON in this format: { "ingredients": [{ "name": "...", "quantity": "...", "notes": "..." }] }. For notes, use an empty string if none apply.'
