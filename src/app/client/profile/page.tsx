import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HealthProfileForm } from './HealthProfileForm'

export default async function HealthProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: healthProfile } = await supabase
    .from('health_profiles')
    .select('data, updated_at')
    .eq('client_id', user.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Health Profile</h1>
        <p className="text-[var(--fg-40)] text-sm mt-0.5">
          Share your health data with your coach for personalised guidance.
        </p>
      </div>

      <HealthProfileForm
        clientId={user.id}
        initialData={healthProfile?.data ?? null}
        updatedAt={healthProfile?.updated_at ?? null}
      />
    </div>
  )
}
