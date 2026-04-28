// src/components/posts/Pagination.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams()

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    return `/posts?${params.toString()}`
  }

  if (totalPages <= 1) return null

  // Build page window
  const pages: (number | '…')[] = []
  const delta = 1 // pages on each side of current

  const left = Math.max(2, currentPage - delta)
  const right = Math.min(totalPages - 1, currentPage + delta)

  pages.push(1)
  if (left > 2) pages.push('…')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push('…')
  if (totalPages > 1) pages.push(totalPages)

  const btnBase =
    'inline-flex items-center justify-center h-9 min-w-[36px] px-2 rounded-lg text-sm font-medium transition-all'

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-12"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(currentPage - 1)}
          className={cn(btnBase, 'border border-border hover:bg-muted text-foreground gap-1')}
        >
          <ChevronLeft size={15} />
          Prev
        </Link>
      ) : (
        <span className={cn(btnBase, 'border border-border text-muted-foreground opacity-40 cursor-not-allowed gap-1')}>
          <ChevronLeft size={15} />
          Prev
        </span>
      )}

      {/* Pages */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className={cn(btnBase, 'text-muted-foreground')}>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={cn(
              btnBase,
              p === currentPage
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border hover:bg-muted text-foreground'
            )}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(currentPage + 1)}
          className={cn(btnBase, 'border border-border hover:bg-muted text-foreground gap-1')}
        >
          Next
          <ChevronRight size={15} />
        </Link>
      ) : (
        <span className={cn(btnBase, 'border border-border text-muted-foreground opacity-40 cursor-not-allowed gap-1')}>
          Next
          <ChevronRight size={15} />
        </span>
      )}
    </nav>
  )
}
