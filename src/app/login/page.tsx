'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/shared/Logo'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent-wash)] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo iconSize={44} wordmarkClass="text-[var(--fg)] text-xl" className="mb-4" />
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-[var(--fg-40)] text-sm mt-1">Sign in to your Coacheckin account</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6 flex flex-col gap-4"
        >
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--fg-40)] mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[var(--accent-fg)] hover:text-[var(--accent-fg-muted)] font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
