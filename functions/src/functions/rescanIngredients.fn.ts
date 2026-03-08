import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { z } from 'zod'
import type { RescanIngredientsResponse } from '@shopper/shared'
import { createAIClient, DEFAULT_AI_PROVIDER } from '../ai/providers'
import {
  groupRef,
  ingredientsCol,
  checkRateLimit,
} from '../services/firestore.service'

const openaiApiKey = defineSecret('OPENAI_API_KEY')

const RequestSchema = z.object({
  groupId: z.string().min(1),
})

export const rescanIngredients = onCall(
  {
    memory: '256MiB',
    timeoutSeconds: 60,
    secrets: [openaiApiKey],
  },
  async (request): Promise<RescanIngredientsResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in')
    }

    const userId = request.auth.uid

    const allowed = await checkRateLimit(userId, 'extractIngredients')
    if (!allowed) {
      throw new HttpsError(
        'resource-exhausted',
        'Rate limit exceeded. Try again later.'
      )
    }

    const parsed = RequestSchema.safeParse(request.data)
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', 'Invalid request')
    }

    const { groupId } = parsed.data
    const aiProvider = DEFAULT_AI_PROVIDER

    // Verify ownership and get group data
    const group = await groupRef(userId, groupId).get()
    if (!group.exists) {
      throw new HttpsError('not-found', 'Recipe search not found')
    }

    const groupData = group.data()!
    const builtPrompt = groupData.builtPrompt as string

    // Get existing ingredient names
    const existingSnap = await ingredientsCol(userId, groupId).get()
    const existingNames = existingSnap.docs.map(
      (d) => d.data().name as string
    )

    const client = createAIClient(aiProvider, {
      anthropic: '',
      openai: openaiApiKey.value(),
    })

    try {
      const suggestions = await client.extractIngredients(
        builtPrompt,
        existingNames
      )

      return { suggestions }
    } catch {
      throw new HttpsError(
        'internal',
        'Failed to find more ingredients. Please try again.'
      )
    }
  }
)
