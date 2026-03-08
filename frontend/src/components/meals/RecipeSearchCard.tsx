import { useNavigate } from 'react-router-dom'
import { Trash2, Clock, ChevronRight, AlertCircle, Loader2, Check } from 'lucide-react'
import type { RecipeSearch } from '../../types'
import { STATUS_STYLES } from '../../styles/design-tokens'
import { PILLS } from '../../data/pills'

interface Props {
  search: RecipeSearch
  onDelete: (id: string) => void
  selectable?: boolean
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function RecipeSearchCard({ search, onDelete, selectable, selected, onToggleSelect }: Props) {
  const navigate = useNavigate()
  const badge = STATUS_STYLES[search.status]
  const pillLabels = search.activePills.map(id => PILLS.find(p => p.id === id)?.label ?? id)
  const doneCount = search.ingredients.filter(i => i.searchStatus === 'done').length
  const productCount = search.ingredients.reduce((n, i) => n + i.products.length, 0)

  const handleClick = () => {
    if (selectable) {
      onToggleSelect?.(search.id)
    } else {
      navigate(`/search/${search.id}`)
    }
  }

  return (
    <div
      className={[
        'bg-white rounded-2xl border p-5 transition-all duration-300 cursor-pointer group',
        selectable && selected
          ? 'border-forest shadow-card'
          : 'border-parchment hover:border-sage hover:shadow-card-hover',
      ].join(' ')}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {selectable && (
            <div className="mt-1 flex-shrink-0">
              <div className={selected ? 'checkbox-checked' : 'checkbox-unchecked'}>
                {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-display text-lg text-ink">{search.recipeName}</h3>
              <span className={`badge ${badge.className}`}>
                {search.status === 'searching' && <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />}
                {search.status === 'error' && <AlertCircle className="w-3 h-3 inline mr-1" />}
                {badge.label}
              </span>
            </div>

            {/* Pills */}
            {pillLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {pillLabels.map(label => (
                  <span key={label} className="pill-active">
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Keywords */}
            {search.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {search.keywords.map(kw => (
                  <span key={kw} className="pill-muted">
                    {kw}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-3 text-xs text-ink-ghost">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(search.createdAt)}
              </span>
              {search.ingredients.length > 0 && (
                <span>{doneCount}/{search.ingredients.length} ingredients</span>
              )}
              {productCount > 0 && (
                <span>{productCount} products</span>
              )}
            </div>
          </div>
        </div>

        {!selectable && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); onDelete(search.id) }}
              className="p-2 text-ink-ghost/0 group-hover:text-ink-ghost hover:!text-terracotta rounded-lg hover:bg-terracotta-faint transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <ChevronRight className="w-4 h-4 text-ink-ghost group-hover:text-forest-muted group-hover:translate-x-0.5 transition-all duration-200" />
          </div>
        )}
      </div>

      {search.errorMessage && (
        <p className="mt-3 error-banner">
          {search.errorMessage}
        </p>
      )}
    </div>
  )
}
