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

  // Unread notification count (graceful if table doesn't exist yet)
  let unreadCount = 0
  try {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', user.id)
      .eq('read', false)
    unreadCount = count ?? 0
  } catch {
    // notifications table not yet created — silently skip
  }

  // Unread message count
  let unreadMessages = 0
  try {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('coach_id', user.id)
      .neq('sender_id', user.id)
      .eq('read', false)
    unreadMessages = count ?? 0
  } catch {
    // messages table not yet created — silently skip
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar fullName={profile.full_name} role="coach" />
      <div className="flex flex-1 overflow-hidden">
        <CoachSidebar unreadNotifications={unreadCount} unreadMessages={unreadMessages} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32 md:pb-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
      <BottomNav role="coach" unreadNotifications={unreadCount} unreadMessages={unreadMessages} />
    </div>
  )
}
