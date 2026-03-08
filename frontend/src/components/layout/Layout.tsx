import type { ReactNode } from 'react'
import Header from './Header'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="grain min-h-screen bg-cream">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {children}
      </main>
    </div>
  )
}
