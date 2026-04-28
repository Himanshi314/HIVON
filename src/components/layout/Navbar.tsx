// src/components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Sun,
  Moon,
  PenLine,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, profile, isAdmin, isAuthor } = useUser()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/posts', label: 'Blog' },
    ...(isAuthor ? [{ href: '/create', label: 'Write' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-200',
        scrolled
          ? 'bg-background/80 backdrop-blur-md border-b border-border/60 shadow-sm'
          : 'bg-background border-b border-transparent'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl text-foreground hover:opacity-80 transition-opacity"
        >
          Hivon<span className="text-primary">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {/* Write button */}
              {isAuthor && (
                <Link
                  href="/create"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <PenLine size={14} />
                  Write
                </Link>
              )}

              {/* User menu */}
              <div className="relative group">
                <button className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center hover:bg-primary/20 transition-colors">
                  {profile?.name?.charAt(0).toUpperCase() || '?'}
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium truncate">{profile?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard size={14} />
                      Admin panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-destructive"
            >
              <LogOut size={14} />
              Sign out
            </button>
          ) : (
            <div className="flex gap-2 mt-1">
              <Link href="/login" className="flex-1 text-center py-2 text-sm border border-border rounded-md">Sign in</Link>
              <Link href="/signup" className="flex-1 text-center py-2 text-sm bg-primary text-primary-foreground rounded-md">Get started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
