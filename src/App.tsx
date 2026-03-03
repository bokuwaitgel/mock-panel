import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminProvider } from './admin/AdminContext'
import { AdminLayout } from './admin/AdminLayout'
import { ProtectedRoute, PublicOnlyRoute } from './admin/RouteGuards'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { SessionsPage } from './pages/SessionsPage'
import { SettingsPage } from './pages/SettingsPage'
import { UsersPage } from './pages/UsersPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  )
}

export default App