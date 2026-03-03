import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  apiRequest,
  DEFAULT_API_BASE_URL,
  ENDPOINTS,
  fromDateTimeLocal,
  getRecordId,
  normalizeList,
  readLocalStorage,
  STORAGE_KEYS,
  toDateTimeLocal,
} from './api'
import type { Question, Session, User } from './types'

type AdminContextValue = {
  apiBaseUrl: string
  setApiBaseUrl: (value: string) => void
  token: string
  setToken: (value: string) => void
  hasToken: boolean
  busy: boolean
  error: string
  message: string
  loginEmail: string
  setLoginEmail: (value: string) => void
  loginPassword: string
  setLoginPassword: (value: string) => void
  login: (event: FormEvent<HTMLFormElement>) => Promise<void>
  logout: () => void
  loadAll: (showSuccess?: boolean) => Promise<void>
  questions: Question[]
  questionForm: Question
  questionEditId: string
  setQuestionForm: React.Dispatch<React.SetStateAction<Question>>
  saveQuestion: (event: FormEvent<HTMLFormElement>) => Promise<void>
  startQuestionEdit: (item: Question) => void
  cancelQuestionEdit: () => void
  deleteQuestion: (id: string) => Promise<void>
  sessions: Session[]
  sessionForm: Session
  sessionEditId: string
  setSessionForm: React.Dispatch<React.SetStateAction<Session>>
  saveSession: (event: FormEvent<HTMLFormElement>) => Promise<void>
  startSessionEdit: (item: Session) => void
  cancelSessionEdit: () => void
  deleteSession: (id: string) => Promise<void>
  users: User[]
  userForm: User
  userEditId: string
  setUserForm: React.Dispatch<React.SetStateAction<User>>
  saveUser: (event: FormEvent<HTMLFormElement>) => Promise<void>
  startUserEdit: (item: User) => void
  cancelUserEdit: () => void
  deleteUser: (id: string) => Promise<void>
  getRecordId: (value: unknown) => string
  toDateTimeLocal: (value: string) => string
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [apiBaseUrl, setApiBaseUrl] = useState(() => readLocalStorage(STORAGE_KEYS.apiBaseUrl, DEFAULT_API_BASE_URL))
  const [token, setToken] = useState(() => readLocalStorage(STORAGE_KEYS.token))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [questions, setQuestions] = useState<Question[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [users, setUsers] = useState<User[]>([])

  const [questionForm, setQuestionForm] = useState<Question>({
    title: '',
    text: '',
    answer: '',
    category: '',
  })
  const [questionEditId, setQuestionEditId] = useState('')

  const [sessionForm, setSessionForm] = useState<Session>({
    name: '',
    startTime: '',
    endTime: '',
    isActive: true,
  })
  const [sessionEditId, setSessionEditId] = useState('')

  const [userForm, setUserForm] = useState<User>({
    name: '',
    email: '',
    role: 'user',
    isActive: true,
    password: '',
  })
  const [userEditId, setUserEditId] = useState('')

  const hasToken = useMemo(() => token.trim().length > 0, [token])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.apiBaseUrl, apiBaseUrl)
  }, [apiBaseUrl])

  useEffect(() => {
    if (token.trim()) {
      window.localStorage.setItem(STORAGE_KEYS.token, token)
      return
    }

    window.localStorage.removeItem(STORAGE_KEYS.token)
  }, [token])

  useEffect(() => {
    if (!message) {
      return
    }

    const timeoutId = window.setTimeout(() => setMessage(''), 3000)
    return () => window.clearTimeout(timeoutId)
  }, [message])

  function resetStatus() {
    setError('')
    setMessage('')
  }

  function clearEditors() {
    setQuestionEditId('')
    setQuestionForm({ title: '', text: '', answer: '', category: '' })
    setSessionEditId('')
    setSessionForm({ name: '', startTime: '', endTime: '', isActive: true })
    setUserEditId('')
    setUserForm({ name: '', email: '', role: 'user', isActive: true, password: '' })
  }

  function cancelQuestionEdit() {
    setQuestionEditId('')
    setQuestionForm({ title: '', text: '', answer: '', category: '' })
  }

  function cancelSessionEdit() {
    setSessionEditId('')
    setSessionForm({ name: '', startTime: '', endTime: '', isActive: true })
  }

  function cancelUserEdit() {
    setUserEditId('')
    setUserForm({ name: '', email: '', role: 'user', isActive: true, password: '' })
  }

  function logout() {
    setToken('')
    clearEditors()
    setQuestions([])
    setSessions([])
    setUsers([])
    setMessage('Logged out.')
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetStatus()
    setBusy(true)

    try {
      const payload = await apiRequest<Record<string, unknown>>({
        baseUrl: apiBaseUrl,
        path: ENDPOINTS.login,
        method: 'POST',
        body: { email: loginEmail, password: loginPassword },
      })

      const nextToken =
        (typeof payload.accessToken === 'string' ? payload.accessToken : '') ||
        (typeof payload.token === 'string' ? payload.token : '')

      if (!nextToken) {
        throw new Error('Login worked but token was not found in response.')
      }

      setToken(nextToken)
      setLoginPassword('')
      setMessage('Logged in successfully.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function loadAll(showSuccess = true) {
    if (!hasToken) {
      setError('Add token first, or login.')
      return
    }

    resetStatus()
    setBusy(true)

    try {
      const [questionPayload, sessionPayload, userPayload] = await Promise.all([
        apiRequest<unknown>({
          baseUrl: apiBaseUrl,
          path: ENDPOINTS.questions,
          token,
        }),
        apiRequest<unknown>({
          baseUrl: apiBaseUrl,
          path: ENDPOINTS.sessions,
          token,
        }),
        apiRequest<unknown>({
          baseUrl: apiBaseUrl,
          path: ENDPOINTS.users,
          token,
        }),
      ])

      setQuestions(normalizeList<Question>(questionPayload))
      setSessions(normalizeList<Session>(sessionPayload))
      setUsers(normalizeList<User>(userPayload))
      if (showSuccess) {
        setMessage('Data loaded.')
      }
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function saveQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) {
      setError('Add token first, or login.')
      return
    }

    resetStatus()
    setBusy(true)
    try {
      const path = questionEditId ? `${ENDPOINTS.questions}/${questionEditId}` : ENDPOINTS.questions
      await apiRequest({
        baseUrl: apiBaseUrl,
        path,
        method: questionEditId ? 'PUT' : 'POST',
        token,
        body: questionForm,
      })

      cancelQuestionEdit()
      await loadAll(false)
      setMessage(questionEditId ? 'Question updated.' : 'Question created.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteQuestion(id: string) {
    if (!id) {
      setError('Question id is missing.')
      return
    }

    if (!window.confirm('Delete this question?')) {
      return
    }

    if (!hasToken) {
      setError('Add token first, or login.')
      return
    }

    resetStatus()
    setBusy(true)
    try {
      await apiRequest({
        baseUrl: apiBaseUrl,
        path: `${ENDPOINTS.questions}/${id}`,
        method: 'DELETE',
        token,
      })
      await loadAll(false)
      setMessage('Question deleted.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function saveSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) {
      setError('Add token first, or login.')
      return
    }

    resetStatus()
    setBusy(true)
    try {
      const path = sessionEditId ? `${ENDPOINTS.sessions}/${sessionEditId}` : ENDPOINTS.sessions

      await apiRequest({
        baseUrl: apiBaseUrl,
        path,
        method: sessionEditId ? 'PUT' : 'POST',
        token,
        body: {
          ...sessionForm,
          startTime: fromDateTimeLocal(sessionForm.startTime),
          endTime: fromDateTimeLocal(sessionForm.endTime),
        },
      })

      cancelSessionEdit()
      await loadAll(false)
      setMessage(sessionEditId ? 'Session updated.' : 'Session created.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteSession(id: string) {
    if (!id) {
      setError('Session id is missing.')
      return
    }

    if (!window.confirm('Delete this session?')) {
      return
    }

    if (!hasToken) {
      setError('Add token first, or login.')
      return
    }

    resetStatus()
    setBusy(true)
    try {
      await apiRequest({
        baseUrl: apiBaseUrl,
        path: `${ENDPOINTS.sessions}/${id}`,
        method: 'DELETE',
        token,
      })
      await loadAll(false)
      setMessage('Session deleted.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasToken) {
      setError('Add token first, or login.')
      return
    }

    resetStatus()
    setBusy(true)
    try {
      const requestBody: User = {
        name: userForm.name,
        email: userForm.email,
        role: userForm.role,
        isActive: userForm.isActive,
      }

      if (!userEditId && userForm.password) {
        requestBody.password = userForm.password
      }

      const path = userEditId ? `${ENDPOINTS.users}/${userEditId}` : ENDPOINTS.users
      await apiRequest({
        baseUrl: apiBaseUrl,
        path,
        method: userEditId ? 'PUT' : 'POST',
        token,
        body: requestBody,
      })

      cancelUserEdit()
      await loadAll(false)
      setMessage(userEditId ? 'User updated.' : 'User created.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function deleteUser(id: string) {
    if (!id) {
      setError('User id is missing.')
      return
    }

    if (!window.confirm('Delete this user?')) {
      return
    }

    if (!hasToken) {
      setError('Add token first, or login.')
      return
    }

    resetStatus()
    setBusy(true)
    try {
      await apiRequest({
        baseUrl: apiBaseUrl,
        path: `${ENDPOINTS.users}/${id}`,
        method: 'DELETE',
        token,
      })
      await loadAll(false)
      setMessage('User deleted.')
    } catch (requestError) {
      setError((requestError as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function startQuestionEdit(item: Question) {
    setQuestionEditId(getRecordId(item))
    setQuestionForm({
      title: item.title ?? '',
      text: item.text ?? '',
      answer: item.answer ?? '',
      category: item.category ?? '',
    })
  }

  function startSessionEdit(item: Session) {
    setSessionEditId(getRecordId(item))
    setSessionForm({
      name: item.name ?? '',
      startTime: toDateTimeLocal(item.startTime ?? ''),
      endTime: toDateTimeLocal(item.endTime ?? ''),
      isActive: Boolean(item.isActive),
    })
  }

  function startUserEdit(item: User) {
    setUserEditId(getRecordId(item))
    setUserForm({
      name: item.name ?? '',
      email: item.email ?? '',
      role: item.role === 'admin' ? 'admin' : 'user',
      isActive: Boolean(item.isActive),
      password: '',
    })
  }

  const value: AdminContextValue = {
    apiBaseUrl,
    setApiBaseUrl,
    token,
    setToken,
    hasToken,
    busy,
    error,
    message,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    login,
    logout,
    loadAll,
    questions,
    questionForm,
    questionEditId,
    setQuestionForm,
    saveQuestion,
    startQuestionEdit,
    cancelQuestionEdit,
    deleteQuestion,
    sessions,
    sessionForm,
    sessionEditId,
    setSessionForm,
    saveSession,
    startSessionEdit,
    cancelSessionEdit,
    deleteSession,
    users,
    userForm,
    userEditId,
    setUserForm,
    saveUser,
    startUserEdit,
    cancelUserEdit,
    deleteUser,
    getRecordId,
    toDateTimeLocal,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider')
  }

  return context
}
