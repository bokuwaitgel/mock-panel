import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from './AdminContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { hasToken } = useAdmin()

  if (!hasToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { hasToken } = useAdmin()

  if (hasToken) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
