import { useState } from 'react'
import { useAtom } from 'jotai'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, RotateCcw, Wrench, ShoppingBasket } from 'lucide-react'
import Layout from '../components/layout/Layout'
import SupermarketTabs from '../components/products/SupermarketTabs'
import IngredientApprovalPanel from '../components/meals/IngredientApprovalPanel'
import ManualIngredientSearch from '../components/meals/ManualIngredientSearch'
import type { Ingredient, Product, Supermarket, SuggestedIngredient } from '../types'
import { MOCK_SUGGESTED_INGREDIENTS } from '../data/mock'
import { searchesAtom } from '../atoms/searches'
import { PILLS } from '../data/pills'
import { SUPERMARKETS, SUPERMARKET_META, SEARCH_STATUS_STYLES } from '../styles/design-tokens'

function getChosenPrices(ing: Ingredient): { supermarket: Supermarket; priceText: string }[] {
  if (!ing.selectedProducts) return []
  const prices: { supermarket: Supermarket; priceText: string }[] = []
  for (const sm of SUPERMARKETS) {
    const productId = ing.selectedProducts[sm]
    if (!productId) continue
    const product = ing.products.find(p => p.id === productId)
    if (product) prices.push({ supermarket: sm, priceText: product.priceText })
  }
  return prices
}

export default function MealDetail() {
  const { id } = useParams<{ id: string }>()

  const [searches, setSearches] = useAtom(searchesAtom)
  const search = searches.find(s => s.id === id)
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null)
  const [rescanning, setRescanning] = useState(false)
  const [rescanSuggestions, setRescanSuggestions] = useState<SuggestedIngredient[] | null>(null)
  const [showManualSearch, setShowManualSearch] = useState(false)

  if (!search) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-24">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-cream-dark flex items-center justify-center">
            <ShoppingBasket className="w-7 h-7 text-ink-ghost" />
          </div>
          <p className="text-ink-faint font-medium mb-4">Recipe search not found.</p>
          <Link to="/dashboard" className="text-forest-muted hover:text-forest text-sm font-medium transition-colors">
            Back to dashboard
          </Link>
        </div>
      </Layout>
    )
  }

  const pillLabels = search.activePills.map(id => PILLS.find(p => p.id === id)?.label ?? id)

  const handleRescan = async () => {
    setRescanning(true)
    await new Promise(r => setTimeout(r, 1500))
    setRescanSuggestions(MOCK_SUGGESTED_INGREDIENTS.slice(0, 3))
    setRescanning(false)
  }

  const handleRescanSave = (_groupId: string, approved: SuggestedIngredient[]) => {
    const newIngredients: Ingredient[] = approved.map((ing, i) => ({
      id: `rescan-${Date.now()}-${i}`,
      name: ing.name,
      quantity: ing.quantity,
      notes: ing.notes,
      searchStatus: 'pending',
      source: 'ai',
      selectedProducts: null,
      products: [],
    }))
    setSearches(prev => prev.map(s => {
      if (s.id !== id) return s
      return { ...s, ingredients: [...s.ingredients, ...newIngredients] }
    }))
    setRescanSuggestions(null)
  }

  const handleIngredientSaved = () => {
    setShowManualSearch(false)
  }

  const handleChooseProduct = (ingredientId: string, product: Product) => {
    setSearches(prev => prev.map(s => {
      if (s.id !== id) return s
      return {
        ...s,
        ingredients: s.ingredients.map(ing => {
          if (ing.id !== ingredientId) return ing
          const current = ing.selectedProducts ?? {}
          const isAlreadyChosen = current[product.supermarket] === product.id
          const updated = { ...current }
          if (isAlreadyChosen) {
            delete updated[product.supermarket]
          } else {
            updated[product.supermarket] = product.id
          }
          return { ...ing, selectedProducts: Object.keys(updated).length > 0 ? updated : null }
        }),
      }
    }))
  }

  const selectedIngredient = search?.ingredients.find(i => i.id === selectedIngredientId) ?? null

  const activeIngredient = selectedIngredient ?? search.ingredients.find(i => i.products.length > 0) ?? search.ingredients[0]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back + title */}
        <div className="animate-fade-up">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-ink-faint hover:text-forest-muted font-medium mb-4 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl text-ink">{search.recipeName}</h1>
              {pillLabels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {pillLabels.map(label => (
                    <span key={label} className="pill-active">
                      {label}
                    </span>
                  ))}
                </div>
              )}
              {search.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {search.keywords.map(kw => (
                    <span key={kw} className="pill-muted">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ingredient list + product panel */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5 animate-fade-up stagger-2">
          {/* Ingredient sidebar (horizontal scroll on mobile, vertical list on desktop) */}
          <div>
            <p className="label-section px-1 mb-3">
              Ingredients
            </p>
            <div className="flex md:flex-col gap-1.5 md:gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none">
              {search.ingredients.map(ing => {
                const status = SEARCH_STATUS_STYLES[ing.searchStatus]
                const chosenPrices = getChosenPrices(ing)
                return (
                  <button
                    key={ing.id}
                    onClick={() => setSelectedIngredientId(ing.id)}
                    className={[
                      'text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 flex-shrink-0 md:flex-shrink md:w-full snap-start',
                      (activeIngredient?.id === ing.id)
                        ? 'bg-white text-ink font-medium shadow-card border border-parchment'
                        : 'text-ink-muted hover:bg-white/60',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{ing.name}</span>
                      <span className="flex items-center gap-1.5 flex-shrink-0">
                        {ing.searchStatus === 'searching' && (
                          <Loader2 className="w-3 h-3 animate-spin text-aldi" />
                        )}
                        <span className={`text-xs font-semibold ${status.text}`}>
                          {ing.searchStatus === 'done' ? ing.products.length : ing.searchStatus}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                      </span>
                    </div>
                    {ing.source === 'manual' && (
                      <span className="text-[11px] text-ink-ghost mt-0.5 block">manual</span>
                    )}
                    {chosenPrices.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {chosenPrices.map(({ supermarket, priceText }) => (
                          <span
                            key={supermarket}
                            className="inline-flex items-center gap-1 text-[10px] text-ink-faint"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${SUPERMARKET_META[supermarket].bgColor}`} />
                            {priceText}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {search.ingredients.length === 0 && (
              <p className="text-xs text-ink-ghost px-1">No ingredients yet</p>
            )}
          </div>

          {/* Product panel */}
          <div className="card p-4 sm:p-6 min-h-[200px] sm:min-h-[240px]">
            {!activeIngredient ? (
              <div className="flex flex-col items-center justify-center h-full pt-12">
                <div className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center mb-3">
                  <ShoppingBasket className="w-5 h-5 text-ink-ghost" />
                </div>
                <p className="text-sm text-ink-ghost">Select an ingredient</p>
              </div>
            ) : activeIngredient.searchStatus === 'searching' ? (
              <div className="flex flex-col items-center justify-center h-full pt-12 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-forest-muted" />
                <p className="text-sm text-ink-faint">Searching supermarkets...</p>
              </div>
            ) : activeIngredient.searchStatus === 'pending' ? (
              <div className="flex flex-col items-center justify-center h-full pt-12">
                <div className="w-3 h-3 rounded-full bg-ink-ghost animate-pulse-soft mb-3" />
                <p className="text-sm text-ink-ghost">Search pending...</p>
              </div>
            ) : activeIngredient.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pt-12">
                <p className="text-sm text-ink-ghost">No products found</p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-2 mb-5">
                  <h2 className="font-display text-xl text-ink">{activeIngredient.name}</h2>
                  {activeIngredient.quantity && (
                    <span className="text-sm text-ink-faint">{activeIngredient.quantity}</span>
                  )}
                </div>
                <SupermarketTabs
                  tabs={SUPERMARKETS.map(sm => ({
                    supermarket: sm,
                    products: activeIngredient.products.filter(p => p.supermarket === sm),
                  }))}
                  choosable
                  chosenProducts={activeIngredient.selectedProducts}
                  onChoose={product => handleChooseProduct(activeIngredient.id, product)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Add more ingredients */}
        {search.status !== 'extracting' && search.status !== 'awaiting_approval' && (
          <div className="space-y-4 animate-fade-up stagger-4">
            <div className="border-t border-parchment pt-5">
              <p className="text-sm font-semibold text-ink-muted mb-3">Add more ingredients</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {search.status === 'done' && !rescanning && !rescanSuggestions && (
                  <button
                    onClick={handleRescan}
                    className="btn-secondary"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Rescan with AI
                  </button>
                )}
                <button
                  onClick={() => setShowManualSearch(v => !v)}
                  className="btn-secondary"
                >
                  <Wrench className="w-4 h-4" />
                  Search manually
                </button>
              </div>

              {rescanning && (
                <div className="flex items-center gap-2 text-sm text-ink-faint mt-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Looking for more ingredients...
                </div>
              )}
            </div>

            {/* Rescan approval */}
            {rescanSuggestions && (
              <IngredientApprovalPanel
                groupId={search.id}
                recipeName={search.recipeName}
                suggestions={rescanSuggestions}
                onSave={handleRescanSave}
                onCancel={() => setRescanSuggestions(null)}
                variant="rescan"
              />
            )}

            {/* Manual search */}
            {showManualSearch && (
              <div className="card p-4 sm:p-6">
                <p className="text-sm font-semibold text-ink-muted mb-3">Search for an ingredient manually</p>
                <ManualIngredientSearch
                  groupId={search.id}
                  onIngredientSaved={handleIngredientSaved}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
