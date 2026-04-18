import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, CalendarDays, Users, Layers } from 'lucide-react'
import { AssignProgramModal } from './AssignProgramModal'
import { ProgramActions } from './ProgramActions'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: programs },
    { data: clients },
    { data: coachHabits },
  ] = await Promise.all([
    supabase
      .from('programs')
      .select('id, name, description, duration_weeks, created_at')
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('coach_id', user.id),
    supabase
      .from('habits')
      .select('id, label')
      .eq('coach_id', user.id),
  ])

  // For each program, count how many clients are assigned
  let assignmentCounts: Record<string, number> = {}
  if (programs?.length) {
    const { data: assignments } = await supabase
      .from('client_programs')
      .select('program_id')
      .in('program_id', programs.map((p) => p.id))
      .eq('status', 'active')

    for (const a of assignments ?? []) {
      assignmentCounts[a.program_id] = (assignmentCounts[a.program_id] ?? 0) + 1
    }
  }

  const programList = programs ?? []
  const clientList = clients ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-[var(--fg-40)] text-sm mt-0.5">
            Build structured week-by-week programs and assign them to clients.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {programList.length > 0 && clientList.length > 0 && (
            <AssignProgramModal
              programs={programList}
              clients={clientList}
            />
          )}
          <Link
            href="/coach/programs/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-on-solid)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            New program
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {!programList.length && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl p-14 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center">
            <Layers className="h-7 w-7 text-[var(--fg-30)]" />
          </div>
          <h3 className="font-semibold text-lg">No programs yet</h3>
          <p className="text-sm text-[var(--fg-40)] max-w-xs">
            Create your first program to build a structured week-by-week habit plan for your clients.
          </p>
          <Link
            href="/coach/programs/new"
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-on-solid)] text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Create first program
          </Link>
        </div>
      )}

      {/* Programs grid */}
      {programList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programList.map((p) => {
            const count = assignmentCounts[p.id] ?? 0
            return (
              <div
                key={p.id}
                className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold leading-snug">{p.name}</h3>
                    <ProgramActions programId={p.id} programName={p.name} />
                  </div>
                  {p.description && (
                    <p className="text-sm text-[var(--fg-40)] mb-3 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-[var(--fg-40)]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {p.duration_weeks} week{p.duration_weeks !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {count} active client{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-[var(--border-5)] flex items-center gap-2">
                  <Link
                    href={`/coach/programs/${p.id}/edit`}
                    className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg bg-[var(--bg-hover)] text-[var(--fg-50)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Edit
                  </Link>
                  {clientList.length > 0 && (
                    <AssignProgramModal
                      programs={programList}
                      clients={clientList}
                      defaultProgramId={p.id}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
