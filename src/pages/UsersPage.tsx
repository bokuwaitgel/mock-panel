import { useAdmin } from '../admin/AdminContext'

export function UsersPage() {
  const { busy, users, userForm, setUserForm, saveUser, getRecordId, formatDate } =
    useAdmin()

  return (
    <section className="page-grid">
      {/* Register form */}
      <article className="card">
        <h3>Register New User</h3>
        <form onSubmit={saveUser}>
          <div className="row two-col">
            <div>
              <label htmlFor="u-name">Username</label>
              <input
                id="u-name"
                value={userForm.username}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, username: e.target.value }))
                }
                minLength={3}
                maxLength={50}
                required
              />
            </div>
            <div>
              <label htmlFor="u-email">Email</label>
              <input
                id="u-email"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="row two-col">
            <div>
              <label htmlFor="u-password">Password</label>
              <input
                id="u-password"
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, password: e.target.value }))
                }
                minLength={6}
                required
              />
            </div>
            <div>
              <label htmlFor="u-role">Role</label>
              <select
                id="u-role"
                value={userForm.role}
                onChange={(e) =>
                  setUserForm((f) => ({
                    ...f,
                    role: e.target.value as typeof userForm.role,
                  }))
                }
              >
                <option value="candidate">Candidate</option>
                <option value="examiner">Examiner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </article>

      {/* User list */}
      <article className="card">
        <h3>Users ({users.length})</h3>
        <div className="list">
          {users.length === 0 && (
            <p className="empty-state">No users found.</p>
          )}
          {users.map((u) => {
            const id = getRecordId(u)
            return (
              <div key={id || u.email} className="list-item">
                <div style={{ flex: 1 }}>
                  <div className="list-item-header">
                    <strong>{u.username}</strong>
                    <span
                      className={`badge ${
                        u.role === 'admin'
                          ? 'badge-red'
                          : u.role === 'examiner'
                            ? 'badge-blue'
                            : ''
                      }`}
                    >
                      {u.role}
                    </span>
                    {u.is_active ? (
                      <span className="badge badge-green">active</span>
                    ) : (
                      <span className="badge badge-red">inactive</span>
                    )}
                  </div>
                  <p className="muted">{u.email}</p>
                  {u.created_at && (
                    <p className="muted">Joined: {formatDate(u.created_at)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </article>
    </section>
  )
}
