// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />
}

export function PostCardSkeleton({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <div className="col-span-full grid md:grid-cols-2 rounded-2xl border border-border overflow-hidden bg-card">
        <Skeleton className="aspect-[16/10] md:min-h-[320px] rounded-none" />
        <div className="p-7 lg:p-9 flex flex-col gap-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-3/4" />
          <div className="p-3 bg-muted/40 rounded-lg space-y-2 mt-1">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[16/9] rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-18 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <div className="space-y-1.5 mt-1">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export function PostDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Skeleton className="h-4 w-28 mb-8" />
      <div className="flex gap-2 mb-5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full mb-3" />
      <Skeleton className="h-10 w-2/3 mb-6" />
      <div className="flex items-center gap-3 mb-8">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="aspect-[16/7] w-full rounded-2xl mb-10" />
      {[100, 90, 95, 85, 100, 70, 88].map((w, i) => (
        <Skeleton key={i} className="h-4 mb-3" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}
