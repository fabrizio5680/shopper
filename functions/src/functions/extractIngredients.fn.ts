import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { z } from 'zod'
import { PILLS } from '@shopper/shared'
import type { ExtractIngredientsResponse } from '@shopper/shared'
import { buildRecipePrompt } from '../ai/prompts'
import { createAIClient, DEFAULT_AI_PROVIDER } from '../ai/providers'
import { db, checkRateLimit } from '../services/firestore.service'
import {
  MAX_RECIPE_NAME_LENGTH,
  MIN_RECIPE_NAME_LENGTH,
  MAX_PILLS,
  MAX_KEYWORDS,
  MAX_KEYWORD_LENGTH,
  KEYWORD_ALLOWLIST_PATTERN,
} from '../config/constants'

const openaiApiKey = defineSecret('OPENAI_API_KEY')

const RequestSchema = z.object({
  recipeName: z
    .string()
    .min(MIN_RECIPE_NAME_LENGTH)
    .max(MAX_RECIPE_NAME_LENGTH)
    .regex(/^[a-zA-Z0-9\s\-']+$/),
  activePills: z
    .array(z.string())
    .max(MAX_PILLS)
    .refine(
      (ids) => ids.every((id) => PILLS.some((p) => p.id === id)),
      'Invalid pill ID'
    ),
  keywords: z
    .array(
      z
        .string()
        .max(MAX_KEYWORD_LENGTH)
        .regex(KEYWORD_ALLOWLIST_PATTERN)
    )
    .max(MAX_KEYWORDS),
})

export const extractIngredients = onCall(
  {
    memory: '256MiB',
    timeoutSeconds: 60,
    secrets: [openaiApiKey],
  },
  async (request): Promise<ExtractIngredientsResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in')
    }

    const userId = request.auth.uid

    // Rate limit
    const allowed = await checkRateLimit(userId, 'extractIngredients')
    if (!allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Rate limit exceeded. Try again later.'
      )
    }

    // Validate input
    const parsed = RequestSchema.safeParse(request.data)
    if (!parsed.success) {
      throw new HttpsError(
        'invalid-argument',
        parsed.error.errors.map((e) => e.message).join(', ')
      )
    }

    const { recipeName, activePills, keywords } = parsed.data

    const aiProvider = DEFAULT_AI_PROVIDER
    const client = createAIClient(aiProvider, {
      anthropic: '',
      openai: openaiApiKey.value(),
    })

    // Recipe gate
    const validation = await client.validateRecipe(recipeName)
    if (!validation.valid) {
      throw new HttpsError(
        'invalid-argument',
        validation.reason ||
          "That doesn't look like a recipe — try something like 'Chicken Curry'"
      )
    }

    // Build prompt
    const builtPrompt = buildRecipePrompt(recipeName, activePills, keywords)

    // Create group doc
    const groupRef = db.collection(`users/${userId}/recipeSearches`).doc()
    await groupRef.set({
      id: groupRef.id,
      recipeName,
      activePills,
      keywords,
      builtPrompt,
      aiProvider,
      status: 'extracting',
      errorMessage: null,
      createdAt: new Date(),
    })

    try {
      // Extract ingredients
      const suggestions = await client.extractIngredients(builtPrompt)

      // Update status to awaiting_approval
      await groupRef.update({ status: 'awaiting_approval' })

      return {
        groupId: groupRef.id,
        recipeName,
        suggestions,
      }
    } catch (err) {
      await groupRef.update({
        status: 'error',
        errorMessage:
          err instanceof Error ? err.message : 'Ingredient extraction failed',
      })
      throw new HttpsError(
        'internal',
        'Failed to extract ingredients. Please try again.'
      )
    }
  }
)
