import { Suspense } from 'react'
import { getPosts, getAllTags } from '@/lib/posts'
import { PostCard } from '@/components/posts/PostCard'
import { SearchBar } from '@/components/posts/SearchBar'
import { Pagination } from '@/components/posts/Pagination'
import { TagFilter } from '@/components/posts/TagFilter'
import { PostCardSkeleton } from '@/components/ui/Skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest articles from Hivon — AI-summarised for your convenience.',
}

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; tag?: string }>
}

export default async function PostsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const search = params.q ?? ''
  const tag = params.tag ?? ''

  const [{ data: posts, totalPages, count }, tags] = await Promise.all([
    getPosts({ page, search, tag }),
    getAllTags(),
  ])

  const hasFilters = Boolean(search || tag)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground text-sm">
          {count} article{count !== 1 ? 's' : ''}
          {search ? ` matching "${search}"` : ''}
          {tag ? ` tagged "${tag}"` : ''}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {tags.length > 0 && (
        <div className="mb-8">
          <Suspense>
            <TagFilter tags={tags} />
          </Suspense>
        </div>
      )}

      {posts.length === 0 ? (
        <EmptyState hasFilters={hasFilters} search={search} tag={tag} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                featured={index === 0 && page === 1 && !hasFilters}
              />
            ))}
          </div>

          <Suspense>
            <Pagination currentPage={page} totalPages={totalPages} />
          </Suspense>
        </>
      )}
    </div>
  )
}

function EmptyState({
  hasFilters,
  search,
  tag,
}: {
  hasFilters: boolean
  search: string
  tag: string
}) {
  return (
    <div className="text-center py-24 border border-dashed border-border rounded-2xl">
      <p className="text-4xl mb-4">🔍</p>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        {hasFilters ? 'No posts found' : 'No posts yet'}
      </h2>
      <p className="text-sm text-muted-foreground">
        {search && `Nothing matched "${search}". `}
        {tag && `No posts tagged "${tag}". `}
        {!hasFilters && 'Check back soon — great content is coming.'}
        {hasFilters && 'Try a different search or clear the filters.'}
      </p>
    </div>
  )
}
