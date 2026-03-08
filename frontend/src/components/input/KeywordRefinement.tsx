import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  keywords: string[]
  onChange: (keywords: string[]) => void
}

const MAX_KEYWORDS = 5
const MAX_KEYWORD_LENGTH = 50

function sanitize(val: string) {
  return val.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, MAX_KEYWORD_LENGTH).trim()
}

export default function KeywordRefinement({ keywords, onChange }: Props) {
  const [input, setInput] = useState('')

  const addKeyword = () => {
    const clean = sanitize(input)
    if (!clean || keywords.includes(clean) || keywords.length >= MAX_KEYWORDS) return
    onChange([...keywords, clean])
    setInput('')
  }

  const removeKeyword = (kw: string) => onChange(keywords.filter(k => k !== kw))

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addKeyword()
    }
    if (e.key === 'Backspace' && input === '' && keywords.length > 0) {
      removeKeyword(keywords[keywords.length - 1])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 p-3 border border-parchment rounded-xl bg-cream/50 min-h-[48px] focus-within:border-forest-muted focus-within:ring-2 focus-within:ring-forest-muted/10 focus-within:bg-white transition-all duration-200">
        {keywords.map(kw => (
          <span
            key={kw}
            className="flex items-center gap-1 px-2.5 py-1 bg-parchment text-ink-muted text-sm rounded-lg font-medium animate-scale-in"
          >
            {kw}
            <button
              type="button"
              onClick={() => removeKeyword(kw)}
              className="text-ink-ghost hover:text-terracotta transition-colors duration-150"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {keywords.length < MAX_KEYWORDS && (
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addKeyword}
            placeholder={keywords.length === 0 ? 'e.g. chicken broth, spicy...' : ''}
            className="flex-1 min-w-[140px] outline-none text-sm bg-transparent text-ink placeholder:text-ink-ghost"
          />
        )}
      </div>
      <p className="mt-2 text-xs text-ink-ghost">
        Press Enter or comma to add &middot; {keywords.length}/{MAX_KEYWORDS}
      </p>
    </div>
  )
}
