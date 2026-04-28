// src/app/posts/loading.tsx
// Next.js streaming loading UI — shown while the page fetches data

import { PostCardSkeleton } from '@/components/ui/Skeleton'
import { Skeleton } from '@/components/ui/Skeleton'

export default function PostsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <Skeleton className="h-10 w-24 mb-2" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Search + tags */}
      <Skeleton className="h-10 w-full max-w-sm mb-8 rounded-lg" />
      <div className="flex gap-2 mb-8">
        {[80, 70, 90, 65].map((w, i) => (
          <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />
        ))}
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <PostCardSkeleton featured />
        {[1, 2, 3, 4, 5].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
