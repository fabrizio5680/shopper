import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { FieldValue } from 'firebase-admin/firestore'
import type { SaveRecipeResponse } from '@shopper/shared'
import {
  groupRef,
  ingredientsCol,
  recipeRef,
} from '../services/firestore.service'

const RequestSchema = z.object({
  recipeSearchId: z.string().min(1),
})

export const saveRecipe = onCall(
  { memory: '256MiB', timeoutSeconds: 30 },
  async (request): Promise<SaveRecipeResponse> => {
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

    const { recipeSearchId } = parsed.data

    // Read recipe search doc
    const group = await groupRef(userId, recipeSearchId).get()
    if (!group.exists) {
      throw new HttpsError('not-found', 'Recipe search not found')
    }

    const groupData = group.data()!

    // Read all ingredients
    const ingredientsSnap = await ingredientsCol(userId, recipeSearchId).get()
    const ingredients = ingredientsSnap.docs.map((doc) => {
      const d = doc.data()
      return {
        name: d.name ?? '',
        quantity: d.quantity ?? '',
        notes: d.notes ?? '',
      }
    })

    // Upsert recipe document
    await recipeRef(userId, recipeSearchId).set({
      id: recipeSearchId,
      recipeSearchId,
      recipeName: groupData.recipeName,
      ingredients,
      updatedAt: FieldValue.serverTimestamp(),
    })

    return { recipeId: recipeSearchId }
  }
)