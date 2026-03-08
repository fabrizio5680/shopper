import { useState } from 'react'
import { ExternalLink, Loader2, Check } from 'lucide-react'
import type { SuggestedIngredient } from '../../types'
import { supermarketSearchUrls } from '../../data/mock'
import { SUPERMARKET_META } from '../../styles/design-tokens'
import type { Supermarket } from '../../styles/design-tokens'

interface Props {
  groupId: string
  recipeName: string
  suggestions: SuggestedIngredient[]
  onSave: (groupId: string, approved: SuggestedIngredient[]) => void
  onCancel: () => void
  variant?: 'initial' | 'rescan'
}

export default function IngredientApprovalPanel({
  groupId,
  recipeName,
  suggestions,
  onSave,
  onCancel,
  variant = 'initial',
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggleAll = () => {
    if (selected.size === suggestions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(suggestions.map((_, i) => i)))
    }
  }

  const toggle = (i: number) => {
    const next = new Set(selected)
    if (next.has(i)) next.delete(i); else next.add(i)
    setSelected(next)
  }

  const handleSave = async () => {
    if (selected.size === 0) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    onSave(groupId, suggestions.filter((_, i) => selected.has(i)))
    setSaving(false)
  }

  if (suggestions.length === 0) {
    return (
      <div className="animate-scale-in card p-10 text-center">
        <div className="empty-state-icon">
          <Check className="w-6 h-6 text-ink-ghost" />
        </div>
        <p className="text-ink-faint font-medium">No new ingredients found.</p>
        <button onClick={onCancel} className="mt-4 text-sm text-forest-muted hover:text-forest font-medium transition-colors">
          Go back
        </button>
      </div>
    )
  }

  const allSelected = selected.size === suggestions.length

  return (
    <div className="animate-scale-in card">
      {/* Header */}
      <div className="card-section flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg text-ink">
            {variant === 'rescan' ? 'New ingredients found' : 'Review ingredients'} for{' '}
            <span className="text-forest">{recipeName}</span>
          </h2>
          <p className="text-sm text-ink-faint mt-0.5">
            Select the ingredients you want to keep
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm text-forest-muted hover:text-forest font-medium whitespace-nowrap transition-colors self-start sm:self-auto"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* Ingredient list */}
      <ul>
        {suggestions.map((ing, i) => {
          const urls = supermarketSearchUrls(ing.name)
          const isSelected = selected.has(i)
          return (
            <li
              key={i}
              className={[
                'flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 transition-all duration-200 cursor-pointer border-b border-parchment/40 last:border-b-0',
                isSelected ? 'bg-sage-faint/30' : 'hover:bg-cream/80',
              ].join(' ')}
              onClick={() => toggle(i)}
            >
              {/* Checkbox */}
              <div className="mt-0.5 flex-shrink-0">
                <div className={isSelected ? 'checkbox-checked' : 'checkbox-unchecked'}>
                  {isSelected && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-semibold text-ink">{ing.name}</span>
                  {ing.quantity && (
                    <span className="text-sm text-ink-faint">{ing.quantity}</span>
                  )}
                </div>
                {ing.notes && (
                  <p className="text-sm text-ink-ghost mt-0.5">{ing.notes}</p>
                )}
                {/* Supermarket search links */}
                <div className="flex gap-1.5 mt-2.5" onClick={e => e.stopPropagation()}>
                  {Object.entries(urls).map(([sm, url]) => (
                    <a
                      key={sm}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Search on ${sm}`}
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-xs font-semibold transition-colors duration-150 ${SUPERMARKET_META[sm as Supermarket]?.searchBadge ?? ''}`}
                    >
                      {SUPERMARKET_META[sm as Supermarket]?.shortLabel ?? sm}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Footer */}
      <div className="card-footer flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
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
          disabled={selected.size === 0 || saving}
          className="btn-primary"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            `Save ${selected.size > 0 ? selected.size : ''} ingredient${selected.size !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  )
}
