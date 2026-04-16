'use client'

import { useState } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'

export function InviteCodeBanner({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-[var(--accent-wash)] border border-[var(--accent-border-sub)] rounded-2xl px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-[var(--accent-tint)] flex items-center justify-center">
          <Share2 className="h-4 w-4 text-[var(--accent-fg)]" />
        </div>
        <div>
          <p className="text-sm text-[var(--fg-60)]">Your client invite code</p>
          <p className="text-xl font-mono font-bold tracking-widest text-[var(--accent-fg)]">{code}</p>
        </div>
      </div>
      <button
        onClick={copyCode}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-[var(--accent-tint)] hover:bg-[var(--accent-border-sub)] text-[var(--accent-fg)] transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy
          </>
        )}
      </button>
    </div>
  )
}
