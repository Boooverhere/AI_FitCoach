'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Zap } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // After signup, go to onboarding to pick role
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent-wash)] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--accent-shadow)]">
            <Zap className="h-6 w-6 text-[var(--accent-on-solid)]" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-[var(--fg-40)] text-sm mt-1">Start your fitness journey today</p>
        </div>

        <form
          onSubmit={handleSignup}
          className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6 flex flex-col gap-4"
        >
          <Input
            label="Full name"
            type="text"
            placeholder="Alex Johnson"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} size="lg" className="mt-1 w-full">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--fg-40)] mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent-fg)] hover:text-[var(--accent-fg-muted)] font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
