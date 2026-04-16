'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Trash2, Dumbbell } from 'lucide-react'

const EMOJI_OPTIONS = ['🏋️', '🏃', '🧘', '🥗', '💧', '😴', '📖', '🚴', '🏊', '🧠', '💊', '🌿']

interface Habit {
  id: string
  label: string
  icon: string
  is_template: boolean
}

export function HabitsManager({
  coachId,
  initialHabits,
}: {
  coachId: string
  initialHabits: Habit[]
}) {
  const [habits, setHabits] = useState(initialHabits)
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('🏋️')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function createHabit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('habits')
      .insert({ coach_id: coachId, label: label.trim(), icon, is_template: true })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else if (data) {
      setHabits((prev) => [data, ...prev])
      setLabel('')
      setIcon('🏋️')
    }
    setLoading(false)
  }

  async function deleteHabit(id: string) {
    const supabase = createClient()
    await supabase.from('habits').delete().eq('id', id)
    setHabits((prev) => prev.filter((h) => h.id !== id))
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create form */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-6">
        <h2 className="font-semibold mb-5">New habit template</h2>
        <form onSubmit={createHabit} className="flex flex-col gap-4">
          <Input
            label="Habit name"
            placeholder="e.g. Morning walk"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <div>
            <label className="text-sm font-medium text-[var(--fg-70)] block mb-2">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`h-10 w-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    icon === em
                      ? 'bg-[var(--accent-tint)] ring-2 ring-[var(--accent-ring)]'
                      : 'bg-[var(--bg-input)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={!label.trim()}
            className="w-full mt-1"
          >
            <Plus className="h-4 w-4" />
            Create habit
          </Button>
        </form>
      </div>

      {/* Habits list */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-8)] flex items-center justify-between">
          <h2 className="font-semibold">Templates</h2>
          <span className="text-sm text-[var(--fg-40)]">{habits.length}</span>
        </div>

        {habits.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-xl bg-[var(--bg-input)] flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-[var(--fg-20)]" />
            </div>
            <p className="text-[var(--fg-30)] text-sm">
              Create your first habit template to assign to clients.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-5)] max-h-[480px] overflow-y-auto">
            {habits.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 px-6 py-4 hover:bg-[var(--bg-subtle)] transition-colors group"
              >
                <span className="text-xl">{h.icon}</span>
                <span className="flex-1 font-medium text-sm">{h.label}</span>
                <button
                  onClick={() => deleteHabit(h.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-[var(--fg-30)] hover:text-red-400 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
