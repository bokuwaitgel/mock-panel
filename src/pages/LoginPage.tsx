import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../admin/AdminContext'

export function LoginPage() {
  const {
    apiBaseUrl,
    setApiBaseUrl,
    login,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    busy,
    error,
    message,
    hasToken,
  } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (hasToken) {
      navigate('/dashboard', { replace: true })
    }
  }, [hasToken, navigate])

  return (
    <main className="login-shell">
      <section className="login-card card">
        <h1>Admin Login</h1>
        <p className="muted">Sign in to access the admin panel.</p>

        {error ? <p className="status error">{error}</p> : null}
        {message ? <p className="status success">{message}</p> : null}

        <div className="row">
          <label htmlFor="base-url">API Base URL</label>
          <input
            id="base-url"
            value={apiBaseUrl}
            onChange={(event) => setApiBaseUrl(event.target.value)}
            placeholder="http://localhost:8000"
          />
        </div>

        <form onSubmit={login}>
          <div className="row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="admin@email.com"
              required
            />
          </div>

          <div className="row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="actions">
            <button type="submit" disabled={busy}>
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
            <Link to="/settings" className="text-link">
              Advanced settings
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}
