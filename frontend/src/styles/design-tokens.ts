/**
 * Design tokens — programmatic mirror of the CSS @theme in index.css.
 * Use these when you need token values in JS/TS (e.g. dynamic styles,
 * supermarket color maps, chart colors). For static styling, prefer
 * Tailwind classes or the component classes defined in index.css.
 */

/* ── Supermarket config ── */

export const SUPERMARKETS = ['tesco', 'supervalu', 'dunnes', 'aldi', 'lidl'] as const
export type Supermarket = (typeof SUPERMARKETS)[number]

export interface SupermarketMeta {
  id: Supermarket
  label: string
  shortLabel: string
  color: string        // Tailwind class: text-{color}
  bgColor: string      // Tailwind class: bg-{color}
  lightBg: string      // Tailwind class: bg-{color}-light
  activeTab: string    // Tailwind classes for active supermarket tab
  searchBadge: string  // Tailwind classes for search link badges
}

export const SUPERMARKET_META: Record<Supermarket, SupermarketMeta> = {
  tesco: {
    id: 'tesco',
    label: 'Tesco',
    shortLabel: 'T',
    color: 'text-tesco',
    bgColor: 'bg-tesco',
    lightBg: 'bg-tesco-light',
    activeTab: 'border-tesco bg-tesco-light text-tesco',
    searchBadge: 'bg-tesco-light text-tesco hover:bg-tesco/10',
  },
  supervalu: {
    id: 'supervalu',
    label: 'SuperValu',
    shortLabel: 'SV',
    color: 'text-supervalu',
    bgColor: 'bg-supervalu',
    lightBg: 'bg-supervalu-light',
    activeTab: 'border-supervalu bg-supervalu-light text-supervalu',
    searchBadge: 'bg-supervalu-light text-supervalu hover:bg-supervalu/10',
  },
  dunnes: {
    id: 'dunnes',
    label: 'Dunnes',
    shortLabel: 'D',
    color: 'text-dunnes',
    bgColor: 'bg-dunnes',
    lightBg: 'bg-dunnes-light',
    activeTab: 'border-dunnes bg-dunnes-light text-dunnes',
    searchBadge: 'bg-dunnes-light text-dunnes hover:bg-dunnes/10',
  },
  aldi: {
    id: 'aldi',
    label: 'Aldi',
    shortLabel: 'A',
    color: 'text-aldi',
    bgColor: 'bg-aldi',
    lightBg: 'bg-aldi-light',
    activeTab: 'border-aldi bg-aldi-light text-aldi',
    searchBadge: 'bg-aldi-light text-aldi hover:bg-aldi/10',
  },
  lidl: {
    id: 'lidl',
    label: 'Lidl',
    shortLabel: 'L',
    color: 'text-lidl',
    bgColor: 'bg-lidl',
    lightBg: 'bg-lidl-light',
    activeTab: 'border-lidl bg-lidl-light text-lidl',
    searchBadge: 'bg-lidl-light text-lidl hover:bg-lidl/10',
  },
}

/* Ordered array for iteration (same order everywhere) */
export const SUPERMARKET_LIST = SUPERMARKETS.map(id => SUPERMARKET_META[id])

/* ── Status config ── */

export type GroupStatus = 'extracting' | 'awaiting_approval' | 'searching' | 'done' | 'error'

export const STATUS_STYLES: Record<GroupStatus, { label: string; className: string }> = {
  extracting:       { label: 'Extracting...',  className: 'bg-aldi-light text-aldi' },
  awaiting_approval:{ label: 'Review needed',  className: 'bg-lidl-light text-lidl' },
  searching:        { label: 'Searching...',   className: 'bg-aldi-light text-aldi' },
  done:             { label: 'Done',           className: 'bg-sage-faint text-forest-muted' },
  error:            { label: 'Error',          className: 'bg-terracotta-faint text-terracotta' },
}

export type SearchStatus = 'pending' | 'searching' | 'done' | 'error'

export const SEARCH_STATUS_STYLES: Record<SearchStatus, { dot: string; text: string }> = {
  pending:   { dot: 'bg-ink-ghost',                    text: 'text-ink-ghost' },
  searching: { dot: 'bg-aldi animate-pulse-soft',      text: 'text-aldi' },
  done:      { dot: 'bg-forest-muted',                 text: 'text-forest-muted' },
  error:     { dot: 'bg-terracotta',                    text: 'text-terracotta' },
}
