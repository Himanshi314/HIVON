import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { AdminPostsTable } from '@/components/admin/AdminPostsTable'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'
import { AdminDeleteComment } from '@/components/admin/AdminDeleteComment'
import { LayoutDashboard, FileText, Users, MessageCircle, TrendingUp } from 'lucide-react'
import type { Metadata } from 'next'
import type { Post } from '@/types'

export const metadata: Metadata = { title: 'Admin Dashboard' }

interface CommentRow {
  id: string
  comment_text: string
  created_at: string
  post_id: string
  user_id: string
  author: { name: string } | null
  post: { title: string; slug: string } | null
}

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/')

  const [
    { count: totalPosts },
    { count: totalUsers },
    { count: totalComments },
    { data: posts },
    { data: users },
    { data: recentComments },
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase
      .from('posts')
      .select('id, title, slug, published, created_at, author_id, author:profiles!posts_author_id_fkey(name)')
      .order('created_at', { ascending: false }).limit(50),
    supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('comments')
      .select('id, comment_text, created_at, post_id, user_id, author:profiles!comments_user_id_fkey(name), post:posts!comments_post_id_fkey(title, slug)')
      .order('created_at', { ascending: false }).limit(10),
  ])

  const stats = [
    { label: 'Total Posts',  value: totalPosts   ?? 0, icon: <FileText      size={18} />, color: 'text-blue-600    bg-blue-100    dark:bg-blue-900/30'    },
    { label: 'Users',        value: totalUsers   ?? 0, icon: <Users         size={18} />, color: 'text-violet-600  bg-violet-100  dark:bg-violet-900/30'  },
    { label: 'Comments',     value: totalComments?? 0, icon: <MessageCircle size={18} />, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Published',    value: posts?.filter((p) => p.published).length ?? 0, icon: <TrendingUp size={18} />, color: 'text-amber-600  bg-amber-100  dark:bg-amber-900/30'  },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <LayoutDashboard size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-2xl text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Full platform overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText size={16} /> All Posts
        </h2>
        {/* Supabase returns joined `author` as an array; cast via unknown */}
        <AdminPostsTable posts={(posts ?? []) as unknown as Post[]} currentUserId={user.id} />
      </section>

      <section className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageCircle size={16} /> Recent Comments
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {!(recentComments ?? []).length ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No comments yet</div>
          ) : (
            <div className="divide-y divide-border">
              {(recentComments as unknown as CommentRow[]).map((c) => (
                <div key={c.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">{c.comment_text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      by <span className="font-medium">{c.author?.name ?? 'Unknown'}</span>
                      {' · '}on <span className="font-medium">{c.post?.title ?? 'Unknown post'}</span>
                      {' · '}{formatDate(c.created_at, true)}
                    </p>
                  </div>
                  <AdminDeleteComment commentId={c.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users size={16} /> Users
        </h2>
        <AdminUsersTable users={users ?? []} currentUserId={user.id} />
      </section>
    </div>
  )
}
