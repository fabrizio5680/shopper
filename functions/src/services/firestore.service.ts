import * as admin from 'firebase-admin'
import { RATE_LIMITS } from '../config/constants'

if (!admin.apps.length) {
  admin.initializeApp()
}

export const db = admin.firestore()

export function groupRef(userId: string, groupId: string) {
  return db.doc(`users/${userId}/recipeSearches/${groupId}`)
}

export function ingredientsCol(userId: string, groupId: string) {
  return db.collection(`users/${userId}/recipeSearches/${groupId}/ingredients`)
}

export async function checkRateLimit(
  userId: string,
  key: keyof typeof RATE_LIMITS
): Promise<boolean> {
  const config = RATE_LIMITS[key]
  const ref = db.doc(`users/${userId}/rateLimits/${key}`)
  const now = Date.now()

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(ref)
    const data = doc.data() as { calls: number[]; } | undefined
    const calls = (data?.calls ?? []).filter((t: number) => now - t < config.windowMs)

    if (calls.length >= config.max) {
      return false
    }

    calls.push(now)
    tx.set(ref, { calls })
    return true
  })
}
