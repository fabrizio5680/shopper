import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBasket, LogOut } from 'lucide-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { userAtom, signOutAtom } from '../../atoms/auth'

export default function Header() {
  const user = useAtomValue(userAtom)
  const signOut = useSetAtom(signOutAtom)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className="bg-cream/80 backdrop-blur-xl border-b border-parchment sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-forest to-forest-light rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-card transition-shadow duration-300">
            <ShoppingBasket className="w-4.5 h-4.5 text-sage-light" />
          </div>
          <span className="font-display text-xl text-forest">Shopper</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sage-faint flex items-center justify-center text-forest-muted font-semibold text-sm">
                {user.displayName?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <span className="hidden sm:inline text-sm text-ink-muted font-medium">
                {user.displayName}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-terracotta transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
