'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminDeleteComment({ commentId }: { commentId: string }) {
  const [deleted, setDeleted] = useState(false)
  const supabase = createClient()

  async function handleDelete() {
    if (!confirm('Delete this comment?')) return
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) { toast.error('Failed to delete'); return }
    setDeleted(true)
    toast.success('Comment deleted')
  }

  if (deleted) return <span className="text-xs text-muted-foreground">Deleted</span>

  return (
    <button
      onClick={handleDelete}
      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
      title="Delete comment"
    >
      <Trash2 size={13} />
    </button>
  )
}
