'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Clock, Sparkles } from 'lucide-react'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
  featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
  const authorName = post.author?.name ?? 'Anonymous'
  const initial = authorName.charAt(0).toUpperCase()

  if (featured) {
    return (
      <Link
        href={`/posts/${post.slug}`}
        className="group col-span-full grid md:grid-cols-2 rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300"
      >
        <div className="relative aspect-[16/10] md:aspect-auto min-h-[280px] overflow-hidden bg-muted">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          ) : (
            <PlaceholderImage title={post.title} />
          )}
          <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow">
            ✦ Featured
          </span>
        </div>

        <div className="flex flex-col justify-between p-7 lg:p-10">
          <div>
            <TagList tags={post.tags} limit={3} />
            <h2 className="font-serif text-2xl lg:text-3xl text-foreground leading-snug mt-3 mb-4 group-hover:text-primary transition-colors duration-200 line-clamp-3">
              {post.title}
            </h2>
            {post.summary && (
              <AISummaryBox summary={post.summary} lines={4} />
            )}
          </div>
          <PostMeta authorName={authorName} initial={initial} post={post} />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted flex-shrink-0">
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />
        ) : (
          <PlaceholderImage title={post.title} />
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <TagList tags={post.tags} limit={2} small />
        <h2 className="font-serif text-[1.1rem] leading-snug text-foreground mt-2 mb-3 group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {post.title}
        </h2>
        {post.summary ? (
          <AISummaryBox summary={post.summary} lines={3} compact />
        ) : (
          <div className="flex-1" />
        )}
        <PostMeta authorName={authorName} initial={initial} post={post} compact />
      </div>
    </Link>
  )
}


function PlaceholderImage({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <span className="font-serif text-7xl text-primary/15 select-none">
        {title.charAt(0)}
      </span>
    </div>
  )
}

function TagList({
  tags,
  limit,
  small,
}: {
  tags?: string[]
  limit: number
  small?: boolean
}) {
  if (!tags?.length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.slice(0, limit).map((tag) => (
        <Badge
          key={tag}
          variant="outline"
          className={cn('rounded-full', small ? 'text-[10px] px-2 py-0' : 'text-xs')}
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}

function AISummaryBox({
  summary,
  lines,
  compact,
}: {
  summary: string
  lines: number
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-primary/15 bg-primary/5',
        compact ? 'p-2.5 mb-3 flex-1' : 'p-3.5 mb-4'
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Sparkles size={compact ? 10 : 12} className="text-primary" />
        <span
          className={cn(
            'font-semibold text-primary uppercase tracking-wider',
            compact ? 'text-[9px]' : 'text-[10px]'
          )}
        >
          AI Summary
        </span>
      </div>
      <p
        className={cn(
          'text-muted-foreground leading-relaxed',
          compact ? 'text-xs' : 'text-sm',
          lines === 3 && 'line-clamp-3',
          lines === 4 && 'line-clamp-4'
        )}
      >
        {summary}
      </p>
    </div>
  )
}

function PostMeta({
  authorName,
  initial,
  post,
  compact,
}: {
  authorName: string
  initial: string
  post: Post
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-t border-border',
        compact ? 'pt-3 mt-auto' : 'pt-4 mt-5'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold',
            compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
          )}
        >
          {initial}
        </div>
        <div>
          <p className={cn('font-medium text-foreground leading-none', compact ? 'text-xs' : 'text-sm')}>
            {authorName}
          </p>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(post.created_at)}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2.5 text-muted-foreground">
        {post.reading_time && (
          <span className={cn('flex items-center gap-1', compact ? 'text-[11px]' : 'text-xs')}>
            <Clock size={compact ? 11 : 12} />
            {post.reading_time}m
          </span>
        )}
        {compact && (
          <span className="text-[11px]">{formatDate(post.created_at)}</span>
        )}
      </div>
    </div>
  )
}
