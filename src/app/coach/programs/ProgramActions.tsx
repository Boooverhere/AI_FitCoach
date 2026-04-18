'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Trash2 } from 'lucide-react'

interface Props { programId: string; programName: string }

export function ProgramActions({ programId, programName }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleDelete() {
    if (!confirm(`Delete "${programName}"? This cannot be undone.`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('programs').delete().eq('id', programId)
    setDeleting(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--fg-30)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg)] transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-xl shadow-lg py-1 min-w-[140px]">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}
