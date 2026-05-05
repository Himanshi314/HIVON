'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { ImageUpload } from '@/components/editor/ImageUpload'
import { AISuggestions } from '@/components/editor/AISuggestions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateSlug, getReadingTime, stripHtml } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Sparkles, Eye, Save } from 'lucide-react'

export default function CreatePostPage() {
  const { user, isAuthor, loading } = useUser()
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  if (!loading && (!user || !isAuthor)) {
    router.replace('/login')
    return null
  }

  function addTag(value: string) {
    const cleaned = value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '')
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags([...tags, cleaned])
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  async function handleSubmit(publish: boolean) {
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!body || stripHtml(body).length < 50) { toast.error('Post content is too short (min 50 chars)'); return }
    if (!user) return

    publish ? setPublishing(true) : setSavingDraft(true)

    try {
      const slug = generateSlug(title)
      const readingTime = getReadingTime(body)

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: title.trim(),
          slug,
          body,
          image_url: imageUrl || null,
          author_id: user.id,
          tags,
          reading_time: readingTime,
          published: publish,
        })
        .select('id, slug')
        .single()

      if (postError) {
        if (postError.code === '23505') {
          toast.error('A post with this title already exists. Try a different title.')
        } else {
          toast.error(postError.message)
        }
        return
      }

      if (publish) {
        fetch('/api/ai/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'summary', postId: post.id, title: title.trim(), body }),
        }).catch(() => {})
      }

      toast.success(publish ? '🎉 Post published!' : 'Draft saved!')
      router.push(publish ? `/posts/${post.slug}` : '/admin')
    } catch (err: unknown) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setPublishing(false)
      setSavingDraft(false)
    }
  }

  const wordCount = stripHtml(body).split(/\s+/).filter(Boolean).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-foreground">New post</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {wordCount > 0 ? `${wordCount} words · ` : ''}
            AI summary will be generated automatically on publish
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit(false)}
            loading={savingDraft}
            className="gap-1.5"
          >
            <Save size={13} />
            Save draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit(true)}
            loading={publishing}
            className="gap-1.5"
          >
            <Sparkles size={13} />
            Publish + AI summary
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="space-y-6">
          <Input
            label="Title"
            placeholder="Your post title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium h-12"
          />

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Featured Image
            </label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              onRemove={() => setImageUrl('')}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Content
            </label>
            <RichTextEditor
              content={body}
              onChange={setBody}
              placeholder="Write your story… Use the toolbar for formatting."
            />
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20">
          <AISuggestions
            title={title}
            body={body}
            onSelectTitle={setTitle}
            onSelectTags={setTags}
          />

          <div className="rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs font-medium text-foreground cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => removeTag(tag)}
                  title="Click to remove"
                >
                  {tag} ×
                </span>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">No tags yet</p>
              )}
            </div>
            {tags.length < 5 && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addTag(tagInput)
                  }
                }}
                placeholder="Type tag + Enter"
                className="w-full h-8 px-2.5 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            )}
            <p className="text-[10px] text-muted-foreground">{tags.length}/5 tags · Press Enter or comma to add</p>
          </div>

          {title && (
            <div className="rounded-xl border border-border p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">URL Slug</h3>
              <p className="text-xs text-foreground font-mono break-all">
                /posts/<span className="text-primary">{generateSlug(title)}</span>
              </p>
            </div>
          )}

          <div className="rounded-xl border border-border p-4 space-y-2">
            <h3 className="text-sm font-semibold text-foreground mb-3">Publish</h3>
            <Button
              type="button"
              className="w-full gap-1.5"
              onClick={() => handleSubmit(true)}
              loading={publishing}
            >
              <Sparkles size={14} />
              Publish post
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-1.5"
              onClick={() => handleSubmit(false)}
              loading={savingDraft}
            >
              <Save size={14} />
              Save as draft
            </Button>
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              AI summary generated automatically on publish
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
