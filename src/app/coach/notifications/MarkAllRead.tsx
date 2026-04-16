'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCheck } from 'lucide-react'

export function MarkAllRead({ coachId }: { coachId: string }) {
  const router = useRouter()

  async function markAll() {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('coach_id', coachId)
      .eq('read', false)
    router.refresh()
  }

  return (
    <button
      onClick={markAll}
      className="flex items-center gap-1.5 text-sm text-[var(--fg-40)] hover:text-[var(--accent-fg)] transition-colors"
    >
      <CheckCheck className="h-4 w-4" />
      Mark all read
    </button>
  )
}
