import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProgramBuilder } from '../ProgramBuilder'

export default async function NewProgramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: coachHabits } = await supabase
    .from('habits')
    .select('id, label, icon')
    .eq('coach_id', user.id)
    .order('label')

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
        <h1 className="text-2xl font-bold">New Program</h1>
        <p className="text-[var(--fg-40)] text-sm mt-0.5">
          Build a structured week-by-week habit plan.
        </p>
      </div>

      <ProgramBuilder coachHabits={coachHabits ?? []} />
    </div>
  )
}
