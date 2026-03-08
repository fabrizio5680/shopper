import { atom } from 'jotai'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { auth } from '../firebase'
import type { User } from '../types'

function firebaseUserToUser(fbUser: import('firebase/auth').User): User {
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: fbUser.displayName ?? 'User',
    photoURL: fbUser.photoURL,
  }
}

// null = signed out, undefined = loading (auth state not yet resolved)
export const userAtom = atom<User | null | undefined>(undefined)

// Initializes the auth listener — call once at app startup
export const authListenerAtom = atom(null, (_get, set) => {
  const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
    set(userAtom, fbUser ? firebaseUserToUser(fbUser) : null)
  })
  return unsubscribe
})

// Sign in with Google popup
export const signInAtom = atom(null, async () => {
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
})

// Sign out
export const signOutAtom = atom(null, async () => {
  await firebaseSignOut(auth)
})
