/**
 * Shared types – aligned with Python backend Pydantic schemas + enums.
 */

// ── Module & Section types ───────────────────
export const MODULE_TYPES = ['academic', 'general'] as const
export type ModuleType = (typeof MODULE_TYPES)[number]
export const SOURCE_TYPES = ['book', 'journal', 'magazine', 'newspaper', 'other'] as const
export type SourceType = (typeof SOURCE_TYPES)[number]

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
  accepted_answers?: unknown[]
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
  part_title?: string
  description?: string
  audio_url: string
  question_number_from?: number
  question_number_to?: number
  is_shared_across_modules?: boolean
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
  source_type?: SourceType
  module_type_override?: ModuleType
  image_url?: string
  question_number_from?: number
  question_number_to?: number
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
  module_type_override?: ModuleType
  min_words: number
  time_limit_minutes: number
  weight?: number
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
  module_structure?: {
    listening_shared: boolean
    speaking_shared: boolean
    reading_varies_by_module: boolean
    writing_varies_by_module: boolean
  }
  structure_policy?: {
    strict_ielts_format: boolean
    enforce_global_40_questions: boolean
    enforce_module_specific_rw: boolean
    expected_counts?: Record<string, number>
  }
  scoring_policy?: {
    scale_max_band: number
    allow_half_bands: boolean
    overall_rounding_step: number
    band_descriptors?: Record<string, string>
  }
  duration_policy?: {
    total_duration_minutes: number
    section_time_limits_minutes: Record<string, number>
  }
  form_metadata?: {
    form_code?: string
    version?: string
    source?: string
    tags?: string[]
  }
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
