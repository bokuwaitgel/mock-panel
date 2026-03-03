export const DEFAULT_API_BASE_URL = 'http://localhost:8000'

export const STORAGE_KEYS = {
  apiBaseUrl: 'mock-admin-api-base-url',
  token: 'mock-admin-token',
}

export const ENDPOINTS = {
  login: '/auth/login',
  questions: '/questions',
  sessions: '/sessions',
  users: '/users',
}

export function buildUrl(baseUrl: string, path: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}

export function getRecordId(value: unknown): string {
  if (!value || typeof value !== 'object') {
    return ''
  }

  const objectValue = value as Record<string, unknown>
  const fromId = objectValue.id
  if (typeof fromId === 'number' || typeof fromId === 'string') {
    return String(fromId)
  }

  const fromUnderscoreId = objectValue._id
  if (typeof fromUnderscoreId === 'number' || typeof fromUnderscoreId === 'string') {
    return String(fromUnderscoreId)
  }

  return ''
}

export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>
    const candidateKeys = ['data', 'items', 'results']

    for (const key of candidateKeys) {
      const candidate = objectPayload[key]
      if (Array.isArray(candidate)) {
        return candidate as T[]
      }
    }
  }

  return []
}

export function parseApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback
  }

  const value = data as Record<string, unknown>
  const candidates = [value.message, value.error, value.detail]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate
    }
  }

  return fallback
}

export function toDateTimeLocal(value: string): string {
  if (!value) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return value
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

export function fromDateTimeLocal(value: string): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString()
}

export function readLocalStorage(key: string, fallback = ''): string {
  if (typeof window === 'undefined') {
    return fallback
  }

  return window.localStorage.getItem(key) ?? fallback
}

export async function apiRequest<T>(args: {
  baseUrl: string
  path: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: unknown
}): Promise<T> {
  const { baseUrl, path, method = 'GET', token, body } = args
  const response = await fetch(buildUrl(baseUrl, path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const raw = await response.text()
    let parsed: unknown = undefined

    try {
      parsed = raw ? JSON.parse(raw) : undefined
    } catch {
      parsed = undefined
    }

    const fallback = raw || `Request failed with status ${response.status}`
    throw new Error(parseApiError(parsed, fallback))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
