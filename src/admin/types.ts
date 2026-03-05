/**
 * Shared types – aligned with Python backend Pydantic schemas + enums.
 */

// ── Module & Section types ───────────────────
export const MODULE_TYPES = ['academic', 'general'] as const
export type ModuleType = (typeof MODULE_TYPES)[number]

// ── IELTS Question Types (listening & reading bank) ──────
export const QUESTION_TYPES = [
  'multiple_choice',
  'true_false_not_given',
  'yes_no_not_given',
  'short_answer',
  'sentence_completion',
  'summary_completion',
  'note_completion',
  'table_completion',
  'form_completion',
  'flowchart_completion',
  'diagram_label_completion',
  'matching',
  'matching_information',
  'matching_headings',
  'matching_features',
  'matching_sentence_endings',
  'plan_map_diagram',
] as const

export type OptionItem = { key: string; text: string }

/** Mirrors schemas.ielts.QuestionResponse + raw DB fields */
export type Question = {
  id?: string
  _id?: string
  question_number: number
  question_type: string
  instructions?: string
  question_text: string
  options?: OptionItem[]
  correct_answer?: unknown
  max_words?: number
  audio_url?: string
  image_url?: string
  points: number
  section?: string
  created_at?: string
  created_by?: string
}

// ── Listening Section ────────────────────────
export type ListeningSection = {
  id?: string
  _id?: string
  part_number: number
  description?: string
  audio_url: string
  question_ids?: string[]
  questions?: Question[]
  created_at?: string
  created_by?: string
}

// ── Reading Passage ──────────────────────────
export type ReadingPassage = {
  id?: string
  _id?: string
  passage_number: number
  title: string
  body: string
  source?: string
  image_url?: string
  question_ids?: string[]
  questions?: Question[]
  created_at?: string
  created_by?: string
}

// ── Writing Task ─────────────────────────────
export const WRITING_QUESTION_TYPES = [
  'task1_academic',
  'task1_general',
  'task2',
] as const

export type WritingTask = {
  id?: string
  _id?: string
  task_number: number
  question_type: string
  prompt: string
  image_url?: string
  min_words: number
  time_limit_minutes: number
  created_at?: string
  created_by?: string
}

// ── Speaking Part ────────────────────────────
export const SPEAKING_QUESTION_TYPES = [
  'part1_intro',
  'part2_cue_card',
  'part3_discussion',
] as const

export type SpeakingPart = {
  id?: string
  _id?: string
  part_number: number
  question_type: string
  topic: string
  prompt: string
  audio_url?: string
  follow_up_questions?: string[]
  time_limit_seconds: number
  created_at?: string
  created_by?: string
}

// ── Test (full exam) ─────────────────────────
export type Test = {
  id?: string
  _id?: string
  test_type: string
  title: string
  module_type: string
  description?: string
  listening_section_ids: string[]
  reading_passage_ids: string[]
  writing_task_ids: string[]
  speaking_part_ids: string[]
  created_at?: string
  created_by?: string
}

/** Mirrors schemas.ielts.TestSessionResponse */
export type Session = {
  id?: string
  _id?: string
  test_id: string
  user_id: string
  test_type: string
  status: string
  module_type?: string
  started_at?: string
  submitted_at?: string
}

/** Mirrors schemas.auth.UserResponse */
export type User = {
  id?: string
  _id?: string
  username: string
  email: string
  role: 'candidate' | 'examiner' | 'admin'
  is_active: boolean
  created_at?: string
}
