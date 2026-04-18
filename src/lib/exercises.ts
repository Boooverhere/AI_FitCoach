export interface ExerciseRef {
  name: string
  category: 'Strength' | 'Cardio' | 'HIIT' | 'Mobility'
}

export const EXERCISE_LIBRARY: ExerciseRef[] = [
  // Strength
  { name: 'Bench Press',          category: 'Strength' },
  { name: 'Incline Bench Press',  category: 'Strength' },
  { name: 'Squat',                category: 'Strength' },
  { name: 'Front Squat',          category: 'Strength' },
  { name: 'Deadlift',             category: 'Strength' },
  { name: 'Romanian Deadlift',    category: 'Strength' },
  { name: 'Overhead Press',       category: 'Strength' },
  { name: 'Barbell Row',          category: 'Strength' },
  { name: 'Cable Row',            category: 'Strength' },
  { name: 'Pull Up',              category: 'Strength' },
  { name: 'Chin Up',              category: 'Strength' },
  { name: 'Lat Pulldown',         category: 'Strength' },
  { name: 'Dip',                  category: 'Strength' },
  { name: 'Lunge',                category: 'Strength' },
  { name: 'Bulgarian Split Squat',category: 'Strength' },
  { name: 'Hip Thrust',           category: 'Strength' },
  { name: 'Leg Press',            category: 'Strength' },
  { name: 'Leg Curl',             category: 'Strength' },
  { name: 'Leg Extension',        category: 'Strength' },
  { name: 'Calf Raise',           category: 'Strength' },
  { name: 'Dumbbell Curl',        category: 'Strength' },
  { name: 'Tricep Pushdown',      category: 'Strength' },
  { name: 'Skull Crusher',        category: 'Strength' },
  { name: 'Face Pull',            category: 'Strength' },
  { name: 'Lateral Raise',        category: 'Strength' },
  { name: 'Plank',                category: 'Strength' },
  { name: 'Ab Wheel Rollout',     category: 'Strength' },
  // Cardio
  { name: 'Running',              category: 'Cardio' },
  { name: 'Cycling',              category: 'Cardio' },
  { name: 'Rowing Machine',       category: 'Cardio' },
  { name: 'Jump Rope',            category: 'Cardio' },
  { name: 'Stair Climber',        category: 'Cardio' },
  { name: 'Swimming',             category: 'Cardio' },
  { name: 'Elliptical',           category: 'Cardio' },
  { name: 'Battle Ropes',         category: 'Cardio' },
  // HIIT
  { name: 'Burpee',               category: 'HIIT' },
  { name: 'Box Jump',             category: 'HIIT' },
  { name: 'Kettlebell Swing',     category: 'HIIT' },
  { name: 'Mountain Climber',     category: 'HIIT' },
  { name: 'Sprint',               category: 'HIIT' },
  { name: 'Jumping Jack',         category: 'HIIT' },
  { name: 'High Knees',           category: 'HIIT' },
  { name: 'Plyo Lunge',           category: 'HIIT' },
  { name: 'Tuck Jump',            category: 'HIIT' },
  // Mobility
  { name: 'Hip Flexor Stretch',   category: 'Mobility' },
  { name: 'Thoracic Rotation',    category: 'Mobility' },
  { name: 'Cat-Cow',              category: 'Mobility' },
  { name: 'Pigeon Pose',          category: 'Mobility' },
  { name: "World's Greatest Stretch", category: 'Mobility' },
  { name: 'Shoulder Pass-Through',category: 'Mobility' },
  { name: 'Ankle Circles',        category: 'Mobility' },
  { name: 'Foam Roll Quads',      category: 'Mobility' },
  { name: 'Foam Roll IT Band',    category: 'Mobility' },
  { name: "Child's Pose",         category: 'Mobility' },
  { name: 'Downward Dog',         category: 'Mobility' },
  { name: 'Couch Stretch',        category: 'Mobility' },
  { name: 'Deep Squat Hold',      category: 'Mobility' },
  { name: 'Neck Rolls',           category: 'Mobility' },
  { name: 'Wrist Circles',        category: 'Mobility' },
]

export const EXERCISE_NAMES = EXERCISE_LIBRARY.map((e) => e.name)

export const DAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const WORKOUT_TYPES = ['Rest', 'Strength', 'Cardio', 'HIIT', 'Mobility'] as const
export type WorkoutType = typeof WORKOUT_TYPES[number]

export interface ExerciseEntry {
  name: string
  sets: number
  reps: string           // "10" or "8-12"
  weight_guidance: string // "70% 1RM", "bodyweight", "RPE 7", "20 kg"
  rest_seconds: number
  coaching_note: string
}

export function blankExercise(): ExerciseEntry {
  return { name: '', sets: 3, reps: '10', weight_guidance: '', rest_seconds: 60, coaching_note: '' }
}

export interface DayState {
  workout_type: WorkoutType
  exercises: ExerciseEntry[]
}

export function blankDay(): DayState {
  return { workout_type: 'Rest', exercises: [] }
}
