// src/components/layout/Footer.tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg">
            Hivon<span className="text-primary">.</span>
          </span>
          <span className="text-muted-foreground text-sm">
            Ideas worth sharing
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/posts" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">
            Get started
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hivon Automations LLP
        </p>
      </div>
    </footer>
  )
}
