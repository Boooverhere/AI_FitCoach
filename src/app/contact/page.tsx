'use client'

import Link from 'next/link'
import { Logo } from '@/components/shared/Logo'
import { ArrowLeft, Clock, MessageCircle, CheckCircle2, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const BG = '#faf8f4'
const HEADLINE = '#042F2E'
const MUTED = '#78716C'
const BORDER = 'rgba(4,47,46,0.07)'
const BORDER_T = 'rgba(45,212,191,0.22)'

const TOPICS = [
  { value: 'general',     label: 'General question' },
  { value: 'support',     label: 'Technical support' },
  { value: 'billing',     label: 'Billing' },
  { value: 'partnership', label: 'Partnership' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [topic, setTopic]     = useState('general')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, _trap: '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong.')
        setStatus('error')
      } else {
        setStatus('success')
      }
    } catch {
      setErrorMsg('Network error — please try again.')
      setStatus('error')
    }
  }

  const inputClass = "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
  const inputStyle = { background: '#ffffff', borderColor: 'rgba(4,47,46,0.14)', color: HEADLINE }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: BG }}>

      <header className="border-b backdrop-blur-md sticky top-0 z-40"
        style={{ background: 'rgba(250,248,244,0.92)', borderColor: BORDER }}>
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <Logo iconSize={26} wordmarkClass="text-[#042F2E]" className="shrink-0" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-1.5 text-sm font-medium text-stone-500 hover:text-[#042F2E] transition-colors">
              Sign in
            </Link>
            <Link href="/signup"
              className="px-4 py-1.5 text-sm font-semibold rounded-xl text-white transition-all hover:scale-[1.02]"
              style={{ background: '#F97316', boxShadow: '0 0 18px rgba(249,115,22,0.25)' }}>
              Try for free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-16">
        <div className="max-w-lg mx-auto">

          <Link href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-8 transition-colors"
            style={{ color: MUTED }}>
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-3">Contact</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ color: HEADLINE }}>
            We&apos;d love to hear from you
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: MUTED }}>
            Send us a message and we&apos;ll get back to you as soon as possible.
          </p>

          {/* Contact form */}
          {status === 'success' ? (
            <div className="rounded-2xl p-8 flex flex-col items-center text-center gap-4"
              style={{ background: '#ffffff', border: `1px solid ${BORDER_T}` }}>
              <div className="h-12 w-12 rounded-full bg-teal-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: HEADLINE }}>Message sent</p>
                <p className="text-sm" style={{ color: MUTED }}>We&apos;ll get back to you at <strong>contact@coacheckin.com</strong> as soon as possible.</p>
              </div>
              <button onClick={() => { setStatus('idle'); setName(''); setEmail(''); setMessage(''); setTopic('general') }}
                className="text-xs text-teal-600 hover:underline mt-1">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: '#ffffff', border: `1px solid ${BORDER_T}` }}>

              {/* Honeypot */}
              <input type="text" name="_trap" className="hidden" tabIndex={-1} autoComplete="off"
                onChange={() => {}} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: HEADLINE }}>Name <span className="text-rose-400">*</span></label>
                  <input type="text" required maxLength={100} placeholder="Your name"
                    className={inputClass} style={inputStyle}
                    value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: HEADLINE }}>Email <span className="text-rose-400">*</span></label>
                  <input type="email" required maxLength={254} placeholder="you@example.com"
                    className={inputClass} style={inputStyle}
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: HEADLINE }}>Topic</label>
                <select className={inputClass} style={inputStyle}
                  value={topic} onChange={e => setTopic(e.target.value)}>
                  {TOPICS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: HEADLINE }}>Message <span className="text-rose-400">*</span></label>
                <textarea required minLength={10} maxLength={4000} rows={5}
                  placeholder="Tell us what's on your mind…"
                  className={inputClass + " resize-none"} style={inputStyle}
                  value={message} onChange={e => setMessage(e.target.value)} />
                <p className="text-xs text-right" style={{ color: MUTED }}>{message.length}/4000</p>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={status === 'loading'}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: '#F97316', boxShadow: '0 4px 16px rgba(249,115,22,0.22)' }}>
                {status === 'loading' ? 'Sending…' : 'Send message'}
              </button>

              <p className="text-xs text-center" style={{ color: MUTED }}>
                For billing or account issues email{' '}
                <a href="mailto:support@coacheckin.com" className="text-teal-600 hover:underline">
                  support@coacheckin.com
                </a>
              </p>
            </form>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <div className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}` }}>
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-teal-600" />
              </div>
              <p className="font-semibold text-sm" style={{ color: HEADLINE }}>Response time</p>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>Usually within a few hours during business days</p>
            </div>
            <div className="rounded-2xl p-4 flex flex-col gap-2"
              style={{ background: '#ffffff', border: `1px solid ${BORDER}` }}>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-orange-500" />
              </div>
              <p className="font-semibold text-sm" style={{ color: HEADLINE }}>What we help with</p>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>Onboarding, technical issues, feature requests</p>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t py-6 mt-8" style={{ background: '#021815', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Logo iconSize={20} wordmarkClass="text-white/70 text-sm" />
          <div className="flex items-center gap-5 text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            <Link href="/about"   className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>&copy; {new Date().getFullYear()} Coacheckin &mdash; operated by Mehdi Elyoussefi, Morocco</p>
        </div>
      </footer>
    </div>
  )
}

