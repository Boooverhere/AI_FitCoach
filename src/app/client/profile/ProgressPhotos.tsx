'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, Upload, X, Scale, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export interface PhotoRecord {
  id: string
  date: string
  weight_kg: number | null
  signed_url: string
}

interface Props {
  clientId: string
  photos: PhotoRecord[]
}

function fmtDateLong(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}
function fmtDateShort(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ProgressPhotos({ clientId, photos }: Props) {
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null)
  const [file, setFile]               = useState<File | null>(null)
  const [weight, setWeight]           = useState('')
  const [uploading, setUploading]     = useState(false)
  const [error, setError]             = useState('')
  const [lightbox, setLightbox]       = useState<PhotoRecord | null>(null)
  const inputRef                      = useRef<HTMLInputElement>(null)
  const router                        = useRouter()

  function pickFile() {
    setError('')
    inputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png'].includes(f.type)) {
      setError('Only JPG and PNG files are accepted.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.')
      return
    }
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  function cancelUpload() {
    setPreviewUrl(null)
    setFile(null)
    setWeight('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')

    const supabase  = createClient()
    const today     = new Date().toISOString().slice(0, 10)
    const ext       = file.type === 'image/png' ? 'png' : 'jpg'
    const path      = `${clientId}/${today}/${Date.now()}.${ext}`

    const { error: storageErr } = await supabase.storage
      .from('progress-photos')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (storageErr) {
      setError(storageErr.message)
      setUploading(false)
      return
    }

    const { error: dbErr } = await supabase.from('progress_photos').insert({
      client_id:   clientId,
      date:        today,
      storage_path: path,
      weight_kg:   weight ? parseFloat(weight) : null,
    })

    if (dbErr) {
      await supabase.storage.from('progress-photos').remove([path])
      setError(dbErr.message)
      setUploading(false)
      return
    }

    cancelUpload()
    setUploading(false)
    router.refresh()
  }

  return (
    <>
      {/* ── Main card ─────────────────────────────── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-8)]">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-[var(--fg-40)]" />
            <h2 className="font-semibold">Progress Photos</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-[var(--fg-30)]">
              <Lock className="h-3 w-3" />
              <span>Private</span>
            </div>
            <button
              onClick={pickFile}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                bg-[var(--accent-tint)] text-[var(--accent-fg)] hover:bg-[var(--accent-wash)] transition-colors"
            >
              <Upload className="h-3.5 w-3.5" /> Upload
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Empty state */}
        {photos.length === 0 && (
          <div className="p-12 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-[var(--bg-hover)] flex items-center justify-center">
              <Camera className="h-6 w-6 text-[var(--fg-30)]" />
            </div>
            <p className="font-medium">No progress photos yet</p>
            <p className="text-sm text-[var(--fg-40)] max-w-xs">
              Upload your first photo to start tracking your transformation. Only you and your coach can see these.
            </p>
            <button
              onClick={pickFile}
              className="mt-2 text-sm font-medium text-[var(--accent-fg)] hover:underline"
            >
              Upload your first photo →
            </button>
          </div>
        )}

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setLightbox(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[var(--bg-hover)]
                  hover:ring-2 hover:ring-[var(--accent)] transition-all cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.signed_url}
                  alt={`Progress ${photo.date}`}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2">
                  <p className="text-white text-[11px] font-medium leading-none">{fmtDateShort(photo.date)}</p>
                  {photo.weight_kg != null && (
                    <p className="text-white/70 text-[10px] mt-0.5">{photo.weight_kg} kg</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Upload modal ──────────────────────────── */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelUpload} />
          <div className="relative z-10 w-full sm:max-w-sm bg-[var(--bg-surface)] sm:rounded-2xl rounded-t-2xl border border-[var(--border-8)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-8)]">
              <h3 className="font-bold">Add Progress Photo</h3>
              <button
                onClick={cancelUpload}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--fg-40)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Preview */}
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-hover)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>

              {/* Date (auto, shown for info) */}
              <div className="flex items-center gap-2 text-xs text-[var(--fg-40)] bg-[var(--bg-hover)] rounded-lg px-3 py-2">
                <Camera className="h-3.5 w-3.5" />
                Tagged with today's date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Weight input */}
              <div>
                <label className="text-xs font-semibold text-[var(--fg-50)] uppercase tracking-wider block mb-1.5">
                  Current weight <span className="text-[var(--fg-30)] normal-case font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-2 bg-[var(--bg-input)] border border-[var(--border-8)] rounded-xl px-3 py-2.5 focus-within:border-[var(--accent)] transition-colors">
                  <Scale className="h-4 w-4 text-[var(--fg-30)] shrink-0" />
                  <input
                    type="number"
                    step={0.1}
                    min={20}
                    max={400}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70.5"
                    className="flex-1 bg-transparent text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)] focus:outline-none"
                  />
                  <span className="text-xs text-[var(--fg-40)] shrink-0">kg</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={cancelUpload}>Cancel</Button>
                <Button loading={uploading} className="flex-1" onClick={handleUpload}>Save photo</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.signed_url}
              alt={`Progress ${lightbox.date}`}
              className="w-full rounded-2xl object-contain max-h-[78dvh]"
            />
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{fmtDateLong(lightbox.date)}</p>
              {lightbox.weight_kg != null && (
                <p className="text-white/60 text-sm mt-1">{lightbox.weight_kg} kg</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
