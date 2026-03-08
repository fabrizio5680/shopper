import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { ManualSearchResult, Product } from '../../types'
import SupermarketTabs from '../products/SupermarketTabs'

interface Props {
  groupId: string
  query: string
  results: ManualSearchResult[]
  onSaved: () => void
  onCancel: () => void
}

export default function ManualIngredientSearchPanel({ query, results, onSaved, onCancel }: Props) {
  const [ingredientName, setIngredientName] = useState(
    query.replace(/\b\w/g, c => c.toUpperCase())
  )
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>()
    for (const r of results) {
      const first = r.products.find(p => p.available)
      if (first) ids.add(first.id)
    }
    return ids
  })
  const [saving, setSaving] = useState(false)

  const totalProducts = results.reduce((n, r) => n + r.products.length, 0)
  const selectedSupermarkets = new Set(
    results.flatMap(r => r.products.filter(p => selectedIds.has(p.id)).map(() => r.supermarket))
  ).size

  const handleToggle = (product: Product, selected: boolean) => {
    const next = new Set(selectedIds)
    if (selected) next.add(product.id); else next.delete(product.id)
    setSelectedIds(next)
  }

  const handleSave = async () => {
    if (selectedIds.size === 0 || !ingredientName.trim()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    onSaved()
    setSaving(false)
  }

  const tabs = results.map(r => ({
    supermarket: r.supermarket,
    products: r.products,
    status: r.status,
  }))

  return (
    <div className="animate-scale-in card">
      {/* Header */}
      <div className="card-section">
        <h3 className="font-display text-lg text-ink">
          Results for <span className="text-forest">"{query}"</span>
        </h3>
        <p className="text-sm text-ink-faint mt-0.5">
          {totalProducts} products found across all supermarkets
        </p>
      </div>

      {/* Ingredient metadata */}
      <div className="px-4 sm:px-6 py-4 border-b border-parchment/60 space-y-3 bg-cream/30">
        <div>
          <label className="label-section mb-1.5 block">
            Save as ingredient
          </label>
          <input
            type="text"
            value={ingredientName}
            onChange={e => setIngredientName(e.target.value.slice(0, 100))}
            className="input-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Quantity (optional)</label>
            <input
              type="text"
              value={quantity}
              onChange={e => setQuantity(e.target.value.slice(0, 200))}
              placeholder="e.g. 500ml, 2 cans"
              className="input-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-ghost mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value.slice(0, 200))}
              placeholder="e.g. lactose-free preferred"
              className="input-sm"
            />
          </div>
        </div>
      </div>

      {/* Product selection */}
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        <SupermarketTabs
          tabs={tabs}
          selectable
          selectedIds={selectedIds}
          onToggle={handleToggle}
        />
      </div>

      {/* Footer */}
      <div className="card-footer flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="text-sm text-ink-faint text-center sm:text-left">
          {selectedIds.size > 0
            ? `${selectedIds.size} product${selectedIds.size !== 1 ? 's' : ''} selected from ${selectedSupermarkets} supermarket${selectedSupermarkets !== 1 ? 's' : ''}`
            : 'No products selected'}
        </div>
        <div className="flex items-center gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selectedIds.size === 0 || !ingredientName.trim() || saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save ingredient'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
