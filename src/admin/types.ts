export type Question = {
  id?: number | string
  title: string
  text: string
  answer: string
  category: string
}

export type Session = {
  id?: number | string
  name: string
  startTime: string
  endTime: string
  isActive: boolean
}

export type User = {
  id?: number | string
  name: string
  email: string
  role: 'admin' | 'user'
  isActive: boolean
  password?: string
}
