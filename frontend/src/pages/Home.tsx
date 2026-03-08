import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBasket } from 'lucide-react'
import { useAtomValue } from 'jotai'
import { userAtom } from '../atoms/auth'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'

const STORES = [
  { name: 'Tesco', color: 'bg-tesco' },
  { name: 'SuperValu', color: 'bg-supervalu' },
  { name: 'Dunnes', color: 'bg-dunnes' },
  { name: 'Aldi', color: 'bg-aldi' },
  { name: 'Lidl', color: 'bg-lidl' },
]

export default function Home() {
  const user = useAtomValue(userAtom)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  return (
    <div className="grain min-h-screen bg-cream relative overflow-hidden flex flex-col">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-sage-light/40 to-sage-faint/20 blur-3xl" />
        <div className="absolute -bottom-48 -left-24 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-terracotta-faint/50 to-transparent blur-3xl" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-ink-ghost/20 to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-ink-ghost/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Logo mark */}
        <div className="animate-fade-up mb-10">
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-forest/10 rounded-3xl rotate-6 scale-110" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-forest to-forest-light rounded-2xl flex items-center justify-center shadow-elevated">
              <ShoppingBasket className="w-8 h-8 text-sage-light" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="animate-fade-up stagger-1 font-display text-4xl sm:text-6xl text-forest tracking-tight">
          Shopper
        </h1>

        {/* Decorative divider */}
        <div className="animate-fade-up stagger-2 flex items-center gap-3 my-6">
          <div className="w-12 h-px bg-ink-ghost" />
          <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />
          <div className="w-12 h-px bg-ink-ghost" />
        </div>

        {/* Tagline */}
        <p className="animate-fade-up stagger-3 font-display text-xl sm:text-2xl text-bark-light max-w-lg leading-relaxed">
          Plan meals. Compare prices across Ireland's supermarkets.
        </p>
        <p className="animate-fade-up stagger-4 text-ink-faint max-w-sm mt-3 text-[15px] leading-relaxed">
          Tell us what you want to cook — AI extracts the ingredients and finds
          the best prices at every store.
        </p>

        {/* Sign in */}
        <div className="animate-fade-up stagger-5 mt-10">
          <GoogleSignInButton />
        </div>

        {/* Supermarket strip */}
        <div className="animate-fade-up stagger-6 mt-14 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
          {STORES.map((store, i) => (
            <div key={store.name} className="flex items-center gap-2">
              {i > 0 && <div className="w-px h-3 bg-ink-ghost/40 hidden sm:block" />}
              <div className="flex items-center gap-1.5 px-1">
                <div className={`w-2 h-2 rounded-full ${store.color}`} />
                <span className="text-xs text-ink-faint font-medium tracking-wide">
                  {store.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-6 text-center">
        <p className="text-xs text-ink-ghost">Built for Irish shoppers</p>
      </div>
    </div>
  )
}
