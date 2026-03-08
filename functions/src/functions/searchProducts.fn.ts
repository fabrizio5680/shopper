import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import type { SearchProductsResponse } from '@shopper/shared'
import {
  db,
  groupRef,
  ingredientsCol,
} from '../services/firestore.service'
import { checkRateLimit } from '../services/firestore.service'

const RequestSchema = z.object({
  groupId: z.string().min(1),
})

export const searchProducts = onCall(
  { memory: '256MiB', timeoutSeconds: 60 },
  async (request): Promise<SearchProductsResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in')
    }

    const userId = request.auth.uid

    const allowed = await checkRateLimit(userId, 'searchProducts')
    if (!allowed) {
      throw new HttpsError('resource-exhausted', 'Too many searches - try again later')
    }

    const parsed = RequestSchema.safeParse(request.data)
    if (!parsed.success) {
      throw new HttpsError(
        'invalid-argument',
        parsed.error.errors.map((e) => e.message).join(', ')
      )
    }

    const { groupId } = parsed.data

    // Verify ownership
    const group = await groupRef(userId, groupId).get()
    if (!group.exists) {
      throw new HttpsError('not-found', 'Recipe search not found')
    }

    // Read all ingredients
    const ingredientsSnap = await ingredientsCol(userId, groupId).get()
    if (ingredientsSnap.empty) {
      throw new HttpsError('failed-precondition', 'No ingredients to search')
    }

    // Filter to pending ingredients only
    const pendingDocs = ingredientsSnap.docs.filter(
      (d) => d.data().searchStatus === 'pending'
    )

    if (pendingDocs.length === 0) {
      return { success: true }
    }

    // Set group status to searching
    await groupRef(userId, groupId).update({ status: 'searching' })

    // Mark pending ingredients as searching
    const searchingBatch = db.batch()
    for (const d of pendingDocs) {
      searchingBatch.update(d.ref, { searchStatus: 'searching' })
    }
    await searchingBatch.commit()

    // TODO: Replace with real scraper calls
    await new Promise((r) => setTimeout(r, 500))

    // Mark ingredients as done
    const doneBatch = db.batch()
    for (const d of pendingDocs) {
      doneBatch.update(d.ref, { searchStatus: 'done' })
    }
    await doneBatch.commit()

    // Set group status to done
    await groupRef(userId, groupId).update({ status: 'done' })

    return { success: true }
  }
)
