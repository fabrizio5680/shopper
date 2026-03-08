import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import type { ManualSearchPanelState } from '../../types'
import { MOCK_MANUAL_SEARCH_RESULTS } from '../../data/mock'
import ManualIngredientSearchPanel from './ManualIngredientSearchPanel'

interface Props {
  groupId: string
  onIngredientSaved: () => void
}

export default function ManualIngredientSearch({ groupId, onIngredientSaved }: Props) {
  const [query, setQuery] = useState('')
  const [panelState, setPanelState] = useState<ManualSearchPanelState>({ phase: 'idle' })
  const [error, setError] = useState('')

  const canSearch = query.trim().length >= 2 && panelState.phase !== 'searching'

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSearch) return
    setError('')
    setPanelState({ phase: 'searching' })

    await new Promise(r => setTimeout(r, 1200))

    setPanelState({
      phase: 'preview',
      results: MOCK_MANUAL_SEARCH_RESULTS,
      normalizedQuery: query.trim().toLowerCase(),
    })
  }

  const handleSaved = () => {
    setPanelState({ phase: 'idle' })
    setQuery('')
    onIngredientSaved()
  }

  const handleCancel = () => {
    setPanelState({ phase: 'idle' })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-ghost" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value.slice(0, 100))}
            placeholder="e.g. whole milk, sourdough bread, olive oil"
            className="input pl-10 pr-4"
          />
        </div>
        <button
          type="submit"
          disabled={!canSearch}
          className="btn-primary"
        >
          {panelState.phase === 'searching' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {panelState.phase === 'preview' && (
        <ManualIngredientSearchPanel
          groupId={groupId}
          query={panelState.normalizedQuery}
          results={panelState.results}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}
