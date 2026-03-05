import { NavLink, Outlet } from 'react-router-dom'
import { useAdmin } from './AdminContext'

const navCls = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav-item active' : 'nav-item')

export function AdminLayout() {
  const { busy, hasToken, loadAll, logout, error, message } = useAdmin()

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <h1>Mock Admin</h1>
        <nav>
          <NavLink to="/dashboard" className={navCls}>Dashboard</NavLink>

          <span className="nav-section">IELTS</span>
          <NavLink to="/questions" className={navCls}>Questions</NavLink>
          <NavLink to="/listening" className={navCls}>Listening</NavLink>
          <NavLink to="/reading" className={navCls}>Reading</NavLink>
          <NavLink to="/writing" className={navCls}>Writing</NavLink>
          <NavLink to="/speaking" className={navCls}>Speaking</NavLink>
          <NavLink to="/tests" className={navCls}>Tests</NavLink>
          <NavLink to="/sessions" className={navCls}>Sessions</NavLink>

          <span className="nav-section">HSK</span>
          <NavLink to="/hsk" className={navCls}>
            <span>Overview</span>
            <span className="badge badge-soon">Soon</span>
          </NavLink>

          <span className="nav-section">General</span>
          <NavLink to="/users" className={navCls}>Users</NavLink>
        </nav>
      </aside>

      <section className="admin-content">
        <header className="content-header">
          <div>
            <h2>Admin Panel</h2>
            <p>{hasToken ? 'Authenticated' : 'Not authenticated'}</p>
          </div>
          <div className="header-actions">
            <button type="button" className="btn-primary" onClick={() => loadAll()} disabled={!hasToken || busy}>
              {busy ? 'Working...' : 'Refresh'}
            </button>
            <button type="button" className="btn-secondary" onClick={logout} disabled={!hasToken || busy}>
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
