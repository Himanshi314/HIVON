// src/components/posts/SearchBar.tsx
'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isPending, startTransition] = useTransition()

  const push = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value.trim()) {
        params.set('q', value.trim())
        params.set('page', '1')
      } else {
        params.delete('q')
        params.delete('page')
      }
      startTransition(() => router.push(`/posts?${params.toString()}`))
    },
    [router, searchParams]
  )

  return (
    <div className="relative w-full max-w-sm">
      {/* Leading icon */}
      {isPending ? (
        <Loader2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
      ) : (
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      )}

      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          push(e.target.value)
        }}
        placeholder="Search posts…"
        className={cn(
          'w-full h-10 pl-9 pr-9 rounded-lg border border-border text-sm',
          'bg-background text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-all'
        )}
      />

      {/* Clear button */}
      {query && (
        <button
          onClick={() => { setQuery(''); push('') }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
