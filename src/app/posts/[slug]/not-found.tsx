import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PostNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-32 text-center animate-fade-in">
      <p className="text-6xl mb-6">📄</p>
      <h1 className="font-serif text-3xl text-foreground mb-3">Post not found</h1>
      <p className="text-muted-foreground mb-8">
        This post may have been removed or the link is incorrect.
      </p>
      <Link
        href="/posts"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <ArrowLeft size={15} />
        Back to blog
      </Link>
    </div>
  )
}
