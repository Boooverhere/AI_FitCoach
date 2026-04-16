'use client'

import { useState } from 'react'
import { X, Link2, Mail, Check, UserPlus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type Tab = 'link' | 'email'

export function AddClientModal({ inviteCode }: { inviteCode: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('link')
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const inviteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/signup?invite=${inviteCode}`
      : `/signup?invite=${inviteCode}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Could not copy — please copy the link manually.')
    }
  }

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSending(true)
    setError('')
    setSent(false)

    const res = await fetch('/api/invite-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, inviteCode }),
    })

    if (res.ok) {
      setSent(true)
      setEmail('')
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Failed to send email.')
    }
    setSending(false)
  }

  function close() {
    setOpen(false)
    setEmail('')
    setError('')
    setSent(false)
    setCopied(false)
  }

  return (
    <>
      <Button variant="cta" size="md" className="gap-2" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Add Client
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />

          {/* Sheet */}
          <div className="relative w-full sm:max-w-md bg-[var(--bg-elevated)] border border-[var(--border)] sm:rounded-2xl rounded-t-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-8)]">
              <div>
                <h2 className="font-semibold">Add a Client</h2>
                <p className="text-xs text-[var(--fg-40)] mt-0.5">Choose how to invite them</p>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--fg-40)] hover:text-[var(--fg)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border-8)]">
              <button
                onClick={() => setTab('link')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  tab === 'link'
                    ? 'border-[var(--accent)] text-[var(--accent-fg)]'
                    : 'border-transparent text-[var(--fg-40)] hover:text-[var(--fg)]'
                }`}
              >
                <Link2 className="h-4 w-4" />
                Send invite link
              </button>
              <button
                onClick={() => setTab('email')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  tab === 'email'
                    ? 'border-[var(--accent)] text-[var(--accent-fg)]'
                    : 'border-transparent text-[var(--fg-40)] hover:text-[var(--fg)]'
                }`}
              >
                <Mail className="h-4 w-4" />
                Invite by email
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {tab === 'link' && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-[var(--fg-60)]">
                    Share this link with your client. When they sign up, they will automatically be linked to your account.
                  </p>
                  <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3">
                    <span className="text-xs text-[var(--fg-50)] truncate flex-1 font-mono">
                      {inviteUrl}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full gap-2"
                    onClick={copyLink}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Copy invite link
                      </>
                    )}
                  </Button>
                  {error && (
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {error}
                    </p>
                  )}
                </div>
              )}

              {tab === 'email' && (
                <form onSubmit={sendEmail} className="flex flex-col gap-4">
                  <p className="text-sm text-[var(--fg-60)]">
                    Enter your client's email address and we will send them a personalised invite with their sign-up link.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[var(--fg-70)]">Email address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setSent(false); setError('') }}
                      placeholder="client@example.com"
                      className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all"
                    />
                  </div>
                  {sent && (
                    <div className="flex items-center gap-2 bg-[var(--accent-tint)] border border-[var(--accent-border-sub)] rounded-xl px-4 py-3">
                      <Check className="h-4 w-4 text-[var(--accent-fg)] shrink-0" />
                      <p className="text-sm text-[var(--accent-fg)]">Invite sent successfully!</p>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    loading={sending}
                    className="w-full gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send invite email
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
