import { useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { Plus, X, UtensilsCrossed, ShoppingCart, CheckSquare } from 'lucide-react'
import Layout from '../components/layout/Layout'
import RecipeSearchCard from '../components/meals/RecipeSearchCard'
import MealBuilder from '../components/input/MealBuilder'
import IngredientApprovalPanel from '../components/meals/IngredientApprovalPanel'
import ShoppingList from '../components/meals/ShoppingList'
import type { RecipeSearch, SuggestedIngredient } from '../types'
import { searchesAtom } from '../atoms/searches'

type PanelState =
  | { mode: 'none' }
  | { mode: 'builder' }
  | { mode: 'approval'; groupId: string; recipeName: string; suggestions: SuggestedIngredient[] }

export default function Dashboard() {
  const navigate = useNavigate()
  const [searches, setSearches] = useAtom(searchesAtom)
  const [panel, setPanel] = useState<PanelState>({ mode: 'none' })
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showShoppingList, setShowShoppingList] = useState(false)

  const handleDelete = (id: string) => {
    setSearches(prev => prev.filter(s => s.id !== id))
  }

  const handleSuggestionsReady = (groupId: string, recipeName: string, suggestions: SuggestedIngredient[]) => {
    setPanel({ mode: 'approval', groupId, recipeName, suggestions })
  }

  const handleApprovalSave = (groupId: string, approved: SuggestedIngredient[]) => {
    const newSearch: RecipeSearch = {
      id: groupId,
      recipeName: panel.mode === 'approval' ? panel.recipeName : 'Recipe',
      activePills: [],
      keywords: [],
      status: 'searching',
      errorMessage: null,
      createdAt: new Date(),
      ingredients: approved.map((ing, i) => ({
        id: `${groupId}-ing-${i}`,
        name: ing.name,
        quantity: ing.quantity,
        notes: ing.notes,
        searchStatus: 'pending',
        source: 'ai',
        selectedProducts: null,
        products: [],
      })),
    }
    setSearches(prev => [newSearch, ...prev])
    setPanel({ mode: 'none' })
    navigate(`/search/${groupId}`)
  }

  const handleApprovalCancel = () => {
    setPanel({ mode: 'none' })
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
    setShowShoppingList(false)
  }

  const handleShowShoppingList = () => {
    setShowShoppingList(true)
  }

  const selectedSearches = searches.filter(s => selectedIds.has(s.id))

  // Count how many chosen products exist across selected recipes
  const chosenCount = selectedSearches.reduce((n, s) =>
    n + s.ingredients.reduce((m, ing) =>
      m + (ing.selectedProducts ? Object.keys(ing.selectedProducts).length : 0), 0), 0)

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-up">
          <h1 className="font-display text-2xl sm:text-3xl text-ink">My recipes</h1>
          <div className="flex items-center gap-2">
            {!selectMode && panel.mode === 'none' && searches.length > 0 && (
              <>
                <button
                  onClick={() => setSelectMode(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 border border-parchment hover:border-forest-muted text-sm text-ink-muted hover:text-forest font-medium rounded-xl transition-all duration-200 bg-white hover:shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Shopping list</span>
                </button>
                <button
                  onClick={() => setPanel({ mode: 'builder' })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-light text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-card hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4" />
                  New recipe
                </button>
              </>
            )}
            {!selectMode && panel.mode === 'none' && searches.length === 0 && (
              <button
                onClick={() => setPanel({ mode: 'builder' })}
                className="flex items-center gap-2 px-4 py-2.5 bg-forest hover:bg-forest-light text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-card hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                New recipe
              </button>
            )}
            {selectMode && (
              <button
                onClick={exitSelectMode}
                className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink-muted font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            {panel.mode !== 'none' && !selectMode && (
              <button
                onClick={() => setPanel({ mode: 'none' })}
                className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink-muted font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Select mode banner */}
        {selectMode && !showShoppingList && (
          <div className="animate-fade-up flex items-center justify-between bg-sage-faint/40 border border-sage-faint rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-forest-muted" />
              <span className="text-sm text-ink-muted font-medium">
                {selectedIds.size === 0
                  ? 'Select recipes for your shopping list'
                  : `${selectedIds.size} recipe${selectedIds.size !== 1 ? 's' : ''} selected`}
              </span>
            </div>
            {selectedIds.size > 0 && (
              <button
                onClick={handleShowShoppingList}
                className="flex items-center gap-2 px-4 py-2 bg-forest hover:bg-forest-light text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                View list
                {chosenCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                    {chosenCount}
                  </span>
                )}
              </button>
            )}
          </div>
        )}

        {/* Shopping list */}
        {showShoppingList && (
          <div className="animate-fade-up">
            <ShoppingList
              searches={selectedSearches}
              onClose={() => setShowShoppingList(false)}
            />
          </div>
        )}

        {/* Builder panel */}
        {panel.mode === 'builder' && (
          <MealBuilder onSuggestionsReady={handleSuggestionsReady} />
        )}

        {/* Approval panel */}
        {panel.mode === 'approval' && (
          <IngredientApprovalPanel
            groupId={panel.groupId}
            recipeName={panel.recipeName}
            suggestions={panel.suggestions}
            onSave={handleApprovalSave}
            onCancel={handleApprovalCancel}
          />
        )}

        {/* Recipe list */}
        {searches.length === 0 && panel.mode === 'none' ? (
          <div className="animate-fade-up text-center py-20">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-cream-dark flex items-center justify-center">
              <UtensilsCrossed className="w-7 h-7 text-ink-ghost" />
            </div>
            <p className="font-display text-xl text-ink-faint mb-2">No recipes yet</p>
            <p className="text-sm text-ink-ghost">
              Click &ldquo;New recipe&rdquo; to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((s, i) => (
              <div key={s.id} className={`animate-fade-up stagger-${Math.min(i + 1, 8)}`}>
                <RecipeSearchCard
                  search={s}
                  onDelete={handleDelete}
                  selectable={selectMode}
                  selected={selectedIds.has(s.id)}
                  onToggleSelect={handleToggleSelect}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
