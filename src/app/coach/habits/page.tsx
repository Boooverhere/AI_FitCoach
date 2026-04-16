import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HabitsManager } from './HabitsManager'

export default async function HabitsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: habits } = await supabase
    .from('habits')
    .select('id, label, icon, is_template, created_at')
    .eq('coach_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Habit Templates</h1>
        <p className="text-white/40 mt-1">Create habits to assign to your clients</p>
      </div>
      <HabitsManager coachId={user.id} initialHabits={habits ?? []} />
    </div>
  )
}
