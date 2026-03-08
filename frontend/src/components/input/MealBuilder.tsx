import { useState } from 'react'
import { ChefHat, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import PillSelector from './PillSelector'
import KeywordRefinement from './KeywordRefinement'
import { extractIngredients } from '../../api/callables'
import type { SuggestedIngredient } from '../../types'

interface Props {
  onSuggestionsReady: (groupId: string, recipeName: string, ingredients: SuggestedIngredient[]) => void
}

export default function MealBuilder({ onSuggestionsReady }: Props) {
  const [recipeName, setRecipeName] = useState('')
  const [activePills, setActivePills] = useState<string[]>([])
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPills, setShowPills] = useState(false)
  const [showKeywords, setShowKeywords] = useState(false)

  const canSubmit = recipeName.trim().length >= 3 && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)

    try {
      const result = await extractIngredients({
        recipeName: recipeName.trim(),
        activePills,
        keywords,
      })
      const { groupId, recipeName: name, suggestions } = result.data
      onSuggestionsReady(groupId, name, suggestions)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      // Firebase callable errors have a .message with the server error
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-scale-in card">
      {/* Recipe name input */}
      <div className="p-4 sm:p-6 pb-5">
        <label className="label-field">
          What would you like to cook?
        </label>
        <div className="relative">
          <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-ghost" />
          <input
            type="text"
            value={recipeName}
            onChange={e => setRecipeName(e.target.value.slice(0, 80))}
            placeholder="e.g. Ramen, Pasta Carbonara, Beef Stew"
            className="input pl-12 pr-4 py-3.5 text-base"
          />
        </div>
        {error && (
          <p className="mt-2.5 error-text">{error}</p>
        )}
      </div>

      {/* Dietary preferences */}
      <div className="border-t border-parchment/60">
        <button
          type="button"
          onClick={() => setShowPills(v => !v)}
          className="collapsible-trigger"
        >
          <span className="flex items-center gap-2">
            Dietary preferences
            {activePills.length > 0 && (
              <span className="px-2 py-0.5 bg-sage-faint text-forest-muted rounded-full text-xs font-semibold">
                {activePills.length}
              </span>
            )}
          </span>
          {showPills ? <ChevronUp className="w-4 h-4 text-ink-ghost" /> : <ChevronDown className="w-4 h-4 text-ink-ghost" />}
        </button>
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: showPills ? '400px' : '0', opacity: showPills ? 1 : 0 }}
        >
          <div className="px-4 sm:px-6 pb-5">
            <PillSelector selected={activePills} onChange={setActivePills} />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="border-t border-parchment/60">
        <button
          type="button"
          onClick={() => setShowKeywords(v => !v)}
          className="collapsible-trigger"
        >
          <span className="flex items-center gap-2">
            Keyword refinements
            {keywords.length > 0 && (
              <span className="px-2 py-0.5 bg-parchment text-ink-faint rounded-full text-xs font-semibold">
                {keywords.length}
              </span>
            )}
          </span>
          {showKeywords ? <ChevronUp className="w-4 h-4 text-ink-ghost" /> : <ChevronDown className="w-4 h-4 text-ink-ghost" />}
        </button>
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: showKeywords ? '300px' : '0', opacity: showKeywords ? 1 : 0 }}
        >
          <div className="px-4 sm:px-6 pb-5">
            <KeywordRefinement keywords={keywords} onChange={setKeywords} />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 sm:px-6 py-5 bg-cream/30">
        <button
          type="submit"
          disabled={!canSubmit}
          className="btn-primary w-full py-3.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting ingredients...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Get ingredients
            </>
          )}
        </button>
      </div>
    </form>
  )
}
