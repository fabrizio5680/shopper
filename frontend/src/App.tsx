import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAtomValue, useSetAtom } from 'jotai'
import { userAtom, authListenerAtom } from './atoms/auth'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import MealDetail from './pages/MealDetail'
import type { ReactNode } from 'react'

function AuthGuard({ children }: { children: ReactNode }) {
  const user = useAtomValue(userAtom)

  // Still loading auth state
  if (user === undefined) return null

  return user ? <>{children}</> : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
      <Route path="/search/:id" element={<AuthGuard><MealDetail /></AuthGuard>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  const initAuth = useSetAtom(authListenerAtom)

  useEffect(() => {
    const unsubscribe = initAuth()
    return () => { unsubscribe() }
  }, [initAuth])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
