import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HealthProfileForm } from './HealthProfileForm'
import { ProgressPhotos, type PhotoRecord } from './ProgressPhotos'

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

  // Progress photos
  let photos: PhotoRecord[] = []
  try {
    const { data: rows } = await supabase
      .from('progress_photos')
      .select('id, date, storage_path, weight_kg')
      .eq('client_id', user.id)
      .order('date', { ascending: false })

    if (rows?.length) {
      const paths = rows.map((r) => r.storage_path)
      const { data: signed } = await supabase.storage
        .from('progress-photos')
        .createSignedUrls(paths, 3600)

      photos = rows.map((r, i) => ({
        id:         r.id,
        date:       r.date,
        weight_kg:  r.weight_kg ?? null,
        signed_url: signed?.[i]?.signedUrl ?? '',
      }))
    }
  } catch {
    // progress_photos table or bucket not yet created
  }

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

      <ProgressPhotos clientId={user.id} photos={photos} />
    </div>
  )
}
