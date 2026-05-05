'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Tag, Type, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AISuggestionsProps {
  title: string
  body: string
  onSelectTitle: (title: string) => void
  onSelectTags: (tags: string[]) => void
}

export function AISuggestions({ title, body, onSelectTitle, onSelectTags }: AISuggestionsProps) {
  const [open, setOpen] = useState(false)
  const [loadingTitles, setLoadingTitles] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)
  const [titles, setTitles] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  async function fetchTitles() {
    if (!body || body.replace(/<[^>]+>/g, '').trim().length < 50) {
      toast.error('Write at least 50 characters before getting title suggestions')
      return
    }
    setLoadingTitles(true)
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'titles', title, body }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTitles(data.titles ?? [])
    } catch {
      toast.error('Failed to get title suggestions')
    } finally {
      setLoadingTitles(false)
    }
  }

  async function fetchTags() {
    if (!body || body.replace(/<[^>]+>/g, '').trim().length < 50) {
      toast.error('Write more content before suggesting tags')
      return
    }
    setLoadingTags(true)
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tags', title, body }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTags(data.tags ?? [])
      setSelectedTags(data.tags ?? [])
    } catch {
      toast.error('Failed to get tag suggestions')
    } finally {
      setLoadingTags(false)
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-primary" />
          <span className="text-sm font-semibold text-primary">AI Writing Assistant</span>
          <span className="text-xs text-primary/60 bg-primary/10 px-2 py-0.5 rounded-full">Gemini</span>
        </div>
        <span className="text-xs text-primary/70">{open ? '▲ collapse' : '▼ expand'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-primary/10 space-y-5 pt-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Type size={13} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Title Suggestions</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fetchTitles}
                loading={loadingTitles}
                className="h-7 text-xs gap-1"
              >
                <RefreshCw size={11} />
                Generate
              </Button>
            </div>
            {titles.length > 0 && (
              <div className="space-y-2">
                {titles.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { onSelectTitle(t); toast.success('Title updated!') }}
                    className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {!titles.length && !loadingTitles && (
              <p className="text-xs text-muted-foreground">Click Generate to get 3 improved title ideas.</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Tag size={13} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">Tag Suggestions</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={fetchTags}
                loading={loadingTags}
                className="h-7 text-xs gap-1"
              >
                <RefreshCw size={11} />
                Suggest
              </Button>
            </div>
            {tags.length > 0 && (
              <>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                        selectedTags.includes(tag)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-foreground'
                      )}
                    >
                      {tag}
                      {selectedTags.includes(tag) && <X size={9} />}
                    </button>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => { onSelectTags(selectedTags); toast.success('Tags applied!') }}
                  className="w-full h-8 text-xs"
                >
                  Apply {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}
                </Button>
              </>
            )}
            {!tags.length && !loadingTags && (
              <p className="text-xs text-muted-foreground">Click Suggest to get relevant tags for your post.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
