import { useRef, useState } from 'react'
import { ExternalLink, Loader2, Check, Pencil } from 'lucide-react'
import type { SuggestedIngredient } from '../../types'
import { supermarketSearchUrls } from '../../utils/supermarket-urls'
import { SUPERMARKET_META } from '../../styles/design-tokens'
import type { Supermarket } from '../../styles/design-tokens'

interface Props {
  groupId: string
  recipeName: string
  suggestions: SuggestedIngredient[]
  onSave: (groupId: string, approved: SuggestedIngredient[]) => Promise<void>
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
  const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map())
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelCommitRef = useRef<number | null>(null)

  const getDisplayName = (i: number) => editedNames.get(i) ?? suggestions[i].name

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

  const commitEditedName = (i: number, rawValue: string) => {
    const trimmed = rawValue.trim()

    setEditedNames(prev => {
      const next = new Map(prev)

      if (trimmed.length === 0 || trimmed === suggestions[i].name) {
        next.delete(i)
      } else {
        next.set(i, trimmed)
      }

      return next
    })

    setEditingIndex(null)
  }

  const handleSave = async () => {
    if (selected.size === 0) return
    setSaving(true)
    setError(null)
    try {
      const approved = [...selected]
        .sort((a, b) => a - b)
        .map(i => ({
          ...suggestions[i],
          name: getDisplayName(i).trim(),
        }))
      await onSave(groupId, approved)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save ingredients. Please try again.'
      setError(message)
    } finally {
      setSaving(false)
    }
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
          const urls = supermarketSearchUrls(getDisplayName(i))
          const isSelected = selected.has(i)
          const hasEditedName = getDisplayName(i) !== ing.name
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
                  {editingIndex === i ? (
                    <input
                      type="text"
                      maxLength={100}
                      defaultValue={getDisplayName(i)}
                      autoFocus
                      className="input-sm bg-cream/50 border-0 border-b border-parchment/70 rounded-none px-1 py-0.5 h-auto min-h-0 focus:ring-0 focus:border-forest-muted"
                      onClick={e => e.stopPropagation()}
                      onBlur={e => {
                        if (cancelCommitRef.current === i) {
                          cancelCommitRef.current = null
                          return
                        }
                        commitEditedName(i, e.currentTarget.value)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          commitEditedName(i, e.currentTarget.value)
                          return
                        }

                        if (e.key === 'Escape') {
                          e.preventDefault()
                          cancelCommitRef.current = i
                          setEditingIndex(null)
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-left"
                      onClick={e => {
                        e.stopPropagation()
                        setEditingIndex(i)
                      }}
                      title="Edit ingredient name"
                    >
                      <span className={hasEditedName ? 'font-semibold text-ink italic' : 'font-semibold text-ink'}>
                        {getDisplayName(i)}
                      </span>
                      <Pencil className="w-3.5 h-3.5 text-ink-ghost hover:text-forest-muted transition-colors" />
                      {hasEditedName && (
                        <span className="text-ink-ghost text-xs">(edited)</span>
                      )}
                    </button>
                  )}
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

      {error && (
        <div className="px-4 sm:px-6 py-2">
          <p className="error-text">{error}</p>
        </div>
      )}

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
