import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import type { SaveIngredientsResponse } from '@shopper/shared'
import {
  db,
  groupRef,
  ingredientsCol,
} from '../services/firestore.service'
import { MAX_INGREDIENTS_PER_GROUP } from '../config/constants'

const IngredientSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().max(100),
  notes: z.string().max(200),
})

const RequestSchema = z.object({
  groupId: z.string().min(1),
  ingredients: z.array(IngredientSchema).min(1).max(MAX_INGREDIENTS_PER_GROUP),
})

export const saveIngredients = onCall(
  { memory: '256MiB', timeoutSeconds: 30 },
  async (request): Promise<SaveIngredientsResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in')
    }

    const userId = request.auth.uid

    const parsed = RequestSchema.safeParse(request.data)
    if (!parsed.success) {
      throw new HttpsError(
        'invalid-argument',
        parsed.error.errors.map((e) => e.message).join(', ')
      )
    }

    const { groupId, ingredients } = parsed.data

    // Verify ownership
    const group = await groupRef(userId, groupId).get()
    if (!group.exists) {
      throw new HttpsError('not-found', 'Recipe search not found')
    }

    // Check existing ingredient count
    const existing = await ingredientsCol(userId, groupId).count().get()
    const total = existing.data().count + ingredients.length
    if (total > MAX_INGREDIENTS_PER_GROUP) {
      throw new HttpsError(
        'resource-exhausted',
        `Maximum ${MAX_INGREDIENTS_PER_GROUP} ingredients per recipe`
      )
    }

    // Batch write ingredients
    const batch = db.batch()
    const ingredientIds: string[] = []

    for (const ing of ingredients) {
      const ref = ingredientsCol(userId, groupId).doc()
      ingredientIds.push(ref.id)
      batch.set(ref, {
        id: ref.id,
        name: ing.name,
        quantity: ing.quantity,
        notes: ing.notes,
        searchStatus: 'pending',
        source: 'ai',
        selectedProducts: null,
      })
    }

    // Update group status
    batch.update(groupRef(userId, groupId), { status: 'done' })

    await batch.commit()

    return { ingredientIds }
  }
)
