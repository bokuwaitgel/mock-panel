import { NavLink, Outlet } from 'react-router-dom'
import { useAdmin } from './AdminContext'

export function AdminLayout() {
  const { busy, hasToken, loadAll, logout, error, message } = useAdmin()

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <h1>Mock Admin</h1>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Dashboard
          </NavLink>
          <NavLink to="/questions" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Questions
          </NavLink>
          <NavLink to="/sessions" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Sessions
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Users
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            Settings
          </NavLink>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="content-header">
          <div>
            <h2>Admin Panel</h2>
            <p>{hasToken ? 'Authenticated' : 'Not authenticated'}</p>
          </div>
          <div className="header-actions">
            <button type="button" onClick={() => loadAll()} disabled={!hasToken || busy}>
              {busy ? 'Working...' : 'Refresh'}
            </button>
            <button type="button" onClick={logout} disabled={!hasToken || busy}>
              Logout
            </button>
          </div>
        </header>

        {error ? <p className="status error">{error}</p> : null}
        {message ? <p className="status success">{message}</p> : null}

        <Outlet />
      </section>
    </main>
  )
}
