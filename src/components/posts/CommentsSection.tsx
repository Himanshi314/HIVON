// src/components/posts/CommentsSection.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { formatDate } from '@/lib/utils'
import { RoleBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Trash2, MessageCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { Comment } from '@/types'
import { cn } from '@/lib/utils'

interface CommentsSectionProps {
  postId: string
  initialComments: Comment[]
}

export function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, profile, isAdmin } = useUser()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || !user) return

    setSubmitting(true)

    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, comment_text: text.trim() })
      .select(`id, post_id, user_id, comment_text, created_at,
               author:profiles!comments_user_id_fkey(id, name, avatar_url, role)`)
      .single()

    if (error) {
      toast.error('Failed to post comment. Please try again.')
    } else {
      setComments((prev) => [...prev, data as Comment])
      setText('')
      toast.success('Comment posted!')
    }
    setSubmitting(false)
  }

  async function handleDelete(commentId: string, commentUserId: string) {
    const canDelete = isAdmin || user?.id === commentUserId
    if (!canDelete) return

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      toast.error('Could not delete comment.')
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success('Comment deleted.')
    }
  }

  return (
    <section className="mt-14 pt-10 border-t border-border">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <MessageCircle size={20} className="text-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h2>
      </div>

      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="flex flex-col gap-5 mb-10">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={isAdmin || user?.id === comment.user_id}
              onDelete={() => handleDelete(comment.id, comment.user_id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 rounded-xl border border-dashed border-border mb-10">
          <MessageCircle size={28} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        </div>
      )}

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
              {profile?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <span className="text-sm font-medium">{profile?.name}</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts…"
            rows={3}
            className={cn(
              'w-full px-3 py-2.5 rounded-lg border border-border text-sm',
              'bg-background placeholder:text-muted-foreground resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'transition-colors'
            )}
            maxLength={1000}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">{text.length}/1000</span>
            <Button
              type="submit"
              size="sm"
              loading={submitting}
              disabled={!text.trim()}
              className="gap-1.5"
            >
              <Send size={13} />
              Post comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-muted/50 border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to join the conversation
          </p>
          <div className="flex justify-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

// ── Single comment ────────────────────────────────────────
function CommentItem({
  comment,
  canDelete,
  onDelete,
}: {
  comment: Comment
  canDelete: boolean
  onDelete: () => void
}) {
  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground text-sm font-semibold flex-shrink-0 mt-0.5">
        {comment.author?.name?.charAt(0).toUpperCase() ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-medium text-foreground">
            {comment.author?.name ?? 'Anonymous'}
          </span>
          {comment.author?.role && comment.author.role !== 'viewer' && (
            <RoleBadge role={comment.author.role} />
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDate(comment.created_at, true)}
          </span>
          {canDelete && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-1"
              aria-label="Delete comment"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground leading-relaxed break-words">
          {comment.comment_text}
        </p>
      </div>
    </div>
  )
}
