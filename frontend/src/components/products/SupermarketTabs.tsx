import { useState } from 'react'
import type { Product, Supermarket } from '../../types'
import { SUPERMARKET_LIST } from '../../styles/design-tokens'
import ProductCard from './ProductCard'

interface TabProducts {
  supermarket: Supermarket
  products: Product[]
  status?: 'ok' | 'empty' | 'error'
}

interface Props {
  tabs: TabProducts[]
  selectable?: boolean
  selectedIds?: Set<string>
  onToggle?: (product: Product, selected: boolean) => void
  choosable?: boolean
  chosenProducts?: Partial<Record<Supermarket, string>> | null
  onChoose?: (product: Product) => void
}

export default function SupermarketTabs({ tabs, selectable, selectedIds, onToggle, choosable, chosenProducts, onChoose }: Props) {
  const [active, setActive] = useState<Supermarket>(tabs[0]?.supermarket ?? 'tesco')

  const tabMap = Object.fromEntries(tabs.map(t => [t.supermarket, t]))

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {SUPERMARKET_LIST.map(sm => {
          const tab = tabMap[sm.id]
          if (!tab) return null
          const count = tab.products.length
          const isActive = active === sm.id
          return (
            <button
              key={sm.id}
              onClick={() => setActive(sm.id)}
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

      {/* Tab content */}
      {SUPERMARKET_LIST.map(sm => {
        const tab = tabMap[sm.id]
        if (!tab || sm.id !== active) return null
        if (tab.products.length === 0) {
          return (
            <div key={sm.id} className="py-12 text-center">
              <p className="text-sm text-ink-ghost">Not found at {sm.label}</p>
            </div>
          )
        }
        return (
          <div key={sm.id} className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
            {tab.products.map((p, i) => (
              <div key={p.id} className={`animate-fade-up stagger-${Math.min(i + 1, 8)}`}>
                <ProductCard
                  product={p}
                  selectable={selectable}
                  selected={selectedIds?.has(p.id)}
                  onToggle={selected => onToggle?.(p, selected)}
                  choosable={choosable}
                  chosen={choosable && chosenProducts?.[sm.id] === p.id}
                  onChoose={() => onChoose?.(p)}
                />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
