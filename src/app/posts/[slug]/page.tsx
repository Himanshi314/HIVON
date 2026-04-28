// src/app/posts/[slug]/page.tsx
// Individual post page with full content, AI summary, and comments

import { notFound } from 'next/navigation'
import { getPostBySlug, getAllTags, getComments } from '@/lib/posts'
import { CommentsSection } from '@/components/posts/CommentsSection'
import { Badge } from '@/components/ui/Badge'
import { RoleBadge } from '@/components/ui/Badge'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Clock,
  Calendar,
  Sparkles,
  Pencil,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Dynamic SEO metadata per post
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post not found' }

  return {
    title: post.title,
    description: post.summary ?? `Read "${post.title}" on Hivon Blog`,
    openGraph: {
      title: post.title,
      description: post.summary ?? undefined,
      images: post.image_url ? [{ url: post.image_url }] : undefined,
      type: 'article',
      publishedTime: post.created_at,
    },
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params

  // Fetch post + comments in parallel
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [comments, supabase] = await Promise.all([
    getComments(post.id),
    createClient(),
  ])

  // Get current user to show Edit button
  const { data: { user } } = await supabase.auth.getUser()
  let currentProfile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    currentProfile = data
  }

  const canEdit =
    user &&
    (user.id === post.author_id || currentProfile?.role === 'admin')

  const authorName = post.author?.name ?? 'Anonymous'
  const authorInitial = authorName.charAt(0).toUpperCase()

  return (
    <article className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-0">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          All posts
        </Link>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/posts?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline" className="rounded-full hover:border-primary transition-colors cursor-pointer">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-border">
          {/* Author */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {authorInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{authorName}</span>
                {post.author?.role && <RoleBadge role={post.author.role} />}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formatDate(post.created_at)}
                </span>
                {post.reading_time && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.reading_time} min read
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit button */}
          {canEdit && (
            <Link
              href={`/edit/${post.id}`}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <Pencil size={12} />
              Edit post
            </Link>
          )}
        </div>
      </div>

      {/* Hero image */}
      {post.image_url && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
          <div className="relative aspect-[16/7] rounded-2xl overflow-hidden shadow-md">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width:768px) 100vw, 896px"
            />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {/* AI Summary box */}
        {post.summary && (
          <div className="mb-10 p-5 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles size={14} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">AI-Generated Summary</span>
              <span className="text-xs text-muted-foreground ml-auto">Powered by Google Gemini</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{post.summary}</p>
          </div>
        )}

        {/* Post body — rendered HTML from Tiptap */}
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Comments */}
        <CommentsSection postId={post.id} initialComments={comments} />
      </div>
    </article>
  )
}
