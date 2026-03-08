import { atom } from 'jotai'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { RecipeSearch } from '../types'

export const searchesAtom = atom<RecipeSearch[]>([])
export const searchesLoadingAtom = atom(true)

// Writable atom that stores the unsubscribe fn and starts/stops the listener
let _unsub: Unsubscribe | null = null

export const searchesListenerAtom = atom(
  null,
  (_get, set, userId: string | null) => {
    // Unsubscribe previous listener
    if (_unsub) {
      _unsub()
      _unsub = null
    }

    if (!userId) {
      set(searchesAtom, [])
      set(searchesLoadingAtom, false)
      return
    }

    const q = query(
      collection(db, `users/${userId}/recipeSearches`),
      orderBy('createdAt', 'desc')
    )

    _unsub = onSnapshot(q, (snap) => {
      const searches: RecipeSearch[] = snap.docs.map((doc) => {
        const d = doc.data()
        return {
          id: doc.id,
          recipeName: d.recipeName,
          activePills: d.activePills ?? [],
          keywords: d.keywords ?? [],
          status: d.status,
          errorMessage: d.errorMessage ?? null,
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
          ingredients: [], // loaded separately on detail page
        }
      })
      set(searchesAtom, searches)
      set(searchesLoadingAtom, false)
    })
  }
)
