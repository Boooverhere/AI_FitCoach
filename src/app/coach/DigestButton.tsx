'use client'

import { useState } from 'react'
import { Sparkles, X, AlertTriangle, Star, TrendingUp, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function DigestButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  async function generateDigest() {
    setOpen(true)
    setLoading(true)
    setContent('')
    setError('')

    try {
      const res = await fetch('/api/digest', { method: 'POST' })

      if (!res.ok) {
        let message = `Server error (${res.status})`
        try {
          const json = await res.json()
          message = json.error ?? message
        } catch {
          const text = await res.text().catch(() => '')
          if (text) message = text
        }
        setError(message)
        setLoading(false)
        return
      }

      // Stream the text
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setContent(accumulated)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={generateDigest} variant="secondary" size="md" className="gap-2">
        <Sparkles className="h-4 w-4 text-[var(--accent-fg)]" />
        AI Digest
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />

          {/* Modal — full-screen sheet on mobile, centered card on desktop */}
          <div className="relative w-full sm:max-w-2xl bg-[var(--bg-elevated)] border border-[var(--border)] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-8)] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[var(--accent-tint)] flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[var(--accent-fg)]" />
                </div>
                <div>
                  <h2 className="font-semibold">AI Digest</h2>
                  <p className="text-xs text-[var(--fg-40)]">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !loading && setOpen(false)}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--fg-40)] hover:text-[var(--fg)] transition-colors disabled:opacity-30"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {loading && !content && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-[var(--accent-border-sub)] border-t-[var(--accent)] animate-spin" />
                    <Sparkles className="h-5 w-5 text-[var(--accent-fg)] absolute inset-0 m-auto" />
                  </div>
                  <p className="text-sm text-[var(--fg-40)]">Analysing today&apos;s check-ins…</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {content && <DigestContent text={content} streaming={loading} />}
            </div>

            {/* Footer */}
            {!loading && (content || error) && (
              <div className="px-6 py-4 border-t border-[var(--border-8)] flex justify-between items-center flex-shrink-0">
                <button
                  onClick={generateDigest}
                  className="text-sm text-[var(--fg-40)] hover:text-[var(--accent-fg)] flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Regenerate
                </button>
                <Button size="sm" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Renders the markdown-like sections with icons
function DigestContent({ text, streaming }: { text: string; streaming: boolean }) {
  const sections = parseDigest(text)

  const sectionIcons: Record<string, React.ReactNode> = {
    'Team Performance Summary': <Trophy className="h-4 w-4 text-[var(--accent-fg)]" />,
    'Needs Attention': <AlertTriangle className="h-4 w-4 text-yellow-400" />,
    'Standout Performers': <Star className="h-4 w-4 text-orange-400" />,
    'Patterns & Insights': <TrendingUp className="h-4 w-4 text-blue-400" />,
  }

  const sectionColors: Record<string, string> = {
    'Team Performance Summary': 'border-[var(--accent-border-sub)] bg-[var(--accent-wash)]',
    'Needs Attention': 'border-yellow-500/20 bg-yellow-500/5',
    'Standout Performers': 'border-orange-500/20 bg-orange-500/5',
    'Patterns & Insights': 'border-blue-500/20 bg-blue-500/5',
  }

  if (sections.length === 0) {
    // Still streaming the first section header
    return (
      <div className="text-sm text-[var(--fg-60)] leading-relaxed whitespace-pre-wrap">
        {text}
        {streaming && <span className="inline-block w-0.5 h-4 bg-[var(--accent-fg)] animate-pulse ml-0.5 align-middle" />}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section, i) => {
        const key = Object.keys(sectionIcons).find((k) =>
          section.title.includes(k)
        )
        const icon = key ? sectionIcons[key] : <Sparkles className="h-4 w-4 text-[var(--fg-40)]" />
        const colorClass = key ? sectionColors[key] : 'border-white/10 bg-white/3'
        const isLast = i === sections.length - 1

        return (
          <div
            key={i}
            className={`rounded-xl border p-4 ${colorClass}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <h3 className="font-semibold text-sm">{section.title}</h3>
            </div>
            <div className="text-sm text-[var(--fg-70)] leading-relaxed whitespace-pre-wrap">
              {section.body}
              {streaming && isLast && (
                <span className="inline-block w-0.5 h-4 bg-[var(--accent-fg)] animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function parseDigest(text: string): { title: string; body: string }[] {
  const sections: { title: string; body: string }[] = []
  // Match ## headings (with optional emoji)
  const parts = text.split(/^##\s+/m).filter(Boolean)

  for (const part of parts) {
    const newline = part.indexOf('\n')
    if (newline === -1) continue
    const title = part.slice(0, newline).trim()
    const body = part.slice(newline + 1).trim()
    if (title) sections.push({ title, body })
  }

  return sections
}
