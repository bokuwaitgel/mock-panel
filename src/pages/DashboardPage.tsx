import { Link } from 'react-router-dom'
import { useAdmin } from '../admin/AdminContext'

export function DashboardPage() {
  const { questions, sessions, users, toDateTimeLocal } = useAdmin()

  return (
    <section className="page-grid">
      <article className="card">
        <h3>Overview</h3>
        <div className="stats-grid">
          <article className="stat-card">
            <span>Questions</span>
            <strong>{questions.length}</strong>
          </article>
          <article className="stat-card">
            <span>Sessions</span>
            <strong>{sessions.length}</strong>
          </article>
          <article className="stat-card">
            <span>Users</span>
            <strong>{users.length}</strong>
          </article>
        </div>
      </article>

      <article className="card">
        <h3>Recent Questions</h3>
        <div className="list compact">
          {questions.length === 0 ? <p className="empty-state">No questions found.</p> : null}
          {questions.slice(0, 5).map((item) => (
            <div key={item.id ?? item.title} className="list-item compact-item">
              <div>
                <strong>{item.title}</strong>
                <p>{item.category || 'No category'}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/questions" className="text-link">
          Manage all questions
        </Link>
      </article>

      <article className="card">
        <h3>Recent Sessions</h3>
        <div className="list compact">
          {sessions.length === 0 ? <p className="empty-state">No sessions found.</p> : null}
          {sessions.slice(0, 5).map((item) => (
            <div key={item.id ?? item.name} className="list-item compact-item">
              <div>
                <strong>{item.name}</strong>
                <p>
                  {toDateTimeLocal(item.startTime) || 'No start'} - {toDateTimeLocal(item.endTime) || 'No end'}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/sessions" className="text-link">
          Manage all sessions
        </Link>
      </article>

      <article className="card">
        <h3>Admins</h3>
        <div className="list compact">
          {users.filter((user) => user.role === 'admin').length === 0 ? (
            <p className="empty-state">No admins found.</p>
          ) : null}
          {users
            .filter((user) => user.role === 'admin')
            .slice(0, 5)
            .map((item) => (
              <div key={item.id ?? item.email} className="list-item compact-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.email}</p>
                </div>
              </div>
            ))}
        </div>
        <Link to="/users" className="text-link">
          Manage users and admins
        </Link>
      </article>
    </section>
  )
}
