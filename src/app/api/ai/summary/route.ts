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

    if (action === 'summary') {
      if (!postId || !title || !content) {
        return NextResponse.json({ error: 'postId, title and body required' }, { status: 400 })
      }

      const supabase = await createClient()

      const { data: existing } = await supabase
        .from('posts')
        .select('summary')
        .eq('id', postId)
        .single()

      if (existing?.summary) {
        return NextResponse.json({ summary: existing.summary, cached: true })
      }

      const summary = await generatePostSummary(title, content)

      await supabase
        .from('posts')
        .update({ summary })
        .eq('id', postId)

      return NextResponse.json({ summary, cached: false })
    }

    if (action === 'titles') {
      if (!title || !content) {
        return NextResponse.json({ error: 'title and body required' }, { status: 400 })
      }
      const titles = await suggestTitles(title, content)
      return NextResponse.json({ titles })
    }

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
