import { useAdmin } from '../admin/AdminContext'

export function SettingsPage() {
  const {
    apiBaseUrl,
    setApiBaseUrl,
    login,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    token,
    setToken,
    busy,
  } = useAdmin()

  return (
    <section className="page-grid single">
      <article className="card">
        <h3>Backend Connection</h3>
        <div className="row">
          <label htmlFor="base-url">API Base URL</label>
          <input
            id="base-url"
            value={apiBaseUrl}
            onChange={(event) => setApiBaseUrl(event.target.value)}
            placeholder="http://localhost:8000"
          />
        </div>

        <h3>Admin Login</h3>
        <form onSubmit={login} className="auth-form">
          <div className="row two-col">
            <div>
              <label htmlFor="email">Admin Email</label>
              <input
                id="email"
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="admin@email.com"
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="actions">
            <button type="submit" disabled={busy}>
              {busy ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="row">
          <label htmlFor="token">Bearer Token (manual override)</label>
          <input
            id="token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste JWT token here"
          />
          <small className="muted">API URL and token are saved in local storage for convenience.</small>
        </div>
      </article>
    </section>
  )
}
