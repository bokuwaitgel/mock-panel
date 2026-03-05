import { useAdmin } from '../admin/AdminContext'

export function SessionsPage() {
  const { sessions, getRecordId, formatDate } = useAdmin()

  return (
    <section className="page-grid" style={{ gridTemplateColumns: '1fr' }}>
      <article className="card">
        <h3>IELTS Test Sessions</h3>
        <p className="muted" style={{ marginBottom: 12 }}>
          Showing sessions for the currently logged-in user. The backend scopes
          session listing to the authenticated user.
        </p>
        <div className="list">
          {sessions.length === 0 && (
            <p className="empty-state">No sessions found.</p>
          )}
          {sessions.map((s) => {
            const id = getRecordId(s)
            return (
              <div key={id || Math.random()} className="list-item">
                <div style={{ flex: 1 }}>
                  <div className="list-item-header">
                    <strong>
                      {(s.test_type || 'ielts').toUpperCase()} Session
                    </strong>
                    <span
                      className={`badge ${
                        s.status === 'graded'
                          ? 'badge-green'
                          : s.status === 'submitted'
                            ? 'badge-blue'
                            : s.status === 'in_progress'
                              ? 'badge-yellow'
                              : ''
                      }`}
                    >
                      {s.status}
                    </span>
                    {s.module_type && (
                      <span className="badge">{s.module_type}</span>
                    )}
                  </div>
                  <p className="muted">
                    Started: {formatDate(s.started_at)}
                    {s.submitted_at &&
                      ` · Submitted: ${formatDate(s.submitted_at)}`}
                  </p>
                  <p className="muted">Test ID: {s.test_id}</p>
                </div>
              </div>
            )
          })}
        </div>
      </article>
    </section>
  )
}
