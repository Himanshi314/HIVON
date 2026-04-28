// src/app/(auth)/signup/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { Eye, EyeOff, PenLine, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'viewer' | 'author'>('viewer')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()

  function validate() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Name is required'
    if (!email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Minimum 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Update the role in profiles (the trigger creates the row as 'viewer' by default)
    if (data.user) {
      await supabase
        .from('profiles')
        .update({ role, name })
        .eq('id', data.user.id)
    }

    toast.success('Account created! Welcome to Hivon.')
    router.push('/')
    router.refresh()
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) toast.error(error.message)
  }

  const roles = [
    {
      value: 'viewer' as const,
      label: 'Reader',
      desc: 'Browse posts, leave comments',
      icon: <BookOpen size={18} />,
    },
    {
      value: 'author' as const,
      label: 'Author',
      desc: 'Write and publish your own posts',
      icon: <PenLine size={18} />,
    },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground text-sm">Join Hivon and start reading or writing</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* Google */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 h-10 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Role selector */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">I want to</p>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      'flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all',
                      role === r.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-muted-foreground/40'
                    )}
                  >
                    <span className={role === r.value ? 'text-primary' : 'text-muted-foreground'}>
                      {r.icon}
                    </span>
                    <span className="text-sm font-medium">{r.label}</span>
                    <span className="text-xs text-muted-foreground leading-tight">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-1">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
