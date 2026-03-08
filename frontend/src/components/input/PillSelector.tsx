import { PILLS, PILL_CATEGORIES } from '../../data/pills'

interface Props {
  selected: string[]
  onChange: (ids: string[]) => void
}

const MAX_PILLS = 8

export default function PillSelector({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(p => p !== id))
    } else if (selected.length < MAX_PILLS) {
      onChange([...selected, id])
    }
  }

  return (
    <div className="space-y-4">
      {PILL_CATEGORIES.map(cat => (
        <div key={cat.key}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-ghost mb-2">
            {cat.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PILLS.filter(p => p.category === cat.key).map(pill => {
              const active = selected.includes(pill.id)
              const disabled = !active && selected.length >= MAX_PILLS
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => toggle(pill.id)}
                  disabled={disabled}
                  className={[
                    'px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border',
                    active
                      ? 'bg-forest border-forest text-white shadow-sm'
                      : disabled
                        ? 'bg-cream border-parchment text-ink-ghost cursor-not-allowed'
                        : 'bg-white border-parchment text-ink-muted hover:border-forest-muted hover:text-forest hover:bg-sage-faint/30',
                  ].join(' ')}
                >
                  {pill.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {selected.length > 0 && (
        <p className="text-xs text-ink-ghost">
          {selected.length}/{MAX_PILLS} selected
        </p>
      )}
    </div>
  )
}
