import { ExternalLink, Check } from 'lucide-react'
import type { Product } from '../../types'

interface Props {
  product: Product
  selectable?: boolean
  selected?: boolean
  onToggle?: (selected: boolean) => void
  choosable?: boolean
  chosen?: boolean
  onChoose?: () => void
}

export default function ProductCard({ product, selectable, selected, onToggle, choosable, chosen, onChoose }: Props) {
  const handleClick = () => {
    if (selectable && onToggle) onToggle(!selected)
  }

  const isHighlighted = (selectable && selected) || (choosable && chosen)

  return (
    <div
      onClick={selectable ? handleClick : undefined}
      className={[
        'relative rounded-xl border p-4 transition-all duration-200',
        selectable ? 'cursor-pointer' : '',
        isHighlighted
          ? 'border-forest bg-sage-faint/30 shadow-card'
          : 'border-parchment bg-white hover:border-sage hover:shadow-card',
      ].join(' ')}
    >
      {selectable && (
        <div className="absolute top-3 left-3">
          <div className={selected ? 'checkbox-checked' : 'checkbox-unchecked'}>
            {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
        </div>
      )}

      {choosable && chosen && (
        <div className="absolute top-3 right-3">
          <div className="w-5 h-5 rounded-full bg-forest flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {product.imageUrl && (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-28 object-contain mb-3 rounded-lg bg-cream"
        />
      )}

      <div className={selectable ? 'pl-7' : ''}>
        <p className="text-sm font-medium text-ink leading-snug line-clamp-2">{product.name}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-forest">{product.priceText}</span>
          {product.unitPrice && (
            <span className="text-xs text-ink-ghost">{product.unitPrice}</span>
          )}
        </div>

        {!product.available && (
          <span className="inline-block mt-1.5 text-xs text-terracotta font-semibold">
            Out of stock
          </span>
        )}

        <div className="mt-3 flex items-center gap-3">
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-forest-muted hover:text-forest font-medium transition-colors duration-150"
          >
            View
            <ExternalLink className="w-3 h-3" />
          </a>

          {choosable && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChoose?.() }}
              className={[
                'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200',
                chosen
                  ? 'bg-forest text-white'
                  : 'border border-parchment text-ink-faint hover:border-forest-muted hover:text-forest',
              ].join(' ')}
            >
              {chosen ? (
                <>
                  <Check className="w-3 h-3" strokeWidth={3} />
                  Chosen
                </>
              ) : (
                'Choose'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
