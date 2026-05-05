'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { AISuggestions } from '@/components/editor/AISuggestions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getReadingTime, stripHtml } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Save, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import type { Post } from '@/types'

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useUser()
  const supabase = createClient()

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/login'); return }

    async function loadPost() {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles!posts_author_id_fkey(id, name, role)')
        .eq('id', id)
        .single()

      if (error || !data) { toast.error('Post not found'); router.replace('/admin'); return }

      if (data.author_id !== user!.id && !isAdmin) {
        toast.error('You do not have permission to edit this post')
        router.replace('/')
        return
      }

      setPost(data as Post)
      setTitle(data.title)
      setBody(data.body)
      setImageUrl(data.image_url ?? '')
      setTags(data.tags ?? [])
      setPublished(data.published)
      setLoading(false)
    }
    loadPost()
  }, [id, user, isAdmin, authLoading])

  function addTag(value: string) {
    const cleaned = value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) setTags([...tags, cleaned])
    setTagInput('')
  }

  async function handleSave() {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!body || stripHtml(body).length < 50) { toast.error('Content is too short'); return }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: title.trim(),
          body,
          image_url: imageUrl || null,
          tags,
          published,
          reading_time: getReadingTime(body),
        })
        .eq('id', id)

      if (error) throw error
      toast.success('Post updated!')
      router.push(`/posts/${post?.slug}`)
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this post permanently? This cannot be undone.')) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
      toast.success('Post deleted')
      router.push('/admin')
    } catch {
      toast.error('Failed to delete post')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-12 w-full bg-muted rounded-xl" />
        <div className="h-64 w-full bg-muted rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href={post?.slug ? `/posts/${post.slug}` : '/admin'}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-foreground">Edit post</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Changes will not regenerate the AI summary</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            loading={deleting}
            className="gap-1.5"
          >
            <Trash2 size={13} />
            Delete
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            loading={saving}
            className="gap-1.5"
          >
            <Save size={13} />
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="space-y-6">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium h-12"
          />
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Featured Image</label>
            <ImageUpload value={imageUrl} onChange={setImageUrl} onRemove={() => setImageUrl('')} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">Content</label>
            <RichTextEditor content={body} onChange={setBody} />
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20">
          <AISuggestions title={title} body={body} onSelectTitle={setTitle} onSelectTags={setTags} />

          <div className="rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Visibility</h3>
            <button
              type="button"
              onClick={() => setPublished(!published)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                {published ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-muted-foreground" />}
                <span className="text-sm font-medium">{published ? 'Published' : 'Draft'}</span>
              </div>
              <div className={`w-9 h-5 rounded-full transition-colors ${published ? 'bg-green-500' : 'bg-muted-foreground/30'} relative`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${published ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>

          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  {tag} ×
                </span>
              ))}
            </div>
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
                placeholder="Add tag + Enter"
                className="w-full h-8 px-2.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            )}
          </div>

          <Button type="button" className="w-full" onClick={handleSave} loading={saving}>
            <Save size={14} className="mr-1.5" />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}
