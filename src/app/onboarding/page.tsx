'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dumbbell, Users, ChevronRight, Check } from 'lucide-react'

type Step = 'role' | 'name' | 'invite'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState<'coach' | 'client' | null>(null)
  const [fullName, setFullName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  async function handleFinish() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    if (role === 'coach') {
      // Generate invite code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, role: 'coach', full_name: fullName, invite_code: code })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      window.location.href = '/coach'
    } else {
      // Find coach by invite code using a security-definer RPC to bypass RLS
      const { data: coachId, error: codeError } = await supabase
        .rpc('lookup_coach_by_invite_code', { code: inviteCode.toUpperCase().trim() })

      if (codeError || !coachId) {
        setError('Invalid invite code. Please check with your coach.')
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, role: 'client', full_name: fullName, coach_id: coachId as string })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      window.location.href = '/client'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg-base)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[var(--accent-wash)] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {['role', 'name', 'invite'].map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s
                  ? 'w-6 bg-[var(--accent)]'
                  : i < ['role', 'name', 'invite'].indexOf(step)
                  ? 'w-6 bg-[var(--accent)] opacity-50'
                  : 'w-1.5 bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        {/* Step: choose role */}
        {step === 'role' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">I am a…</h1>
              <p className="text-white/40 text-sm mt-1">Choose your role to get started</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setRole('coach')}
                className={`
                  flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-150
                  ${
                    role === 'coach'
                      ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                      : 'border-[var(--border-8)] bg-[var(--bg-surface)] hover:border-[var(--border)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    role === 'coach' ? 'bg-[var(--accent-tint)]' : 'bg-[var(--bg-input)]'
                  }`}
                >
                  <Users
                    className={`h-6 w-6 ${role === 'coach' ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-40)]'}`}
                  />
                </div>
                <div className="text-center">
                  <div className="font-semibold">Coach</div>
                  <div className="text-xs text-white/40 mt-0.5">Manage clients</div>
                </div>
                {role === 'coach' && (
                  <div className="h-5 w-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setRole('client')}
                className={`
                  flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-150
                  ${
                    role === 'client'
                      ? 'border-[var(--accent)] bg-[var(--accent-tint)]'
                      : 'border-[var(--border-8)] bg-[var(--bg-surface)] hover:border-[var(--border)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    role === 'client' ? 'bg-[var(--accent-tint)]' : 'bg-[var(--bg-input)]'
                  }`}
                >
                  <Dumbbell
                    className={`h-6 w-6 ${role === 'client' ? 'text-[var(--accent-fg)]' : 'text-[var(--fg-40)]'}`}
                  />
                </div>
                <div className="text-center">
                  <div className="font-semibold">Client</div>
                  <div className="text-xs text-white/40 mt-0.5">Track habits</div>
                </div>
                {role === 'client' && (
                  <div className="h-5 w-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                )}
              </button>
            </div>

            <Button
              disabled={!role}
              size="lg"
              className="w-full"
              onClick={() => setStep('name')}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step: enter name */}
        {step === 'name' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">What&apos;s your name?</h1>
              <p className="text-white/40 text-sm mt-1">
                This is how coaches and clients will see you
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6">
              <Input
                label="Full name"
                type="text"
                placeholder="Alex Johnson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => setStep('role')}
              >
                Back
              </Button>
              <Button
                disabled={!fullName.trim()}
                size="lg"
                className="flex-1"
                onClick={() => (role === 'client' ? setStep('invite') : handleFinish())}
              >
                {role === 'client' ? (
                  <>Continue <ChevronRight className="h-4 w-4" /></>
                ) : (
                  'Finish'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: invite code (clients only) */}
        {step === 'invite' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Enter invite code</h1>
              <p className="text-white/40 text-sm mt-1">
                Ask your coach for their 6-character code
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6">
              <Input
                label="Coach invite code"
                type="text"
                placeholder="e.g. ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase tracking-widest text-center text-lg font-mono"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => { setStep('name'); setError('') }}
              >
                Back
              </Button>
              <Button
                disabled={inviteCode.length < 6}
                loading={loading}
                size="lg"
                className="flex-1"
                onClick={handleFinish}
              >
                Join coach
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
