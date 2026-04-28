// src/components/posts/TagFilter.tsx
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface TagFilterProps {
  tags: string[]
}

export function TagFilter({ tags }: TagFilterProps) {
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''

  function buildHref(tag: string) {
    const params = new URLSearchParams(searchParams)
    if (tag) {
      params.set('tag', tag)
      params.set('page', '1')
    } else {
      params.delete('tag')
      params.delete('page')
    }
    return `/posts?${params.toString()}`
  }

  if (!tags.length) return null

  const pillBase =
    'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all border'

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref('')}
        className={cn(
          pillBase,
          !activeTag
            ? 'bg-primary text-primary-foreground border-primary'
            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
        )}
      >
        All posts
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={buildHref(tag)}
          className={cn(
            pillBase,
            activeTag === tag
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
          )}
        >
          {tag}
        </Link>
      ))}
    </div>
  )
}
