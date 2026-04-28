// src/app/api/ai/summary/route.ts
// Central AI route — handles summary generation, title suggestions, tag suggestions
// Summary is generated ONCE and stored in DB. Never re-generated on fetch.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePostSummary, suggestTags, suggestTitles } from '@/lib/gemini'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, postId, title, body: content } = body

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    // ── Generate + store summary ──────────────────────────
    if (action === 'summary') {
      if (!postId || !title || !content) {
        return NextResponse.json({ error: 'postId, title and body required' }, { status: 400 })
      }

      const supabase = await createClient()

      // Cost optimisation: check if summary already exists — skip API call if so
      const { data: existing } = await supabase
        .from('posts')
        .select('summary')
        .eq('id', postId)
        .single()

      if (existing?.summary) {
        return NextResponse.json({ summary: existing.summary, cached: true })
      }

      // Generate fresh summary
      const summary = await generatePostSummary(title, content)

      // Store it — one write, read from DB forever after
      await supabase
        .from('posts')
        .update({ summary })
        .eq('id', postId)

      return NextResponse.json({ summary, cached: false })
    }

    // ── Title suggestions ─────────────────────────────────
    if (action === 'titles') {
      if (!title || !content) {
        return NextResponse.json({ error: 'title and body required' }, { status: 400 })
      }
      const titles = await suggestTitles(title, content)
      return NextResponse.json({ titles })
    }

    // ── Tag suggestions ───────────────────────────────────
    if (action === 'tags') {
      if (!content) {
        return NextResponse.json({ error: 'body required' }, { status: 400 })
      }
      const tags = await suggestTags(title ?? '', content)
      return NextResponse.json({ tags })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    console.error('[/api/ai/summary]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
