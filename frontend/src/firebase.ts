import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDvMUDpdz_o5J_JNtob-cErKHAaIAucPpM',
  authDomain: 'shopper-ae4d2.firebaseapp.com',
  projectId: 'shopper-ae4d2',
  storageBucket: 'shopper-ae4d2.firebasestorage.app',
  messagingSenderId: '13844368917',
  appId: '1:13844368917:web:1b5efce899dbc37437481c',
  measurementId: 'G-1DFVDZK25E',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

if (location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
}
