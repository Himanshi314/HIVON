// src/components/admin/AdminPostsTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import { Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface Post {
  id: string
  title: string
  slug: string
  published: boolean
  created_at: string
  author_id: string
  author?: { name: string } | null
}

export function AdminPostsTable({ posts: initial, currentUserId }: { posts: Post[]; currentUserId: string }) {
  const [posts, setPosts] = useState(initial)
  const supabase = createClient()

  async function togglePublish(post: Post) {
    const { error } = await supabase
      .from('posts')
      .update({ published: !post.published })
      .eq('id', post.id)

    if (error) { toast.error('Failed to update'); return }
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, published: !p.published } : p))
    toast.success(post.published ? 'Post unpublished' : 'Post published')
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post permanently?')) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    setPosts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Post deleted')
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Author</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No posts yet</td></tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-foreground line-clamp-1 max-w-xs">{post.title}</div>
                </td>
                <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell">
                  {post.author?.name ?? '—'}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground hidden sm:table-cell">
                  {formatDate(post.created_at)}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={post.published ? 'success' : 'default'}>
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink size={13} />
                    </Link>
                    <button
                      onClick={() => togglePublish(post)}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={post.published ? 'Unpublish' : 'Publish'}
                    >
                      {post.published ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <Link
                      href={`/edit/${post.id}`}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil size={13} />
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
