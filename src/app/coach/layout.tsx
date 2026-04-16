import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { CoachSidebar } from '@/components/shared/CoachSidebar'
import { BottomNav } from '@/components/shared/BottomNav'

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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
      <BottomNav role="coach" />
    </div>
  )
}
