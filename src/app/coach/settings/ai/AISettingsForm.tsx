'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { CoachSettings, ParsedCredential } from '@/lib/coachSystemPrompt'
import {
  Award,
  Bot,
  CheckCircle2,
  ChevronDown,
  FileText,
  Heart,
  Loader2,
  Play,
  Trash2,
  Upload,
  User,
  AlertTriangle,
} from 'lucide-react'

// ─── Options ────────────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
  'Fat Loss & Weight Management',
  'Muscle Building & Hypertrophy',
  'Athletic Performance & Sports Conditioning',
  'Pre & Postnatal Fitness',
  'Senior Fitness & Mobility',
  'Yoga & Mind-Body Wellness',
  'Nutrition & Metabolic Health',
  'Injury Rehabilitation & Corrective Exercise',
  'CrossFit & Functional Training',
  'Marathon & Endurance Training',
  'Bodybuilding & Competition Prep',
  'Youth & Teen Fitness',
  'Other (describe below)',
]

const PHILOSOPHY_OPTIONS = [
  'Progressive overload with structured periodization',
  'Holistic approach combining fitness, nutrition and mindset',
  'Minimal equipment, maximum results',
  'Data-driven training based on biometrics',
  'Lifestyle-first, sustainable habit building',
  'High intensity, fast results focused',
  'Recovery and longevity focused',
  'Other (describe below)',
]

const COMMUNICATION_OPTIONS = [
  'Motivational',
  'Direct',
  'Clinical',
  'Empathetic',
  'Tough Love',
  'Calm & Educational',
]

const RED_FLAG_OPTIONS = [
  'Diabetic clients',
  'Hypertension',
  'History of eating disorders',
  'Post-surgery or injury',
  'Heart conditions',
  'Pregnancy',
  'Chronic fatigue or fibromyalgia',
]

const GOAL_PLACEHOLDERS: Record<string, string> = {
  fat_loss:
    'e.g. Focus on sustainable 0.5–1kg/week deficit, prioritise resistance training to preserve muscle, address stress and sleep if present.',
  muscle_gain:
    'e.g. Progressive overload is non-negotiable. Ensure adequate protein (≥1.6g/kg). Track lifts weekly.',
  endurance:
    'e.g. Build aerobic base before intensity. Zone 2 is the backbone. Watch for overtraining — recovery weeks matter.',
  general_health:
    'e.g. Consistency over intensity. Build movement habits first. Celebrate non-scale victories.',
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadingFile {
  id: string
  name: string
  status: 'uploading' | 'parsing' | 'done' | 'error'
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip data URL prefix
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Section wrappers ────────────────────────────────────────────────────────

function Section({
  icon,
  color,
  title,
  children,
}: {
  icon: React.ReactNode
  color: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-[var(--bg-surface)] border border-[var(--border-8)] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-8)]">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--fg-70)]">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--fg)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all"
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg-40)]" />
      </div>
    </div>
  )
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  placeholder?: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--fg-70)]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
          focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all resize-none"
      />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AISettingsForm({
  coachId,
  coachName,
  initialSettings,
  initialCredentials,
  initialCertFiles,
  updatedAt,
}: {
  coachId: string
  coachName: string
  initialSettings: CoachSettings | null
  initialCredentials: ParsedCredential[]
  initialCertFiles: string[]
  updatedAt: string | null
}) {
  // Section 1 state
  const [settings, setSettings] = useState<CoachSettings>({
    specialty: '',
    specialtyOther: '',
    philosophy: '',
    philosophyOther: '',
    communicationStyle: '',
    redFlags: [],
    redFlagsOther: '',
    goalNotes: { fat_loss: '', muscle_gain: '', endurance: '', general_health: '' },
    ...initialSettings,
  })

  // Section 2 state
  const [credentials, setCredentials] = useState<ParsedCredential[]>(initialCredentials)
  const [certFiles, setCertFiles] = useState<string[]>(initialCertFiles)
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Section 3 state
  const [previewText, setPreviewText] = useState('')
  const [previewing, setPreviewing] = useState(false)

  // Save state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Helpers ──────────────────────────────────────────────────────────────

  function set<K extends keyof CoachSettings>(key: K, value: CoachSettings[K]) {
    setSaved(false)
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function toggleRedFlag(flag: string) {
    setSaved(false)
    setSettings((prev) => {
      const flags = prev.redFlags ?? []
      return {
        ...prev,
        redFlags: flags.includes(flag) ? flags.filter((f) => f !== flag) : [...flags, flag],
      }
    })
  }

  function setGoalNote(goal: string, value: string) {
    setSaved(false)
    setSettings((prev) => ({
      ...prev,
      goalNotes: { ...(prev.goalNotes ?? {}), [goal]: value },
    }))
  }

  // ── Certificate upload ────────────────────────────────────────────────────

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const supabase = createClient()

    for (const file of Array.from(files)) {
      const id = Math.random().toString(36).slice(2)
      setUploading((prev) => [...prev, { id, name: file.name, status: 'uploading' }])

      try {
        // Upload to Supabase storage
        const path = `${coachId}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('certificates')
          .upload(path, file)

        if (uploadError) throw new Error(uploadError.message)

        setCertFiles((prev) => [...prev, path])

        // Update status to parsing
        setUploading((prev) => prev.map((u) => u.id === id ? { ...u, status: 'parsing' } : u))

        // Convert to base64 and call parse API
        const base64 = await fileToBase64(file)
        const mediaType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')

        const res = await fetch('/api/ai-settings/parse-cert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64, mediaType, fileName: file.name }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Parse failed')
        }

        const parsed: ParsedCredential = await res.json()
        parsed.storagePath = path

        setCredentials((prev) => [...prev, parsed])
        setUploading((prev) => prev.map((u) => u.id === id ? { ...u, status: 'done' } : u))

        // Remove from uploading list after brief delay
        setTimeout(() => setUploading((prev) => prev.filter((u) => u.id !== id)), 2000)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setUploading((prev) => prev.map((u) => u.id === id ? { ...u, status: 'error', error: msg } : u))
      }
    }
  }

  async function removeCertificate(index: number) {
    const cred = credentials[index]
    if (cred.storagePath) {
      const supabase = createClient()
      await supabase.storage.from('certificates').remove([cred.storagePath])
      setCertFiles((prev) => prev.filter((p) => p !== cred.storagePath))
    }
    setCredentials((prev) => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  // ── Preview ───────────────────────────────────────────────────────────────

  async function handlePreview() {
    setPreviewing(true)
    setPreviewText('')

    try {
      const res = await fetch('/api/ai-settings/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, credentials }),
      })

      if (!res.ok) {
        const err = await res.json()
        setPreviewText(`Error: ${err.error}`)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) return
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setPreviewText((prev) => prev + decoder.decode(value))
      }
    } finally {
      setPreviewing(false)
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    setSaved(false)

    const supabase = createClient()
    const { error } = await supabase.from('coach_ai_settings').upsert(
      {
        coach_id: coachId,
        settings,
        credentials,
        cert_files: certFiles,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'coach_id' }
    )

    if (error) {
      setSaveError(error.message)
    } else {
      setSaved(true)
    }
    setSaving(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5">

      {/* ── Section 1: Coaching Identity ─────────────────────────────── */}
      <Section
        icon={<User className="h-4 w-4 text-blue-400" />}
        color="bg-blue-500/15"
        title="Coaching Identity"
      >
        <div className="flex flex-col gap-5">
          {/* Specialty */}
          <div className="flex flex-col gap-3">
            <SelectField
              label="Specialty"
              value={settings.specialty ?? ''}
              options={SPECIALTY_OPTIONS}
              onChange={(v) => set('specialty', v)}
            />
            {settings.specialty === 'Other (describe below)' && (
              <input
                type="text"
                placeholder="Describe your specialty…"
                value={settings.specialtyOther ?? ''}
                onChange={(e) => set('specialtyOther', e.target.value)}
                className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all"
              />
            )}
          </div>

          {/* Philosophy */}
          <div className="flex flex-col gap-3">
            <SelectField
              label="Coaching Philosophy"
              value={settings.philosophy ?? ''}
              options={PHILOSOPHY_OPTIONS}
              onChange={(v) => set('philosophy', v)}
            />
            {settings.philosophy === 'Other (describe below)' && (
              <input
                type="text"
                placeholder="Describe your coaching philosophy…"
                value={settings.philosophyOther ?? ''}
                onChange={(e) => set('philosophyOther', e.target.value)}
                className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all"
              />
            )}
          </div>

          {/* Communication style */}
          <SelectField
            label="Communication Style"
            value={settings.communicationStyle ?? ''}
            options={COMMUNICATION_OPTIONS}
            onChange={(v) => set('communicationStyle', v)}
          />

          {/* Red flags */}
          <div>
            <label className="text-sm font-medium text-[var(--fg-70)] block mb-2.5">
              Red Flags — Always Prioritise
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {RED_FLAG_OPTIONS.map((flag) => {
                const checked = settings.redFlags?.includes(flag) ?? false
                return (
                  <label
                    key={flag}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'border-yellow-500/40 bg-yellow-500/8'
                        : 'border-[var(--border-8)] bg-[var(--bg-elevated)] hover:border-[var(--border)]'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                        checked
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'border-[var(--border)] bg-[var(--bg-input)]'
                      }`}
                      onClick={() => toggleRedFlag(flag)}
                    >
                      {checked && (
                        <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-black">
                          <path d="M1 4l3 3 5-6" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-sm ${checked ? 'text-yellow-400' : 'text-[var(--fg-70)]'}`}
                      onClick={() => toggleRedFlag(flag)}
                    >
                      {flag}
                    </span>
                  </label>
                )
              })}
            </div>
            <input
              type="text"
              placeholder="Any other conditions to flag…"
              value={settings.redFlagsOther ?? ''}
              onChange={(e) => set('redFlagsOther', e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--fg-30)]
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)] focus:border-[var(--accent-border)] transition-all"
            />
          </div>

          {/* Goal-specific notes */}
          <div>
            <label className="text-sm font-medium text-[var(--fg-70)] block mb-3">
              Goal-Specific Coaching Notes
            </label>
            <div className="flex flex-col gap-3">
              {Object.entries(GOAL_PLACEHOLDERS).map(([goal, placeholder]) => (
                <TextAreaField
                  key={goal}
                  label={goal.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  value={settings.goalNotes?.[goal as keyof typeof settings.goalNotes] ?? ''}
                  placeholder={placeholder}
                  onChange={(v) => setGoalNote(goal, v)}
                  rows={2}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Certificates & Credentials ────────────────────── */}
      <Section
        icon={<Award className="h-4 w-4 text-amber-400" />}
        color="bg-amber-500/15"
        title="Certificates & Credentials"
      >
        <div className="flex flex-col gap-4">
          {/* Upload area */}
          <div
            className="border-2 border-dashed border-[var(--border-8)] rounded-xl p-8 text-center hover:border-[var(--accent-border-sub)] transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
          >
            <Upload className="h-8 w-8 text-[var(--fg-30)] group-hover:text-[var(--accent-fg)] transition-colors mx-auto mb-2" />
            <p className="text-sm font-medium text-[var(--fg-60)] group-hover:text-[var(--fg)] transition-colors">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-[var(--fg-30)] mt-1">PDF, JPG, PNG accepted</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* In-progress uploads */}
          {uploading.length > 0 && (
            <div className="flex flex-col gap-2">
              {uploading.map((u) => (
                <div
                  key={u.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
                    u.status === 'error'
                      ? 'border-red-500/30 bg-red-500/8'
                      : 'border-[var(--border-8)] bg-[var(--bg-elevated)]'
                  }`}
                >
                  {u.status === 'done' ? (
                    <CheckCircle2 className="h-4 w-4 text-[var(--accent-fg)] flex-shrink-0" />
                  ) : u.status === 'error' ? (
                    <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-[var(--accent-fg)] animate-spin flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate text-[var(--fg-70)]">{u.name}</span>
                  <span className="text-[var(--fg-40)] text-xs">
                    {u.status === 'uploading'
                      ? 'Uploading…'
                      : u.status === 'parsing'
                      ? 'Parsing with AI…'
                      : u.status === 'done'
                      ? 'Done'
                      : u.error ?? 'Error'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Parsed credential cards */}
          {credentials.length > 0 && (
            <div className="flex flex-col gap-3">
              {credentials.map((cred, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-[var(--bg-elevated)] border border-[var(--border-8)] rounded-xl px-4 py-3"
                >
                  <FileText className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      📜 {cred.certName ?? cred.fileName}
                    </p>
                    {cred.issuingBody && (
                      <p className="text-xs text-[var(--fg-50)] mt-0.5">
                        Issued by: {cred.issuingBody}
                      </p>
                    )}
                    {cred.focus && (
                      <p className="text-xs text-[var(--fg-50)]">
                        Focus: {cred.focus}
                      </p>
                    )}
                    {cred.expiry && (
                      <p className="text-xs text-[var(--fg-40)]">
                        Expires: {cred.expiry}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-tint)] text-[var(--accent-fg)] font-medium">
                      Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCertificate(i)}
                      className="p-1 rounded-lg hover:bg-red-500/15 text-[var(--fg-30)] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {credentials.length === 0 && uploading.length === 0 && (
            <p className="text-sm text-[var(--fg-30)] text-center">
              No certificates uploaded yet. Upload PDFs or images of your certifications.
            </p>
          )}
        </div>
      </Section>

      {/* ── Section 3: AI Behavior Preview ───────────────────────────── */}
      <Section
        icon={<Bot className="h-4 w-4 text-[var(--accent-fg)]" />}
        color="bg-[var(--accent-tint)]"
        title="AI Behavior Preview"
      >
        <div className="flex flex-col gap-4">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-8)] rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-[var(--fg-40)] uppercase tracking-wider mb-2">
              Sample Scenario
            </p>
            <p className="text-sm text-[var(--fg-60)]">
              Client Sarah, 34y, fat loss goal, BMI 28.4, borderline hypertension. Completed 4/7 walks, skipped meal logging. Notes stress at work.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handlePreview}
            loading={previewing}
            disabled={previewing}
            className="w-fit"
          >
            <Play className="h-4 w-4" />
            {previewing ? 'Generating preview…' : 'Preview AI response'}
          </Button>

          {previewText && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--accent-border-sub)] rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4 text-[var(--accent-fg)]" />
                <span className="text-xs font-semibold text-[var(--accent-fg)] uppercase tracking-wider">
                  AI Response Preview — as {coachName}&apos;s assistant
                </span>
              </div>
              <p className="text-sm text-[var(--fg-70)] whitespace-pre-wrap leading-relaxed">
                {previewText}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* ── Save footer ───────────────────────────────────────────────── */}
      {saveError && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {saveError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        {updatedAt ? (
          <p className="text-xs text-[var(--fg-40)]">
            Last saved{' '}
            {new Date(updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        ) : (
          <p className="text-xs text-[var(--fg-40)]">Not saved yet</p>
        )}
        <Button onClick={handleSave} loading={saving} size="lg">
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save AI Settings'
          )}
        </Button>
      </div>
    </div>
  )
}
