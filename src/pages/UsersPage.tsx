import { useAdmin } from '../admin/AdminContext'

export function UsersPage() {
  const {
    busy,
    users,
    userForm,
    setUserForm,
    userEditId,
    saveUser,
    cancelUserEdit,
    startUserEdit,
    deleteUser,
    getRecordId,
  } = useAdmin()

  return (
    <section className="page-grid">
      <article className="card">
        <h3>{userEditId ? 'Edit User' : 'Create User / Admin'}</h3>
        <form onSubmit={saveUser}>
          <div className="row two-col">
            <div>
              <label htmlFor="user-name">Name</label>
              <input
                id="user-name"
                value={userForm.name}
                onChange={(event) => setUserForm((old) => ({ ...old, name: event.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                value={userForm.email}
                onChange={(event) => setUserForm((old) => ({ ...old, email: event.target.value }))}
                required
              />
            </div>
          </div>

          {!userEditId ? (
            <div className="row">
              <label htmlFor="user-password">Password</label>
              <input
                id="user-password"
                type="password"
                value={userForm.password || ''}
                onChange={(event) => setUserForm((old) => ({ ...old, password: event.target.value }))}
                required
              />
            </div>
          ) : null}

          <div className="row two-col">
            <div>
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                value={userForm.role}
                onChange={(event) =>
                  setUserForm((old) => ({
                    ...old,
                    role: event.target.value === 'admin' ? 'admin' : 'user',
                  }))
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="row inline align-end">
              <label htmlFor="user-active">Active</label>
              <input
                id="user-active"
                type="checkbox"
                checked={userForm.isActive}
                onChange={(event) => setUserForm((old) => ({ ...old, isActive: event.target.checked }))}
              />
            </div>
          </div>

          <div className="actions">
            <button type="submit" disabled={busy}>
              {busy ? 'Saving...' : `${userEditId ? 'Update' : 'Create'} User`}
            </button>
            {userEditId ? (
              <button type="button" onClick={cancelUserEdit}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="card">
        <h3>User List</h3>
        <div className="list">
          {users.length === 0 ? <p className="empty-state">No users yet.</p> : null}
          {users.map((item) => {
            const id = getRecordId(item)
            return (
              <div key={id || item.email} className="list-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.email} | {item.role}
                  </p>
                </div>
                <div className="actions">
                  <button type="button" onClick={() => startUserEdit(item)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteUser(id)} disabled={!id || busy}>
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </article>
    </section>
  )
}
