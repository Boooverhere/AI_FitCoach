export type Role = 'coach' | 'client'

export interface Profile {
  id: string
  full_name: string
  role: Role
  coach_id: string | null
  invite_code: string | null
  avatar_url: string | null
  created_at: string
}

export interface Habit {
  id: string
  coach_id: string
  label: string
  icon: string
  is_template: boolean
  created_at: string
}

export interface ClientHabit {
  id: string
  client_id: string
  habit_id: string
  streak: number
  created_at: string
  habit?: Habit
}

export interface Checkin {
  id: string
  client_id: string
  date: string
  note: string
  completed_habits: string[]
  submitted_at: string
}

export interface ClientRow {
  id: string
  full_name: string
  checkedInToday: boolean
  streak: number
  completionRate: number
}
