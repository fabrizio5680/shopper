import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { z } from 'zod'
import type { DeleteRecipeSearchResponse } from '@shopper/shared'
import { db, groupRef } from '../services/firestore.service'

const RequestSchema = z.object({
  groupId: z.string().min(1),
})

export const deleteRecipeSearch = onCall(
  { memory: '256MiB', timeoutSeconds: 60 },
  async (request): Promise<DeleteRecipeSearchResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in')
    }

    const userId = request.auth.uid

    const parsed = RequestSchema.safeParse(request.data)
    if (!parsed.success) {
      throw new HttpsError('invalid-argument', 'Invalid request')
    }

    const { groupId } = parsed.data

    // Verify ownership
    const group = await groupRef(userId, groupId).get()
    if (!group.exists) {
      throw new HttpsError('not-found', 'Recipe search not found')
    }

    // Recursive delete of group + all subcollections
    await db.recursiveDelete(groupRef(userId, groupId))

    return { success: true }
  }
)
