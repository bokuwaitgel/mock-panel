/**
 * API helpers – endpoints, fetch wrapper, utilities.
 * Paths are relative to the API base URL.
 */

export const DEFAULT_API_BASE_URL = 'http://localhost:8000/api'

export const STORAGE_KEYS = {
  apiBaseUrl: 'mock-admin-api-base-url',
  token: 'mock-admin-token',
} as const

export const ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  users: '/auth/users',

  // IELTS Questions (admin)
  questionCreate: '/ielts/admin/questions',
  questionsList: '/ielts/admin/questions/list',
  questionGet: '/ielts/admin/questions/get',
  questionUpdate: '/ielts/admin/questions/update',
  questionDelete: '/ielts/admin/questions/delete',

  // IELTS Listening Sections (admin)
  listeningSectionCreate: '/ielts/admin/listening-sections',
  listeningSectionsList: '/ielts/admin/listening-sections/list',
  listeningSectionGet: '/ielts/admin/listening-sections/get',
  listeningSectionUpdate: '/ielts/admin/listening-sections/update',
  listeningSectionDelete: '/ielts/admin/listening-sections/delete',
  listeningSectionUploadAudio: '/ielts/admin/listening-sections/upload-audio',

  // IELTS Reading Passages (admin)
  readingPassageCreate: '/ielts/admin/reading-passages',
  readingPassagesList: '/ielts/admin/reading-passages/list',
  readingPassageGet: '/ielts/admin/reading-passages/get',
  readingPassageUpdate: '/ielts/admin/reading-passages/update',
  readingPassageDelete: '/ielts/admin/reading-passages/delete',
  readingPassageUploadImage: '/ielts/admin/reading-passages/upload-image',

  // IELTS Writing Tasks (admin)
  writingTaskCreate: '/ielts/admin/writing-tasks',
  writingTasksList: '/ielts/admin/writing-tasks/list',
  writingTaskUploadImage: '/ielts/admin/writing-tasks/upload-image',

  // IELTS Speaking Parts (admin)
  speakingPartCreate: '/ielts/admin/speaking-parts',
  speakingPartsList: '/ielts/admin/speaking-parts/list',
  speakingPartUploadAudio: '/ielts/admin/speaking-parts/upload-audio',

  // IELTS Tests
  testCreate: '/ielts/admin/tests',
  testsList: '/ielts/tests/list',
  testGet: '/ielts/tests/get',
  testUpdate: '/ielts/admin/tests/update',
  testDelete: '/ielts/admin/tests/delete',

  // Sessions (current user only)
  sessionsList: '/ielts/sessions/list',
} as const

// ── URL builder ──────────────────────────────

export function buildUrl(
  base: string,
  path: string,
  params?: Record<string, string | number | undefined>,
): string {
  const cleanBase = base.replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  let url = `${cleanBase}${cleanPath}`

  if (params) {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) sp.set(k, String(v))
    }
    const qs = sp.toString()
    if (qs) url += `?${qs}`
  }
  return url
}

// ── Record helpers ───────────────────────────

export function getRecordId(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const o = value as Record<string, unknown>
  for (const key of ['id', '_id', 'question_id', 'session_id']) {
    const v = o[key]
    if (typeof v === 'string' || typeof v === 'number') return String(v)
  }
  return ''
}

export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>
    for (const key of [
      'data',
      'items',
      'results',
      'questions',
      'sessions',
      'users',
      'tests',
    ]) {
      const c = obj[key]
      if (Array.isArray(c)) return c as T[]
    }
  }
  return []
}

// ── Error parsing ────────────────────────────

export function parseApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback
  const v = data as Record<string, unknown>
  for (const key of ['message', 'error', 'detail']) {
    const c = v[key]
    if (typeof c === 'string' && c.trim()) return c
    if (Array.isArray(c) && c.length > 0) {
      const first = c[0]
      if (typeof first === 'object' && first !== null && 'msg' in first) {
        return String((first as Record<string, unknown>).msg)
      }
    }
  }
  return fallback
}

// ── Date helpers ─────────────────────────────

export function toDateTimeLocal(value: string | undefined | null): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

export function formatDate(value: string | undefined | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── LocalStorage ─────────────────────────────

export function readLocalStorage(key: string, fallback = ''): string {
  if (typeof window === 'undefined') return fallback
  return window.localStorage.getItem(key) ?? fallback
}

// ── File-to-base64 ───────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // strip "data:...;base64," prefix
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Fetch wrapper ────────────────────────────

export async function apiRequest<T>(args: {
  baseUrl: string
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: unknown
  params?: Record<string, string | number | undefined>
}): Promise<T> {
  const { baseUrl, path, method = 'GET', token, body, params } = args
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(buildUrl(baseUrl, path, params), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const raw = await response.text()
    let parsed: unknown
    try {
      parsed = raw ? JSON.parse(raw) : undefined
    } catch {
      parsed = undefined
    }
    throw new Error(
      parseApiError(parsed, raw || `Request failed (${response.status})`),
    )
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
