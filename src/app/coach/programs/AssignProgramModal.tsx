'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { X, UserPlus } from 'lucide-react'

interface Client { id: string; full_name: string }
interface Program { id: string; name: string; duration_weeks: number }

interface Props {
  programs: Program[]
  clients: Client[]
  // preselect a program (from program list page)
  defaultProgramId?: string
}

export function AssignProgramModal({ programs, clients, defaultProgramId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [programId, setProgramId] = useState(defaultProgramId ?? '')
  const [clientId, setClientId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleOpen() {
    setProgramId(defaultProgramId ?? '')
    setClientId('')
    setStartDate(new Date().toISOString().slice(0, 10))
    setError('')
    setOpen(true)
  }

  async function handleAssign() {
    if (!programId || !clientId) {
      setError('Please select a program and a client.')
      return
    }
    setSaving(true)
    setError('')
    const supabase = createClient()

    // Get all habit_ids across all weeks for this program
    const { data: weekRows } = await supabase
      .from('program_weeks')
      .select('habit_ids')
      .eq('program_id', programId)

    const allHabitIds = [
      ...new Set((weekRows ?? []).flatMap((w) => (w.habit_ids as string[]) ?? [])),
    ]

    // Upsert habits into client_habits so they're trackable
    if (allHabitIds.length > 0) {
      // Get existing client_habits for this client to avoid duplicates
      const { data: existing } = await supabase
        .from('client_habits')
        .select('habit_id')
        .eq('client_id', clientId)

      const existingIds = new Set((existing ?? []).map((e) => e.habit_id))
      const toInsert = allHabitIds
        .filter((id) => !existingIds.has(id))
        .map((habit_id) => ({ client_id: clientId, habit_id, streak: 0 }))

      if (toInsert.length > 0) {
        const { error: habitErr } = await supabase.from('client_habits').insert(toInsert)
        if (habitErr) { setError(habitErr.message); setSaving(false); return }
      }
    }

    // Upsert client_programs (replace any existing assignment for this client)
    const { error: assignErr } = await supabase
      .from('client_programs')
      .upsert(
        {
          client_id: clientId,
          program_id: programId,
          start_date: startDate,
          current_week: 1,
          status: 'active',
        },
        { onConflict: 'client_id' }
      )

    if (assignErr) { setError(assignErr.message); setSaving(false); return }

    setSaving(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-tint)] text-[var(--accent-fg)] border border-[var(--accent-border-sub)] text-sm font-semibold hover:bg-[var(--accent-wash)] transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Assign to client
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-sm bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-8)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-8)]">
              <h3 className="font-bold">Assign Program</h3>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--fg-40)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
                  Program
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-3 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">Select a program…</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration_weeks}w)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
                  Client
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-3 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider block mb-1.5">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-3 py-2.5 text-sm text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button loading={saving} className="flex-1" onClick={handleAssign}>
                  Assign
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
