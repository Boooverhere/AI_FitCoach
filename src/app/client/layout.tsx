import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/shared/Navbar'
import { ClientSidebar } from '@/components/shared/ClientSidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
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
  if (profile.role !== 'client') redirect('/coach')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar fullName={profile.full_name} role="client" />
      <div className="flex flex-1 overflow-hidden">
        <ClientSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-2xl mx-auto w-full">{children}</main>
      </div>
    </div>
  )
}
