import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProgramBuilder } from '../../ProgramBuilder'

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>
}) {
  const { programId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: program }, { data: weekRows }, { data: coachHabits }] = await Promise.all([
    supabase
      .from('programs')
      .select('id, name, description, duration_weeks')
      .eq('id', programId)
      .eq('coach_id', user.id)
      .single(),
    supabase
      .from('program_weeks')
      .select('week_number, habit_ids')
      .eq('program_id', programId)
      .order('week_number'),
    supabase
      .from('habits')
      .select('id, label, icon')
      .eq('coach_id', user.id)
      .order('label'),
  ])

  if (!program) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/coach/programs"
          className="flex items-center gap-1.5 text-sm text-[var(--fg-40)] hover:text-[var(--fg-70)] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to programs
        </Link>
        <h1 className="text-2xl font-bold">Edit Program</h1>
        <p className="text-[var(--fg-40)] text-sm mt-0.5">{program.name}</p>
      </div>

      <ProgramBuilder
        coachHabits={coachHabits ?? []}
        existingProgram={{
          id: program.id,
          name: program.name,
          description: program.description ?? '',
          duration_weeks: program.duration_weeks,
          weeks: (weekRows ?? []).map((w) => ({
            week_number: w.week_number,
            habit_ids: (w.habit_ids as string[]) ?? [],
          })),
        }}
      />
    </div>
  )
}
