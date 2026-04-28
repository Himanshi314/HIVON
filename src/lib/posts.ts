// src/lib/posts.ts
// All post DB queries — single source of truth. No raw Supabase in components.

import { createClient } from '@/lib/supabase/server'
import type { Post, Comment, PaginatedResult } from '@/types'

const PAGE_SIZE = 6

// ─── Paginated post listing ───────────────────────────────
export async function getPosts({
  page = 1,
  search = '',
  tag = '',
}: {
  page?: number
  search?: string
  tag?: string
} = {}): Promise<PaginatedResult<Post>> {
  const supabase = await createClient()
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('posts')
    .select(
      `id, title, slug, image_url, summary, tags, reading_time,
       published, created_at, updated_at, author_id,
       author:profiles!posts_author_id_fkey(id, name, avatar_url, role)`,
      { count: 'exact' }
    )
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search.trim()) {
    query = query.textSearch('fts', search.trim(), {
      type: 'websearch',
      config: 'english',
    })
  }

  if (tag) query = query.contains('tags', [tag])

  const { data, error, count } = await query

  if (error) {
    console.error('[getPosts]', error.message)
    return { data: [], count: 0, page, pageSize: PAGE_SIZE, totalPages: 0 }
  }

  return {
    data: (data as Post[]) ?? [],
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  }
}

// ─── Single post by slug ──────────────────────────────────
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`*, author:profiles!posts_author_id_fkey(id, name, avatar_url, role)`)
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (error || !data) return null
  return data as Post
}

// ─── Single post by ID (edit page) ───────────────────────
export async function getPostById(id: string): Promise<Post | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`*, author:profiles!posts_author_id_fkey(id, name, avatar_url, role)`)
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Post
}

// ─── Author's own posts ───────────────────────────────────
export async function getPostsByAuthor(authorId: string): Promise<Post[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`*, author:profiles!posts_author_id_fkey(id, name, avatar_url, role)`)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as Post[]) ?? []
}

// ─── All unique tags ──────────────────────────────────────
export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('tags')
    .eq('published', true)

  if (!data) return []
  const tagSet = new Set<string>()
  data.forEach((row: { tags: string[] | null }) =>
    row.tags?.forEach((t) => tagSet.add(t))
  )
  return Array.from(tagSet).sort()
}

// ─── Comments for a post ─────────────────────────────────
export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select(
      `id, post_id, user_id, comment_text, created_at,
       author:profiles!comments_user_id_fkey(id, name, avatar_url, role)`
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) return []
  return (data as Comment[]) ?? []
}
