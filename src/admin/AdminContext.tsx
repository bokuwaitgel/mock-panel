import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  apiRequest,
  DEFAULT_API_BASE_URL,
  ENDPOINTS,
  fileToBase64,
  getRecordId,
  normalizeList,
  readLocalStorage,
  STORAGE_KEYS,
  toDateTimeLocal,
  formatDate,
} from './api'
import type {
  Question,
  ListeningSection,
  ReadingPassage,
  WritingTask,
  SpeakingPart,
  Test,
  Session,
  User,
} from './types'

// ── Blank form defaults ──────────────────────

const BLANK_QUESTION: Question = {
  question_number: 1,
  question_type: 'multiple_choice',
  question_text: '',
  points: 1.0,
}

const BLANK_LISTENING: ListeningSection = {
  part_number: 1,
  audio_url: '',
}

const BLANK_PASSAGE: ReadingPassage = {
  passage_number: 1,
  title: '',
  body: '',
}

const BLANK_WRITING_TASK: WritingTask = {
  task_number: 1,
  question_type: 'task1_academic',
  prompt: '',
  min_words: 150,
  time_limit_minutes: 20,
}

const BLANK_SPEAKING_PART: SpeakingPart = {
  part_number: 1,
  question_type: 'part1_intro',
  topic: '',
  prompt: '',
  time_limit_seconds: 300,
}

const BLANK_TEST: Omit<Test, 'test_type'> = {
  title: '',
  module_type: 'academic',
  description: '',
  listening_section_ids: [],
  reading_passage_ids: [],
  writing_task_ids: [],
  speaking_part_ids: [],
}

const BLANK_USER_FORM = {
  username: '',
  email: '',
  password: '',
  role: 'candidate' as const,
}

type UserFormShape = typeof BLANK_USER_FORM

// ── Context type ─────────────────────────────

type AdminContextValue = {
  apiBaseUrl: string
  setApiBaseUrl: (v: string) => void
  token: string
  setToken: (v: string) => void
  hasToken: boolean
  busy: boolean
  error: string
  message: string

  loginEmail: string
  setLoginEmail: (v: string) => void
  loginPassword: string
  setLoginPassword: (v: string) => void
  login: (e: FormEvent<HTMLFormElement>) => Promise<void>
  logout: () => void

  loadAll: (showSuccess?: boolean) => Promise<void>

  // Questions
  questions: Question[]
  questionForm: Question
  questionSection: 'listening' | 'reading'
  setQuestionSection: (v: 'listening' | 'reading') => void
  questionEditId: string
  setQuestionForm: React.Dispatch<React.SetStateAction<Question>>
  saveQuestion: (e: FormEvent<HTMLFormElement>) => Promise<void>
  startQuestionEdit: (item: Question) => void
  cancelQuestionEdit: () => void
  deleteQuestion: (id: string) => Promise<void>

  // Listening Sections
  listeningSections: ListeningSection[]
  listeningForm: ListeningSection
  setListeningForm: React.Dispatch<React.SetStateAction<ListeningSection>>
  saveListeningSection: (e: FormEvent<HTMLFormElement>) => Promise<void>
  deleteListeningSection: (id: string) => Promise<void>

  // Reading Passages
  readingPassages: ReadingPassage[]
  passageForm: ReadingPassage
  setPassageForm: React.Dispatch<React.SetStateAction<ReadingPassage>>
  saveReadingPassage: (e: FormEvent<HTMLFormElement>) => Promise<void>
  deleteReadingPassage: (id: string) => Promise<void>

  // Writing Tasks
  writingTasks: WritingTask[]
  writingTaskForm: WritingTask
  setWritingTaskForm: React.Dispatch<React.SetStateAction<WritingTask>>
  saveWritingTask: (e: FormEvent<HTMLFormElement>) => Promise<void>

  // Speaking Parts
  speakingParts: SpeakingPart[]
  speakingPartForm: SpeakingPart
  setSpeakingPartForm: React.Dispatch<React.SetStateAction<SpeakingPart>>
  saveSpeakingPart: (e: FormEvent<HTMLFormElement>) => Promise<void>

  // Tests
  tests: Test[]
  testForm: Omit<Test, 'test_type'>
  testEditId: string
  setTestForm: React.Dispatch<React.SetStateAction<Omit<Test, 'test_type'>>>
  saveTest: (e: FormEvent<HTMLFormElement>) => Promise<void>
  startTestEdit: (item: Test) => void
  cancelTestEdit: () => void
  deleteTest: (id: string) => Promise<void>

  // Sessions
  sessions: Session[]

  // Users
  users: User[]
  userForm: UserFormShape
  setUserForm: React.Dispatch<React.SetStateAction<UserFormShape>>
  saveUser: (e: FormEvent<HTMLFormElement>) => Promise<void>

  // Utilities
  getRecordId: (v: unknown) => string
  toDateTimeLocal: (v: string | undefined | null) => string
  formatDate: (v: string | undefined | null) => string
  uploadFile: (endpoint: string, idKey: string, id: string, file: File, contentType?: string) => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

// ── Provider ─────────────────────────────────

export function AdminProvider({ children }: { children: ReactNode }) {
  const [apiBaseUrl, setApiBaseUrl] = useState(() =>
    readLocalStorage(STORAGE_KEYS.apiBaseUrl, DEFAULT_API_BASE_URL),
  )
  const [token, setToken] = useState(() => readLocalStorage(STORAGE_KEYS.token))

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Data lists
  const [questions, setQuestions] = useState<Question[]>([])
  const [listeningSections, setListeningSections] = useState<ListeningSection[]>([])
  const [readingPassages, setReadingPassages] = useState<ReadingPassage[]>([])
  const [writingTasks, setWritingTasks] = useState<WritingTask[]>([])
  const [speakingParts, setSpeakingParts] = useState<SpeakingPart[]>([])
  const [tests, setTests] = useState<Test[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Forms
  const [questionForm, setQuestionForm] = useState<Question>({ ...BLANK_QUESTION })
  const [questionSection, setQuestionSection] = useState<'listening' | 'reading'>('listening')
  const [questionEditId, setQuestionEditId] = useState('')

  const [listeningForm, setListeningForm] = useState<ListeningSection>({ ...BLANK_LISTENING })
  const [passageForm, setPassageForm] = useState<ReadingPassage>({ ...BLANK_PASSAGE })
  const [writingTaskForm, setWritingTaskForm] = useState<WritingTask>({ ...BLANK_WRITING_TASK })
  const [speakingPartForm, setSpeakingPartForm] = useState<SpeakingPart>({ ...BLANK_SPEAKING_PART })
  const [testForm, setTestForm] = useState<Omit<Test, 'test_type'>>({ ...BLANK_TEST })
  const [testEditId, setTestEditId] = useState('')
  const [userForm, setUserForm] = useState<UserFormShape>({ ...BLANK_USER_FORM })

  const hasToken = useMemo(() => token.trim().length > 0, [token])

  // ── Persist to localStorage ────────────────

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.apiBaseUrl, apiBaseUrl)
  }, [apiBaseUrl])

  useEffect(() => {
    if (token.trim()) window.localStorage.setItem(STORAGE_KEYS.token, token)
    else window.localStorage.removeItem(STORAGE_KEYS.token)
  }, [token])

  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(() => setMessage(''), 4000)
    return () => window.clearTimeout(id)
  }, [message])

  // ── Load all data ──────────────────────────

  async function loadAll(showSuccess = true) {
    if (!token.trim()) {
      setError('Not authenticated.')
      return
    }
    setBusy(true)
    try {
      const [qP, lsP, rpP, wtP, spP, tP, sesP, uP] = await Promise.all([
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.questionsList, token }),
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.listeningSectionsList, token }),
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.readingPassagesList, token }),
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.writingTasksList, token }),
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.speakingPartsList, token }),
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.testsList, token }),
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.sessionsList, token }),
        apiRequest<unknown>({ baseUrl: apiBaseUrl, path: ENDPOINTS.users, token }),
      ])
      setQuestions(normalizeList<Question>(qP))
      setListeningSections(normalizeList<ListeningSection>(lsP))
      setReadingPassages(normalizeList<ReadingPassage>(rpP))
      setWritingTasks(normalizeList<WritingTask>(wtP))
      setSpeakingParts(normalizeList<SpeakingPart>(spP))
      setTests(normalizeList<Test>(tP))
      setSessions(normalizeList<Session>(sesP))
      setUsers(normalizeList<User>(uP))
      if (showSuccess) setMessage('Data loaded.')
    } catch (e) {
      setError((e as Error).message)
      setMessage('')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (hasToken) loadAll(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken])

  // ── Auth ─────────────────────────────────

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const res = await apiRequest<Record<string, unknown>>({
        baseUrl: apiBaseUrl,
        path: ENDPOINTS.login,
        method: 'POST',
        body: { email: loginEmail, password: loginPassword },
      })
      const nextToken =
        (typeof res.access_token === 'string' ? res.access_token : '') ||
        (typeof res.accessToken === 'string' ? res.accessToken : '') ||
        (typeof res.token === 'string' ? res.token : '')
      if (!nextToken) throw new Error('Login succeeded but no access_token found.')
      setToken(nextToken)
      setLoginPassword('')
      setMessage('Logged in.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function logout() {
    setToken('')
    setQuestions([]); setListeningSections([]); setReadingPassages([])
    setWritingTasks([]); setSpeakingParts([]); setTests([])
    setSessions([]); setUsers([])
    setQuestionEditId('')
    setQuestionForm({ ...BLANK_QUESTION })
    setTestEditId('')
    setTestForm({ ...BLANK_TEST })
    setListeningForm({ ...BLANK_LISTENING })
    setPassageForm({ ...BLANK_PASSAGE })
    setWritingTaskForm({ ...BLANK_WRITING_TASK })
    setSpeakingPartForm({ ...BLANK_SPEAKING_PART })
    setUserForm({ ...BLANK_USER_FORM })
    setMessage('Logged out.')
  }

  // ── Question CRUD ────────────────────────

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      if (questionEditId) {
        const body: Record<string, unknown> = { ...questionForm }
        for (const k of ['id', '_id', 'section', 'created_at', 'created_by']) delete body[k]
        body.question_id = questionEditId
        await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.questionUpdate, method: 'PUT', token, body })
        setMessage('Question updated.')
      } else {
        const body: Record<string, unknown> = { ...questionForm }
        for (const k of ['id', '_id', 'created_at', 'created_by', 'section']) delete body[k]
        body.section = questionSection
        await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.questionCreate, method: 'POST', token, body })
        setMessage('Question created.')
      }
      cancelQuestionEdit()
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  async function deleteQuestion(id: string) {
    if (!id) { setError('Question ID missing.'); return }
    if (!window.confirm('Delete this question?')) return
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.questionDelete, method: 'DELETE', token, body: { question_id: id } })
      await loadAll(false); setMessage('Question deleted.')
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  function startQuestionEdit(item: Question) {
    setQuestionEditId(getRecordId(item))
    setQuestionForm({ ...item })
    if (item.section === 'listening' || item.section === 'reading') setQuestionSection(item.section)
  }

  function cancelQuestionEdit() {
    setQuestionEditId('')
    setQuestionForm({ ...BLANK_QUESTION })
  }

  // ── Listening Section CRUD ───────────────

  async function saveListeningSection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      const body: Record<string, unknown> = { ...listeningForm }
      for (const k of ['id', '_id', 'created_at', 'created_by', 'questions']) delete body[k]
      await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.listeningSectionCreate, method: 'POST', token, body })
      setMessage('Listening section created.')
      setListeningForm({ ...BLANK_LISTENING })
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  async function deleteListeningSection(id: string) {
    if (!id || !window.confirm('Delete this listening section?')) return
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.listeningSectionDelete, method: 'DELETE', token, body: { section_id: id } })
      await loadAll(false); setMessage('Listening section deleted.')
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  // ── Reading Passage CRUD ─────────────────

  async function saveReadingPassage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      const body: Record<string, unknown> = { ...passageForm }
      for (const k of ['id', '_id', 'created_at', 'created_by', 'questions']) delete body[k]
      await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.readingPassageCreate, method: 'POST', token, body })
      setMessage('Reading passage created.')
      setPassageForm({ ...BLANK_PASSAGE })
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  async function deleteReadingPassage(id: string) {
    if (!id || !window.confirm('Delete this reading passage?')) return
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.readingPassageDelete, method: 'DELETE', token, body: { passage_id: id } })
      await loadAll(false); setMessage('Reading passage deleted.')
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  // ── Writing Task create ──────────────────

  async function saveWritingTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      const body: Record<string, unknown> = { ...writingTaskForm }
      for (const k of ['id', '_id', 'created_at', 'created_by']) delete body[k]
      await apiRequest<WritingTask>({ baseUrl: apiBaseUrl, path: ENDPOINTS.writingTaskCreate, method: 'POST', token, body })
      setMessage('Writing task created.')
      setWritingTaskForm({ ...BLANK_WRITING_TASK })
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  // ── Speaking Part create ─────────────────

  async function saveSpeakingPart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      const body: Record<string, unknown> = { ...speakingPartForm }
      for (const k of ['id', '_id', 'created_at', 'created_by']) delete body[k]
      if (body.follow_up_questions && Array.isArray(body.follow_up_questions) && (body.follow_up_questions as string[]).every((s) => !s.trim())) {
        delete body.follow_up_questions
      }
      await apiRequest<SpeakingPart>({ baseUrl: apiBaseUrl, path: ENDPOINTS.speakingPartCreate, method: 'POST', token, body })
      setMessage('Speaking part created.')
      setSpeakingPartForm({ ...BLANK_SPEAKING_PART })
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  // ── Test CRUD ────────────────────────────

  async function saveTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      if (testEditId) {
        const body: Record<string, unknown> = { ...testForm }
        for (const k of ['id', '_id', 'created_at', 'created_by', 'test_type']) delete body[k]
        body.test_id = testEditId
        await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.testUpdate, method: 'PUT', token, body })
        setMessage('Test updated.')
      } else {
        const body: Record<string, unknown> = { ...testForm }
        for (const k of ['id', '_id', 'created_at', 'created_by', 'test_type']) delete body[k]
        await apiRequest<Test>({ baseUrl: apiBaseUrl, path: ENDPOINTS.testCreate, method: 'POST', token, body })
        setMessage('Test created — users can now take it.')
      }
      cancelTestEdit()
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  async function deleteTest(id: string) {
    if (!id || !window.confirm('Delete this test?')) return
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.testDelete, method: 'DELETE', token, body: { test_id: id } })
      await loadAll(false); setMessage('Test deleted.')
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  function startTestEdit(item: Test) {
    setTestEditId(getRecordId(item))
    setTestForm({
      title: item.title ?? '',
      module_type: item.module_type ?? 'academic',
      description: item.description ?? '',
      listening_section_ids: item.listening_section_ids ?? [],
      reading_passage_ids: item.reading_passage_ids ?? [],
      writing_task_ids: item.writing_task_ids ?? [],
      speaking_part_ids: item.speaking_part_ids ?? [],
    })
  }

  function cancelTestEdit() {
    setTestEditId('')
    setTestForm({ ...BLANK_TEST })
  }

  // ── User create ──────────────────────────

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      await apiRequest({ baseUrl: apiBaseUrl, path: ENDPOINTS.register, method: 'POST', body: userForm })
      setMessage('User created.')
      setUserForm({ ...BLANK_USER_FORM })
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  // ── Generic file upload ──────────────────

  async function uploadFile(endpoint: string, idKey: string, id: string, file: File, contentType?: string) {
    if (!hasToken) { setError('Not authenticated.'); return }
    setError(''); setBusy(true)
    try {
      const b64 = await fileToBase64(file)
      const body: Record<string, unknown> = {
        [idKey]: id,
        file_name: file.name,
        file_content_base64: b64,
      }
      if (contentType) body.content_type = contentType
      await apiRequest({ baseUrl: apiBaseUrl, path: endpoint, method: 'POST', token, body })
      setMessage(`Uploaded ${file.name}`)
      await loadAll(false)
    } catch (e) { setError((e as Error).message) } finally { setBusy(false) }
  }

  // ── Value ────────────────────────────────

  const value: AdminContextValue = {
    apiBaseUrl, setApiBaseUrl, token, setToken,
    hasToken, busy, error, message,
    loginEmail, setLoginEmail, loginPassword, setLoginPassword,
    login, logout, loadAll,

    questions, questionForm, questionSection, setQuestionSection,
    questionEditId, setQuestionForm, saveQuestion,
    startQuestionEdit, cancelQuestionEdit, deleteQuestion,

    listeningSections, listeningForm, setListeningForm,
    saveListeningSection, deleteListeningSection,

    readingPassages, passageForm, setPassageForm,
    saveReadingPassage, deleteReadingPassage,

    writingTasks, writingTaskForm, setWritingTaskForm, saveWritingTask,
    speakingParts, speakingPartForm, setSpeakingPartForm, saveSpeakingPart,

    tests, testForm, testEditId, setTestForm, saveTest,
    startTestEdit, cancelTestEdit, deleteTest,
    sessions,
    users, userForm, setUserForm, saveUser,

    getRecordId, toDateTimeLocal, formatDate, uploadFile,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
