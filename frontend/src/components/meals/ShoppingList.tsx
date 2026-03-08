import { useState } from 'react'
import { ExternalLink, ShoppingCart, X } from 'lucide-react'
import type { RecipeSearch, Supermarket } from '../../types'
import { SUPERMARKET_LIST } from '../../styles/design-tokens'

interface ShoppingItem {
  ingredientName: string
  quantity: string
  recipeName: string
  productName: string
  priceText: string
  unitPrice: string | null
  productUrl: string
}

interface Props {
  searches: RecipeSearch[]
  onClose: () => void
}

export default function ShoppingList({ searches, onClose }: Props) {
  const [activeSupermarket, setActiveSupermarket] = useState<Supermarket>('tesco')

  // Aggregate chosen products across all selected recipes for the active supermarket
  const items: ShoppingItem[] = []
  let total = 0

  for (const search of searches) {
    for (const ing of search.ingredients) {
      if (!ing.selectedProducts) continue
      const productId = ing.selectedProducts[activeSupermarket]
      if (!productId) continue
      const product = ing.products.find(p => p.id === productId)
      if (!product) continue
      items.push({
        ingredientName: ing.name,
        quantity: ing.quantity,
        recipeName: search.recipeName,
        productName: product.name,
        priceText: product.priceText,
        unitPrice: product.unitPrice,
        productUrl: product.productUrl,
      })
      total += product.price
    }
  }

  // Count how many items each supermarket has (for tab badges)
  const supermarketCounts: Partial<Record<Supermarket, number>> = {}
  for (const search of searches) {
    for (const ing of search.ingredients) {
      if (!ing.selectedProducts) continue
      for (const sm of SUPERMARKET_LIST) {
        const pid = ing.selectedProducts[sm.id]
        if (pid && ing.products.some(p => p.id === pid)) {
          supermarketCounts[sm.id] = (supermarketCounts[sm.id] ?? 0) + 1
        }
      }
    }
  }

  return (
    <div className="animate-scale-in card">
      {/* Header */}
      <div className="card-section flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center">
            <ShoppingCart className="w-4.5 h-4.5 text-forest" />
          </div>
          <div>
            <h2 className="font-display text-lg text-ink">Shopping list</h2>
            <p className="text-sm text-ink-faint">
              {searches.length} recipe{searches.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-ink-ghost hover:text-ink-muted rounded-lg hover:bg-cream transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Supermarket tabs */}
      <div className="px-4 sm:px-6 pt-4 pb-1">
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 scrollbar-hide">
          {SUPERMARKET_LIST.map(sm => {
            const count = supermarketCounts[sm.id] ?? 0
            const isActive = activeSupermarket === sm.id
            return (
              <button
                key={sm.id}
                onClick={() => setActiveSupermarket(sm.id)}
                className={isActive ? `sm-tab ${sm.activeTab}` : 'sm-tab-inactive'}
              >
                {sm.label}
                {count > 0 && (
                  <span className={`sm-tab-badge ${isActive ? 'bg-white/60' : 'bg-parchment'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Items */}
      <div className="px-4 sm:px-6 py-4">
        {items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-ink-ghost">
              No chosen products at {SUPERMARKET_LIST.find(s => s.id === activeSupermarket)?.label}
            </p>
            <p className="text-xs text-ink-ghost/70 mt-1">
              Choose products in each recipe's detail page first
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-parchment/60">
            {items.map((item, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-ink">{item.ingredientName}</span>
                      {item.quantity && (
                        <span className="text-xs text-ink-faint">{item.quantity}</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-ghost mt-0.5 truncate">{item.productName}</p>
                    <span className="text-[10px] text-ink-ghost/60 mt-0.5 block">from {item.recipeName}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-forest">{item.priceText}</span>
                      {item.unitPrice && (
                        <span className="block text-[10px] text-ink-ghost">{item.unitPrice}</span>
                      )}
                    </div>
                    <a
                      href={item.productUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-ink-ghost hover:text-forest rounded-md hover:bg-sage-faint/50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer with total */}
      {items.length > 0 && (
        <div className="card-footer flex items-center justify-between">
          <span className="text-sm text-ink-muted font-medium">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
          <span className="font-display text-lg text-forest">
            €{total.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
