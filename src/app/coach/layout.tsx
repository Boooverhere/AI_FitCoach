import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { CoachSidebar } from '@/components/shared/CoachSidebar'

export default async function CoachLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')
  if (profile.role !== 'coach') redirect('/client')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar fullName={profile.full_name} role="coach" />
      <div className="flex flex-1 overflow-hidden">
        <CoachSidebar />
        <main className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}
