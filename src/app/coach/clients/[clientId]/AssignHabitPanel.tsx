'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Habit {
  id: string
  label: string
  icon: string
}

interface Props {
  clientId: string
  coachHabits: Habit[]
  assignedHabitIds: string[]
}

export function AssignHabitPanel({ clientId, coachHabits, assignedHabitIds }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const unassigned = coachHabits.filter((h) => !assignedHabitIds.includes(h.id))

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function assign() {
    if (!selected.length) return
    setLoading(true)

    const rows = selected.map((habitId) => ({
      client_id: clientId,
      habit_id: habitId,
      streak: 0,
    }))

    await supabase.from('client_habits').insert(rows)
    setSelected([])
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-5">
      <h2 className="font-semibold mb-4">Assign habits</h2>

      {!unassigned.length ? (
        <p className="text-sm text-[var(--fg-30)]">All habits are already assigned.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {unassigned.map((h) => (
            <button
              key={h.id}
              onClick={() => toggle(h.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-colors ${
                selected.includes(h.id)
                  ? 'bg-[var(--accent-tint)] text-[var(--accent-fg)] border border-[var(--accent-border-sub)]'
                  : 'bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--fg-70)] border border-transparent'
              }`}
            >
              <span>{h.icon}</span>
              <span className="flex-1">{h.label}</span>
              {selected.includes(h.id) ? (
                <X className="h-3.5 w-3.5 text-[var(--accent-fg)]" />
              ) : (
                <Plus className="h-3.5 w-3.5 text-[var(--fg-30)]" />
              )}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <Button
          size="sm"
          loading={loading}
          onClick={assign}
          className="w-full"
        >
          Assign {selected.length} habit{selected.length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )
}
