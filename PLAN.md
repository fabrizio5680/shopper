# Shopper: Meal Planning + Irish Supermarket Price Comparison

## Context
Build a web app from scratch where authenticated users can enter meals they want to cook. AI extracts the required ingredients, then the app searches 5 Irish supermarkets (Tesco, SuperValu, Dunnes, Aldi, Lidl) for matching products. Meals and products are saved persistently. Users sign in with Google. Infrastructure: Firebase Auth, Firestore, Cloud Functions, Hosting.

The project directory `/Users/fabrizio/github/shopper` is currently empty.

---

## Tech Stack
- **Frontend**: React + TypeScript + Vite (Firebase Hosting)
- **Functions**: Firebase Cloud Functions v2 (Node.js/TypeScript)
- **Database**: Firestore
- **Auth**: Firebase Auth (Google Sign-In)
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`) for ingredient extraction
- **Scraping**: axios + cheerio (primary), puppeteer-core + @sparticuz/chromium (fallback for Aldi/Lidl)

---

## Project Structure
```
shopper/
├── package.json                 # Root workspace config (npm workspaces)
├── firebase.json
├── .firebaserc
├── .gitignore
├── shared/                      # @shopper/shared — shared types & constants
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts             # Re-exports everything
│       ├── types.ts             # Shared domain types (Supermarket, Product, Ingredient, etc.)
│       ├── callable.ts          # Request/response interfaces for each callable function
│       └── pills.ts             # Pill definitions (used by both frontend rendering & backend prompt assembly)
├── frontend/                    # Vite + React + TypeScript
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json             # depends on @shopper/shared
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── firebase.ts          # Firebase client SDK init
│       ├── styles/
│       │   └── design-tokens.ts # Supermarket meta, status styles — JS mirror of CSS tokens
│       ├── types/index.ts       # Frontend-only types (UI state machines, component props)
│       ├── contexts/AuthContext.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useMeals.ts
│       ├── components/
│       │   ├── layout/          # Header, Layout
│       │   ├── auth/            # GoogleSignInButton
│       │   ├── meals/           # RecipeSearchCard, IngredientApprovalPanel, ManualIngredientSearch, ManualIngredientSearchPanel, ShoppingList
│       │   ├── input/           # RecipeNameInput, PillSelector, KeywordRefinement, MealBuilder
│       │   ├── products/        # ProductCard (with optional checkbox mode), ProductGrid, SupermarketTabs
│       │   └── ui/              # LoadingSpinner, ErrorBoundary
│       └── pages/
│           ├── Home.tsx
│           ├── Dashboard.tsx
│           └── MealDetail.tsx
└── functions/                   # Firebase Cloud Functions
    ├── package.json             # depends on @shopper/shared
    ├── tsconfig.json
    └── src/
        ├── index.ts             # Function exports
        ├── config/constants.ts  # URLs, headers, Aldi/Lidl category maps (pills moved to shared/)
        ├── types/index.ts       # Functions-only types (scraper interfaces, internal service types)
        ├── ai/
        │   ├── extractIngredients.ts    # Claude API — ingredient extraction
        │   └── validateRecipe.ts        # Claude API — recipe classification gate
        ├── scrapers/
        │   ├── base.scraper.ts          # Abstract interface
        │   ├── tesco.scraper.ts
        │   ├── supervalu.scraper.ts
        │   ├── dunnes.scraper.ts
        │   ├── aldi.scraper.ts
        │   └── lidl.scraper.ts
        ├── services/
        │   ├── scraping.service.ts      # Promise.allSettled orchestrator
        │   └── firestore.service.ts
        └── functions/
            ├── extractIngredients.fn.ts
            ├── saveIngredients.fn.ts
            ├── rescanIngredients.fn.ts
            ├── searchProducts.fn.ts
            ├── searchIngredientQuery.fn.ts
            ├── saveManualIngredient.fn.ts
            └── deleteRecipeSearch.fn.ts
```

### Shared Package (`@shopper/shared`)

The `shared/` directory is an internal npm workspace package that provides a single source of truth for types and constants used by both frontend and functions. This prevents type drift and ensures callable function contracts are enforced at compile time.

**Root `package.json`** (workspace config):

```json
{
  "private": true,
  "workspaces": ["shared", "frontend", "functions"]
}
```

**`shared/package.json`**:

```json
{
  "name": "@shopper/shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

Both `frontend/package.json` and `functions/package.json` add `"@shopper/shared": "*"` as a dependency, then import directly:

```ts
import type { Product, Supermarket, Pill } from '@shopper/shared'
import type { ExtractIngredientsRequest } from '@shopper/shared'
```

**What lives in `shared/`:**

- **`types.ts`** — Domain types shared across the stack: `Supermarket`, `GroupStatus`, `SearchStatus`, `IngredientSource`, `Pill`, `Product`, `Ingredient` (including `selectedProducts` map), `SuggestedIngredient`, `RecipeSearch`
- **`callable.ts`** — Request/response interfaces for every callable function (e.g. `ExtractIngredientsRequest`, `ExtractIngredientsResponse`, `SaveIngredientsRequest`, etc.) — ensures frontend call sites and backend handlers never drift
- **`pills.ts`** — The pill definitions array (id, label, category, promptDescription) — frontend uses it for rendering chips, backend uses it for prompt assembly and ID validation

**What stays local:**

- **Frontend-only** (`frontend/src/types/index.ts`): `ManualSearchPanelState`, `ManualSearchResult`, UI component prop types, any React-specific types
- **Functions-only** (`functions/src/types/index.ts`): `ScrapedProduct`, scraper interfaces, Firestore admin types, internal service types

**Build considerations:**
- Vite resolves `@shopper/shared` via npm workspaces — no extra config needed since `shared/` exports raw `.ts` files
- Cloud Functions deployment: `firebase deploy` runs from the workspace root; npm workspaces ensure `shared/` is available in `functions/node_modules/@shopper/shared`. The `functions` tsconfig must include `shared/src` in its compilation scope (via `references` or `paths`)
- No separate build step for `shared/` — both consumers compile it directly from TypeScript source

---

## Firestore Data Model

Each submission of (recipe name + pills + keywords) creates an **immutable snapshot group** with a unique auto-generated ID. Adding or changing any pill or keyword produces a new group — the old one is never mutated. Users can delete any group.

```
users/{userId}
  uid, email, displayName, photoURL, createdAt

users/{userId}/recipeSearches/{groupId}       # one doc per unique submission
  id: string                   # auto-generated (Firestore doc ID)
  recipeName: string           # validated recipe name (e.g. "Ramen")
  activePills: string[]        # pill IDs at time of submission (e.g. ["organic", "gluten-free"])
  keywords: string[]           # sanitized keywords at time of submission (e.g. ["chicken broth"])
  builtPrompt: string          # full assembled prompt sent to Claude (server-side, for audit)
  status: "extracting" | "awaiting_approval" | "searching" | "done" | "error"
  errorMessage: string | null
  createdAt: Timestamp

users/{userId}/recipeSearches/{groupId}/ingredients/{ingredientId}
  name: string                 # e.g. "whole milk"
  quantity: string             # e.g. "500ml"
  notes: string                # e.g. "lactose-free preferred"
  searchStatus: "pending" | "searching" | "done" | "error"
  source: "ai" | "manual"      # "ai" = extracted by Claude; "manual" = added via manual search
  selectedProducts: Record<Supermarket, string> | null  # e.g. { tesco: "prod123", supervalu: "prod456" } — one chosen product per supermarket

users/{userId}/recipeSearches/{groupId}/ingredients/{ingredientId}/products/{productId}
  supermarket: "tesco" | "supervalu" | "dunnes" | "aldi" | "lidl"
  name: string
  price: number                # euros
  priceText: string            # e.g. "€1.49"
  unitPrice: string | null     # e.g. "€2.98/litre"
  imageUrl: string | null
  productUrl: string           # clickable link
  available: boolean
  scrapedAt: Timestamp

scrapingCache/{supermarket}_{normalizedIngredient}
  ingredient, supermarket, products: Product[]
  cachedAt, expiresAt: Timestamp  # 6-hour TTL
```

**Key model decisions:**
- `recipeSearches` replaces `meals` — the name makes clear each doc is a discrete snapshot, not a mutable meal record
- Pills and keywords are snapshotted at submission time so the saved group always reflects exactly what was searched
- Deleting a group requires a recursive delete of the group doc + all `ingredients` + all nested `products` subcollections — handled server-side by a `deleteRecipeSearch` callable (client cannot recursively delete subcollections directly)

**Security rules**: `users/{userId}/**` readable/writable only by matching `request.auth.uid`. Cache readable by any authed user, writable only via Admin SDK.

---

## Firebase Cloud Functions

### `extractIngredients` (HTTPS Callable)
- Input: `{ recipeName, activePills, keywords }`
- **Step 1 — Recipe gate** (`validateRecipe.ts`): Claude yes/no classification. If invalid, returns `HttpsError("invalid-argument", reason)`. ~100 tokens.
- **Step 2 — Prompt assembly** (server-side): Recipe name + resolved pill descriptions + sanitized keywords assembled into hardcoded template
- **Step 3 — Group creation**: Creates `users/{userId}/recipeSearches/{newGroupId}` doc with `status: "awaiting_approval"` and snapshotted inputs. **No ingredients written yet.**
- **Step 4 — Ingredient extraction**: Sends prompt to Claude via structured tool-use. Zod validates response.
- Returns `{ groupId, suggestedIngredients: Ingredient[] }` to client — ingredients are **not persisted** until user approves them
- Memory: 256MB, Timeout: 60s

### `saveIngredients` (HTTPS Callable)
- Input: `{ groupId, approvedIngredients: Ingredient[] }` — called after user reviews and confirms their selection
- Verifies auth + group ownership
- Validates `approvedIngredients` array: each item checked against Zod schema (name, quantity, notes — no arbitrary fields)
- Writes only the approved ingredients to `recipeSearches/{groupId}/ingredients/` subcollection
- Updates group `status: "searching"`
- Triggers `searchProducts` logic (inline or task queue) for the saved ingredients
- Returns `{ savedCount: number }`
- Memory: 256MB, Timeout: 30s

### `rescanIngredients` (HTTPS Callable)
- Input: `{ groupId }`
- Verifies auth + group ownership
- Reads all existing ingredient names from `recipeSearches/{groupId}/ingredients/` subcollection
- Reads the original `builtPrompt` and `recipeName` from the group doc
- Calls Claude with the original prompt context **plus an exclusion instruction**: "The user already has these ingredients: [{existingNames}]. Return ONLY ingredients not in this list."
- Validates Claude response with Zod
- Returns `{ suggestedIngredients: Ingredient[] }` — only new suggestions, **not persisted** until user approves
- If Claude returns nothing new, returns `{ suggestedIngredients: [] }` with a message "No new ingredients found"
- Memory: 256MB, Timeout: 60s

### `searchProducts` (HTTPS Callable)
- Input: `{ groupId, ingredientIds }`
- For each ingredient: check `scrapingCache` first, then scrape all 5 supermarkets via `Promise.allSettled`
- Writes products to `recipeSearches/{groupId}/ingredients/{id}/products/`
- Updates group `status: "done"` (or `"error"`) when all complete
- Memory: 1GB, Timeout: 300s, Max instances: 10

### `deleteRecipeSearch` (HTTPS Callable)
- Input: `{ groupId }`
- Verifies auth + group ownership
- Uses `firestore.recursiveDelete()` to delete group doc + all subcollections atomically
- Returns `{ success: true }`
- Memory: 256MB, Timeout: 60s

### `searchIngredientQuery` (HTTPS Callable)
- Input: `{ groupId, query }`
- Verifies auth + group ownership
- Sanitizes `query` server-side: strip to `[^a-zA-Z0-9\s\-',]`, max 100 chars, min 2 chars after strip, lowercase + collapse whitespace → `normalizedQuery`
- Rate limit: `manualSearch` key in `users/{userId}/rateLimits`, max 30/hr
- Checks `scrapingCache` for each supermarket first (6-hr TTL); scrapes cache misses via `Promise.allSettled`
- Writes fresh results to `scrapingCache`
- Validates all `productUrl` values against supermarket domain allowlist — drops invalid
- Returns `{ results: ManualSearchResult[], normalizedQuery, fromCache }` — **nothing written to Firestore**
- Memory: 1GB, Timeout: 120s, Max instances: 10

### `saveManualIngredient` (HTTPS Callable)
- Input: `{ groupId, ingredientName, quantity, notes, selectedProducts: SelectedManualProduct[] }`
- Verifies auth + group ownership
- Group status guard: throws `failed-precondition` if `status === "awaiting_approval"` (prevents race with initial AI extraction)
- Ingredient cap: throws `resource-exhausted` if group already has ≥50 ingredients
- Zod validates all fields: `ingredientName` max 100 chars, `quantity`/`notes` max 200 chars, `selectedProducts` max 20 items
- **Re-validates every `productUrl`** against supermarket domain allowlist — throws `invalid-argument` if any fail (client payload is untrusted)
- Creates ingredient doc with `searchStatus: "done"` and `source: "manual"` (products are written atomically; no separate search needed)
- Batch-writes selected products to `.../ingredients/{newId}/products/` with `scrapedAt: Timestamp.now()`
- Does NOT change group `status` — manual ingredients are additive amendments
- Returns `{ ingredientId, savedProductCount }`
- Memory: 256MB, Timeout: 30s

---

## Supermarket Scraping Strategy

All scrapers implement a common interface: `search(ingredient: string): Promise<ScrapedProduct[]>`. Each returns empty array on failure (never throws). `Promise.allSettled` in the service means one failure doesn't block the other four.

| Supermarket | Search URL | Scraping Method |
|---|---|---|
| **Tesco IE** | `https://www.tesco.ie/groceries/en-IE/search?query={term}&count=24` | Parse `<script id="__NEXT_DATA__">` JSON → `props.pageProps.results.productItems[]` |
| **SuperValu** | `https://shop.supervalu.ie/results?q={term}` | Parse `window.__REACT_QUERY_DEHYDRATED_STATE__` embedded JSON |
| **Dunnes** | `https://www.dunnesstoresgrocery.com/sm/delivery/rsid/258/results?q={term}` | Same Buymie platform as SuperValu — same dehydrated state pattern |
| **Aldi IE** | No keyword search — category URLs | Keyword→category lookup map in `constants.ts`, parse `__NUXT__` JSON |
| **Lidl IE** | No keyword search — category URLs | Keyword→category lookup map in `constants.ts`, parse ODS HTML with cheerio |

Aldi/Lidl fallback: If `__NUXT__`/ODS parsing returns empty, use `puppeteer-core` + `@sparticuz/chromium` (lightweight, serverless-optimized Chromium). Gated by a feature flag in `constants.ts`.

All requests use realistic browser `User-Agent` and `Accept` headers. Responses cached for 6 hours in `scrapingCache`.

---

## Meal Input Builder (UI)

The meal input is a 3-step structured builder — not a free-text field. This constrains the user to on-topic input and assembles a high-quality, safe prompt.

### Step 1 — Recipe Name
- Single text input: "What would you like to cook?" (placeholder: "e.g. Ramen, Pasta Carbonara, Beef Stew")
- Frontend character rules: alphanumeric + spaces + hyphens only, max 80 chars, min 3 chars
- On blur/submit: frontend shows a "Looks like a meal!" micro-validation (non-blocking, UX only)
- The real gate is server-side (see `validateRecipe.ts`)

### Step 2 — Health & Preference Pills
Pre-defined pill list (stored in `@shopper/shared` `pills.ts`, imported by both frontend and functions). Client sends **pill IDs only** — never raw text — so the server resolves the actual prompt text from the shared whitelist.

Pill categories:

| Category | Pills |
|---|---|
| Dietary | Gluten-free, Dairy-free, Vegan, Vegetarian, Pescatarian, Halal, Kosher |
| Quality | Organic, Non-processed, Whole foods, Free-range, Grass-fed |
| Health | Low-sodium, Low-sugar, High-protein, Low-carb, High-fibre, Low-fat |
| Lifestyle | Budget-friendly, Easy to find, Seasonal, Local produce |

Pills render as toggleable chips. Selected pills display as filled/active chips. Max 8 pills selectable at once.

### Step 3 — Keyword Refinements
- Small tag-style input: user types a word and presses Enter/comma to add it as a keyword chip
- Each keyword: max 50 chars, alphanumeric + spaces only, stripped of special characters
- Max 5 keywords total
- Frontend shows a hint: "Add specific ingredients or styles, e.g. 'chicken broth', 'spicy'"
- Keywords are validated server-side against a food-term allowlist before being included in the prompt

### Assembled Prompt (server-side only)
The function in `extractIngredients.fn.ts` assembles the final Claude prompt from validated parts:
```
You are a culinary ingredient assistant. Extract a shopping list for the following recipe.

Recipe: {validatedRecipeName}
Dietary & health requirements: {resolvedPillDescriptions}
Additional refinements: {sanitizedKeywords}

Return only food ingredients needed to cook this recipe. Respect all dietary requirements listed.
```
The user **never sees or controls** the prompt structure — only its inputs via the UI components.

### Component: `MealBuilder.tsx`
Orchestrates all three steps as a single form. Manages local state for `recipeName`, `activePillIds`, `keywords`. On submit, calls `extractIngredients` callable with `{ recipeName, activePillIds, keywords }`. Shows inline error from the recipe gate ("That doesn't look like a recipe — try something like 'Chicken Curry'"). On success, receives `{ groupId, suggestedIngredients }` and transitions to the `IngredientApprovalPanel` (inline, not a new page).

### Component: `IngredientApprovalPanel.tsx`
Shown immediately after AI returns suggested ingredients — before any Firestore write. Reused for both initial extraction and rescan results.

**Layout:**
- Heading: "Review ingredients for [Recipe Name]"
- "Select all / Deselect all" toggle
- List of ingredient rows, each with:
  - Checkbox (unchecked by default — user must actively select)
  - Ingredient name + quantity (e.g. "Whole milk — 500ml")
  - Notes if any (e.g. "lactose-free preferred") shown as grey subtext
  - Per-supermarket search links (5 small icons/badges) — pre-generated search URLs so the user can verify availability on each site before committing; opens in new tab
- Footer: "Save [N] ingredients" primary button (disabled if 0 selected) + "Cancel" link
- On save: calls `saveIngredients({ groupId, approvedIngredients })` → navigates to `/search/{groupId}`
- On cancel: calls `deleteRecipeSearch({ groupId })` to clean up the group doc, returns to Dashboard

**Rescan variant:**
- Heading: "New ingredients found for [Recipe Name]"
- Shows only the newly suggested ingredients (those not already saved)
- Same checkbox UI and "Save [N] more ingredients" CTA
- "No new ingredients found" empty state if `suggestedIngredients` is empty
- On save: appends approved ingredients to existing group via `saveIngredients`; triggers product search only for the new ones

### Component: `ManualIngredientSearch.tsx`
On the group detail page, shown when `status !== "extracting" && status !== "awaiting_approval"`. Gives users a direct product search fallback independent of the AI flow.

**Layout:**
- Label: "Search for an ingredient manually"
- Text input: placeholder "e.g. whole milk, sourdough bread, olive oil" (max 100 chars, alphanumeric + spaces + hyphens + `'` + `,`)
- "Search" button with magnifying glass icon — disabled while searching; shows spinner + "Searching 5 supermarkets…" during call
- Inline error display for validation failures and rate limit messages
- On result: renders `ManualIngredientSearchPanel` below the input

### Component: `ManualIngredientSearchPanel.tsx`
Shown after `searchIngredientQuery` returns results. Mirrors the `IngredientApprovalPanel` pattern — preview first, write only on approval.

**Layout:**
1. "Results for '[query]'" heading + total product count
2. "Save as ingredient:" name field — pre-filled with `normalizedQuery`, editable (required)
3. Quantity field (optional, placeholder "e.g. 500ml, 2 cans")
4. Notes field (optional, placeholder "e.g. lactose-free preferred")
5. `SupermarketTabs` (reused) — each tab shows `ProductCard` components with a checkbox overlay
   - Default selection: first `available: true` product per supermarket pre-checked
   - Empty/error tabs: existing "Not found at [Supermarket]" empty state, no checkboxes
6. Summary bar: "X products selected from Y supermarkets"
7. "Save ingredient" (primary, disabled if 0 products selected or name empty) + "Cancel" link
- On save: calls `saveManualIngredient` → success toast → panel collapses, input resets → `onSnapshot` picks up new ingredient automatically
- On cancel: resets panel state to idle

**`ProductCard.tsx` extension:**
Add optional props for selection modes (existing usages unaffected when props are absent):

- `selectable?: boolean` — renders a checkbox in the top-left corner (multi-select mode, used in ManualIngredientSearchPanel)
- `selected?: boolean` — controlled selected state
- `onToggle?: (selected: boolean) => void` — callback
- `choosable?: boolean` — renders a "Choose" / "Chosen" toggle button (single-select mode, used in SupermarketTabs on the detail page)
- `chosen?: boolean` — whether this product is the chosen one for its supermarket
- `onChoose?: () => void` — callback when user picks this product

### Product Selection (Choosing Preferred Products)

On the ingredient detail view (SupermarketTabs on `/search/{groupId}`), users can choose one product per supermarket as their preferred/approved pick. This helps narrow down the best option from multiple search results.

**Behaviour:**

- Each `ProductCard` in the SupermarketTabs shows a "Choose" button (subtle, e.g. outline style)
- Clicking "Choose" selects that product as the chosen one for that supermarket tab — the button changes to "Chosen" (filled/active style) and the card gets a subtle highlight border
- Only one product can be chosen per supermarket — selecting a different one in the same tab replaces the previous choice
- Clicking "Chosen" on an already-chosen product deselects it (toggle off)
- Selection is optional — users don't have to choose anything

**Data model:**

- Stored as `selectedProducts` on the ingredient doc: `Record<Supermarket, productId>` (e.g. `{ tesco: "prod123", supervalu: "prod456" }`)
- Written directly to Firestore from the client (no callable needed — this is the user's own `users/{userId}/**` data, covered by existing security rules)
- `onSnapshot` on the ingredient doc keeps the UI in sync across tabs/devices

**Visual indicators:**

- Chosen products show a checkmark badge and highlighted border in their SupermarketTab
- In the ingredient list summary, chosen products can show as small supermarket icons with prices (e.g. "Tesco €1.49 · SuperValu €1.65") for a quick at-a-glance comparison
- Ingredients with no chosen products show no price summary

### Shopping List (Cross-Recipe Aggregation)

On the Dashboard, users can multi-select recipes and generate a consolidated shopping list filtered by supermarket. This lets them see all chosen products from multiple recipes in one place, ready to shop.

**Entry point:**

- Dashboard header shows a "Shopping list" button (next to "New recipe") when recipes exist
- Clicking it enters **select mode** — recipe cards show checkboxes, navigation is disabled
- A banner shows selection count and a "View list" button (with a badge showing total chosen product count)

**`RecipeSearchCard.tsx` in select mode:**

- `selectable?: boolean` — shows a checkbox on the left, hides delete button and chevron
- `selected?: boolean` — highlights card with forest border
- `onToggleSelect?: (id: string) => void` — click toggles selection instead of navigating
- Existing props/behaviour unchanged when `selectable` is absent

**`ShoppingList.tsx` component:**

- Header: shopping cart icon, recipe count, close button
- Supermarket tabs (same visual style as `SupermarketTabs`) — each tab shows a badge with the count of chosen products at that supermarket
- Item list per supermarket: aggregates all `selectedProducts[supermarket]` across all selected recipes' ingredients
  - Each row shows: ingredient name, quantity, product name (truncated), price, unit price, "from [RecipeName]" label, external link to product page
  - Items are grouped visually but not deduplicated (same ingredient from different recipes shows separately)
- Footer: total item count + total price (sum of all product prices for the active supermarket)
- Empty state per tab: "No chosen products at [Supermarket]" with hint to choose products in recipe detail pages first

**Data flow:**

- No new Firestore writes — reads existing `selectedProducts` from ingredient docs
- All aggregation happens client-side from the in-memory recipe search state
- Select mode state (`selectMode`, `selectedIds`, `showShoppingList`) lives in Dashboard component

### Rescan Entry Point
On the group detail page (`/search/{groupId}`), a "Rescan for more ingredients" button is shown when `status === "done"`. Clicking it:
1. Calls `rescanIngredients({ groupId })`
2. Shows a loading state ("Looking for more ingredients…")
3. Opens `IngredientApprovalPanel` in rescan mode with the returned suggestions
4. User approves → new ingredients saved + product search triggered for those only

### Group-Based Workflow
Each submission is independent — no "edit and re-search". The flow is:
1. User fills `MealBuilder` and submits → new group created → navigates to group detail page
2. On the group detail page, user can tweak pills/keywords in a **"Search again"** panel, which pre-fills `MealBuilder` with the current group's values but submits as a brand-new group
3. All groups are listed on the Dashboard — user can see the history of all searches, compare results across groups for the same recipe, and delete any group they no longer need

### `RecipeSearchCard.tsx` (Dashboard list item)
Displays a saved group summary:

- Recipe name (large)
- Active pills as small chips
- Keywords as smaller grey chips
- Status badge (searching / done / error)
- Ingredient count and supermarket result count
- Created date (relative: "2 hours ago")
- Delete button → confirmation popover → calls `deleteRecipeSearch` callable → optimistically removes card from list
- Supports select mode via `selectable`, `selected`, `onToggleSelect` props (see Shopping List section)

### Delete Behaviour
- Confirmation popover ("Delete this search? This cannot be undone.")
- Optimistic UI: card fades out immediately, restored with error toast if the callable fails
- `deleteRecipeSearch` function uses `firestore.recursiveDelete()` server-side — the only safe way to delete nested subcollections

---

## Design System ("Market Fresh")

All visual tokens and reusable component classes are centralized — components should use these rather than repeating raw Tailwind strings.

### CSS Layer: `index.css`

**`@theme` block** — design tokens consumed by Tailwind:
- **Core palette**: cream/parchment (backgrounds), forest/sage (primary), terracotta (danger/error), bark/ink (text)
- **Supermarket brand colors**: tesco, supervalu, dunnes, aldi, lidl + light variants
- **Typography**: `--font-display` (DM Serif Display) for headings, `--font-body` (DM Sans) for body
- **Semantic radii**: `--radius-sm` (8px) → `--radius-full` (pills)
- **Shadows**: card, card-hover, elevated, glow
- **Animations**: fade-in, fade-up, slide-in, scale-in, shimmer, float, pulse-soft

**`@layer components`** — reusable utility classes:
| Class | Purpose |
|---|---|
| `btn-primary` | Forest green button with hover lift, disabled state |
| `btn-secondary` | White bordered button with subtle hover |
| `btn-ghost` | Text-only cancel/back links |
| `btn-danger-ghost` | Terracotta hover for delete actions |
| `card` | White panel with border + shadow + rounded-2xl |
| `card-interactive` | Clickable card with hover effects |
| `card-section` | Inner section with bottom border (header areas) |
| `card-footer` | Cream-tinted footer with top border |
| `input` | Standard text input with focus ring |
| `input-sm` | Compact input for secondary fields |
| `label-section` | Tiny uppercase ghost-colored section labels |
| `label-field` | Standard field labels |
| `pill` / `pill-active` / `pill-muted` | Rounded-full chip badges |
| `badge` | Status badge (bolder than pill) |
| `checkbox-unchecked` / `checkbox-checked` | Custom checkbox styling |
| `sm-tab` / `sm-tab-inactive` | Supermarket tab buttons |
| `sm-tab-badge` | Count badge inside tabs |
| `collapsible-trigger` | Expandable section trigger |
| `error-text` / `error-banner` | Error message styling |
| `empty-state` / `empty-state-icon` / `empty-state-text` | Empty state layouts |

### JS Token File: `styles/design-tokens.ts`

Programmatic mirror of CSS tokens for use in component logic:
- **`SUPERMARKET_META`** — single source of truth for supermarket display config (label, shortLabel, Tailwind color classes, tab active classes, search badge classes)
- **`SUPERMARKET_LIST`** — ordered array for consistent iteration
- **`STATUS_STYLES`** — group status badge labels + classes
- **`SEARCH_STATUS_STYLES`** — ingredient search status dot + text classes

Components import from `design-tokens.ts` instead of defining local supermarket/status maps.

---

## Frontend Key Behaviours
- **Real-time updates**: Firestore `onSnapshot` listeners on meals/ingredients/products — status changes (extracting → done) update UI without polling
- **Loading states**: Skeleton cards while `status === "extracting"` or `"searching"`
- **Product links**: `target="_blank" rel="noopener noreferrer"` to supermarket product pages
- **Empty states**: "Not found at [Supermarket]" shown per tab when results are empty
- **Routing**: Protected `/dashboard` (requires auth), public `/` landing page, `/meal/:id` detail page

---

## Key Dependencies

**Frontend**: `react`, `react-router-dom` v6, `firebase` v10+, `@tanstack/react-query`, `tailwindcss`, `@headlessui/react`, `lucide-react`, `zod`

**Functions**: `firebase-functions` (v2 API), `firebase-admin`, `@anthropic-ai/sdk`, `axios`, `cheerio`, `zod`, `@sparticuz/chromium`, `puppeteer-core`

---

## Implementation Order

1. **Foundation**: `firebase init` (Hosting, Functions, Firestore, Emulators), create Vite frontend, configure `firebase.json`, set up npm workspaces with `shared/` package (`@shopper/shared` — shared types, callable contracts, pill definitions)
2. **Auth + Shell**: Firebase client init, `AuthContext`, `GoogleSignInButton`, protected routing, `Header`
3. **AI integration**: Claude API in Functions, `extractIngredients` callable, `MealInput` + `IngredientList` UI with `onSnapshot`
4. **Scrapers**: `base.scraper.ts` interface, all 5 scrapers, `scraping.service.ts`, `searchProducts` callable
5. **Product UI**: `SupermarketTabs`, `ProductCard` (with checkbox mode), `ProductGrid`, `MealDetail` page
5a. **Manual search**: `searchIngredientQuery` + `saveManualIngredient` callables, `ManualIngredientSearch` + `ManualIngredientSearchPanel` components, integrate into `MealDetail`
6. **Polish**: Scraping cache, error states, Firestore security rules, loading skeletons
7. **Deploy**: `firebase deploy --only hosting,functions,firestore:rules`, set `ANTHROPIC_API_KEY` secret

---

## Security

### Firestore Security Rules (Critical)
- Default **deny all** — no rule = no access
- `users/{userId}/**` — read/write only if `request.auth.uid == userId`
- `scrapingCache/**` — read by any authenticated user, **no client writes** (Admin SDK bypasses rules)
- Rules must be deployed and tested before any data is written
- File: `firestore.rules`

### API Key Protection
- `ANTHROPIC_API_KEY` stored exclusively in Firebase Secrets (`firebase functions:secrets:set ANTHROPIC_API_KEY`)
- Never in `.env` files, frontend code, or committed to git
- `.gitignore` must exclude all `.env*` files from day one
- Firebase client config keys (apiKey, projectId, etc.) are safe to expose — they are restricted by Auth + Firestore rules, not kept secret

### Callable Function Auth Enforcement
- Every Cloud Function checks `context.auth` at the very start and throws `functions.https.HttpsError("unauthenticated", ...)` if absent
- Firebase does not enforce this automatically — it must be explicit in each function

### Firebase App Check
- Prevents bots/unauthorized clients from calling Functions and burning Claude API quota
- Enable reCAPTCHA Enterprise for web via Firebase Console
- Enforce in all callable functions before production deployment

### Prompt Injection Protection
- User never controls prompt structure — only 3 bounded inputs: recipe name, pill IDs, keywords
- **Recipe name**: alphanumeric + spaces + hyphens, max 80 chars; then validated by Claude recipe gate before anything else runs
- **Pills**: client sends IDs only; server resolves descriptions from its own whitelist in `constants.ts` — no user text enters the prompt from pills
- **Keywords**: stripped to alphanumeric + spaces, max 50 chars each, max 5 total, checked against food-term allowlist server-side
- **Prompt assembly**: done entirely server-side in `extractIngredients.fn.ts` — the template is hardcoded, user input only fills bounded slots
- Claude response validated against Zod schema before any Firestore write; failed validation returns an error, never partial data

### Scraped URL Validation
- Every `productUrl` from scrapers is validated server-side: hostname must match the expected supermarket domain
  - Tesco: `*.tesco.ie`, SuperValu: `*.supervalu.ie`, Dunnes: `*.dunnesstoresgrocery.com`, Aldi: `*.aldi.ie`, Lidl: `*.lidl.ie`
- Invalid URLs are dropped — never stored or rendered
- All external links rendered with `rel="noopener noreferrer"`

### Per-User Rate Limiting
- Track call counts + timestamps in Firestore under `users/{userId}/rateLimits`
- `extractIngredients`: max 30 calls/hour per user
- `searchProducts`: max 20 calls/hour per user
- `searchIngredientQuery` (`manualSearch` key): max 30 calls/hour per user
- Enforced at the start of each callable function before any external API call

### Manual Ingredient Search Security
- **Query sanitization**: `searchIngredientQuery` strips all characters outside `[a-zA-Z0-9\s\-',]`, enforces max 100 chars and min 2 chars post-strip, lowercases + collapses whitespace — scrapers only receive the normalized result
- **Product URL re-validation**: `saveManualIngredient` re-validates every `productUrl` in `selectedProducts` against the supermarket domain allowlist even though they originated from our own callable — the client payload is untrusted
- **Ingredient cap**: `saveManualIngredient` rejects writes if group already has ≥50 ingredients
- **Product array cap**: `selectedProducts` max 20 items per call
- **Group status guard**: `saveManualIngredient` throws `failed-precondition` if `status === "awaiting_approval"` to prevent race conditions with initial AI extraction

### Firebase Hosting Security Headers
Add to `firebase.json` `hosting.headers`:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com; script-src 'self' 'unsafe-inline' https://www.gstatic.com; img-src 'self' data: https:
```

### Dependency Security
- Run `npm audit` before each deployment
- Pin all dependency versions (no `^` or `~` ranges in Functions `package.json`)
- `cheerio` and `puppeteer-core` parse untrusted external HTML — keep at latest patched versions

### Scraping Legal Risk
- Tesco, SuperValu, Dunnes, Aldi, Lidl ToS likely prohibit automated scraping
- Mitigations: 6-hour cache minimises request volume; respect `robots.txt`; add `User-Agent` identifying the app; avoid aggressive crawling

---

## Verification
- Firebase Emulator Suite for local testing of Auth, Firestore, and Functions
- Test `extractIngredients` with a sample meal ("Chicken Tikka Masala, gluten-free, serves 2")
- Test each scraper individually with a common ingredient ("milk") and verify product URLs open correctly
- Confirm real-time Firestore updates render in UI as status progresses
- End-to-end: sign in with Google → add meal → see ingredients → see products with working links → refresh page → data persists
- Manual search end-to-end: open a recipe group → type "whole milk" in the manual search → see products from all 5 supermarkets → select products → save → ingredient appears in list with `source: "manual"` badge → products display in `SupermarketTabs` correctly
- `searchIngredientQuery` with a tampered/XSS query (e.g. `"><script>`) → confirm it is sanitized before reaching scrapers
- `saveManualIngredient` with a tampered `productUrl` → confirm `invalid-argument` is thrown
- `saveManualIngredient` while group `status === "awaiting_approval"` → confirm `failed-precondition` error
- Existing `ProductCard` usages render without a checkbox when `selectable` prop is absent
- Product selection: open a recipe → choose products per supermarket → ingredient sidebar shows chosen prices per supermarket → chosen state persists across tab switches
- Shopping list: dashboard → click "Shopping list" → select 2+ recipes → "View list" → switch supermarket tabs → verify aggregated items, prices, and total are correct → external links work → close/cancel returns to normal mode
