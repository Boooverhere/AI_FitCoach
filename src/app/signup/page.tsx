'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Logo } from '@/components/shared/Logo'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If no session, email confirmation is required — show check-your-email screen.
    // The confirmation link includes ?next=/onboarding so the user lands on onboarding
    // already authenticated and can correctly set their role.
    if (!data.session) {
      setCheckEmail(true)
      setLoading(false)
      return
    }

    // Email confirmation disabled — authenticated immediately, go straight to onboarding
    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent-wash)] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">

        {checkEmail ? (
          <div className="flex flex-col items-center text-center gap-4">
            <Logo iconSize={44} wordmarkClass="text-[var(--fg)] text-xl" className="mb-2" />
            <div className="h-14 w-14 rounded-full bg-[var(--accent-tint)] flex items-center justify-center text-2xl">📬</div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-[var(--fg-40)] text-sm leading-relaxed">
              We sent a confirmation link to <strong className="text-[var(--fg)]">{email}</strong>.<br />
              Click it to confirm your account — you&apos;ll be taken straight to setup.
            </p>
            <p className="text-xs text-[var(--fg-40)] mt-2">Didn&apos;t get it? Check your spam folder.</p>
          </div>
        ) : (
        <>
        <div className="flex flex-col items-center mb-8">
          <Logo iconSize={44} wordmarkClass="text-[var(--fg)] text-xl" className="mb-4" />
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-[var(--fg-40)] text-sm mt-1">Start coaching smarter today</p>
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

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 accent-teal-600 shrink-0"
              required
            />
            <span className="text-xs text-[var(--fg-40)] leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="text-[var(--accent-fg)] hover:underline font-medium">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" className="text-[var(--accent-fg)] hover:underline font-medium">Privacy Policy</Link>
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} size="lg" className="mt-1 w-full" disabled={!agreed}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--fg-40)] mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent-fg)] hover:text-[var(--accent-fg-muted)] font-medium">
            Sign in
          </Link>
        </p>
        </>
        )}
      </div>
    </div>
  )
}
