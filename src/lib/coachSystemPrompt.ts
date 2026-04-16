export interface CoachSettings {
  specialty?: string
  specialtyOther?: string
  philosophy?: string
  philosophyOther?: string
  communicationStyle?: string
  redFlags?: string[]
  redFlagsOther?: string
  goalNotes?: {
    fat_loss?: string
    muscle_gain?: string
    endurance?: string
    general_health?: string
  }
}

export interface ParsedCredential {
  fileName: string
  certName: string | null
  issuingBody: string | null
  focus: string | null
  expiry: string | null
  storagePath?: string
}

export function buildCoachSystemPrompt(
  coachName: string,
  settings: CoachSettings | null,
  credentials: ParsedCredential[]
): string {
  const specialty =
    settings?.specialty === 'Other (describe below)'
      ? settings.specialtyOther
      : settings?.specialty

  const philosophy =
    settings?.philosophy === 'Other (describe below)'
      ? settings.philosophyOther
      : settings?.philosophy

  const style = settings?.communicationStyle

  const verifiedCreds = credentials.filter((c) => c.certName)
  const credLines = verifiedCreds.length
    ? verifiedCreds
        .map((c) => {
          const parts = [`${c.certName}`]
          if (c.issuingBody) parts.push(`issued by ${c.issuingBody}`)
          if (c.focus) parts.push(`focus: ${c.focus}`)
          if (c.expiry) parts.push(`expires: ${c.expiry}`)
          return `• ${parts.join(', ')}`
        })
        .join('\n')
    : null

  const redFlagList = [
    ...(settings?.redFlags ?? []),
    ...(settings?.redFlagsOther ? [settings.redFlagsOther] : []),
  ]

  const goalNotesLines = Object.entries(settings?.goalNotes ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k.replace('_', ' ')} clients: ${v}`)
    .join('\n')

  const lines: string[] = [
    `You are an AI assistant for ${coachName}, a certified fitness coach.`,
  ]

  if (credLines) {
    lines.push(`\nVerified credentials:\n${credLines}`)
  }

  if (specialty) {
    lines.push(`\nSpecialty: ${specialty}`)
  }

  if (philosophy) {
    lines.push(`Coaching philosophy: ${philosophy}`)
  }

  if (style) {
    lines.push(`Communication style: ${style}`)
  }

  if (redFlagList.length) {
    lines.push(
      `\nAlways flag and prioritise the following client conditions:\n${redFlagList.map((f) => `• ${f}`).join('\n')}`
    )
  }

  if (goalNotesLines) {
    lines.push(`\nGoal-specific coaching notes:\n${goalNotesLines}`)
  }

  lines.push(
    '\nAlways respond in alignment with the coach\'s specialty, philosophy, and communication style. Be specific, actionable, and personalised.'
  )

  return lines.join('\n')
}
