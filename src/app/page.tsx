import Link from 'next/link'
import { ArrowRight, Zap, Shield, PenLine } from 'lucide-react'
import { getPosts } from '@/lib/posts'
import { PostCard } from '@/components/posts/PostCard'

export default async function HomePage() {
  const { data: latestPosts } = await getPosts({ page: 1 })
  const preview = latestPosts.slice(0, 3)

  return (
    <div className="animate-fade-in">
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-20 text-center">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"
        />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-6 tracking-wide">
          <Zap size={12} />
          AI-POWERED · BUILT ON NEXT.JS &amp; SUPABASE
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-foreground leading-[1.1] mb-6">
          A space for ideas
          <br />
          <span className="text-primary">worth sharing</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
          Every post, automatically summarised by Google Gemini AI.
          Write, discover, and connect with ideas that matter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/posts"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            Explore posts
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/create"
            className="flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Start writing
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap size={18} className="text-primary" />,
              title: 'AI summaries',
              desc: 'Gemini generates a ~200-word summary for every post. Stored once — zero repeated API calls.',
            },
            {
              icon: <Shield size={18} className="text-primary" />,
              title: 'Database-level RBAC',
              desc: 'Viewer, Author, and Admin roles enforced by Supabase Row-Level Security — not just UI guards.',
            },
            {
              icon: <PenLine size={18} className="text-primary" />,
              title: 'Rich text editing',
              desc: 'Tiptap WYSIWYG editor with headings, links, images, and code blocks. Real writing experience.',
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {preview.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl text-foreground">Latest articles</h2>
            <Link
              href="/posts"
              className="flex items-center gap-1 text-sm text-primary hover:opacity-80 transition-opacity font-medium"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {preview.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-10 text-center">
          <h2 className="font-serif text-3xl text-foreground mb-3">
            Ready to write?
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Sign up as an Author and your first post gets an AI summary automatically.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Start writing
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  )
}
