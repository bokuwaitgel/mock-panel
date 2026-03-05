import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminProvider } from './admin/AdminContext'
import { AdminLayout } from './admin/AdminLayout'
import { ProtectedRoute, PublicOnlyRoute } from './admin/RouteGuards'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { ListeningSectionsPage } from './pages/ListeningSectionsPage'
import { ReadingPassagesPage } from './pages/ReadingPassagesPage'
import { WritingPage } from './pages/WritingPage'
import { SpeakingPage } from './pages/SpeakingPage'
import { TestsPage } from './pages/TestsPage'
import { SessionsPage } from './pages/SessionsPage'
import { HskPage } from './pages/HskPage'
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
            {/* IELTS */}
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/listening" element={<ListeningSectionsPage />} />
            <Route path="/reading" element={<ReadingPassagesPage />} />
            <Route path="/writing" element={<WritingPage />} />
            <Route path="/speaking" element={<SpeakingPage />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            {/* HSK */}
            <Route path="/hsk" element={<HskPage />} />
            {/* General */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AdminProvider>
    </BrowserRouter>
  )
}

export default App