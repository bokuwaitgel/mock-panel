import { useAdmin } from '../admin/AdminContext'

export function SessionsPage() {
  const {
    busy,
    sessions,
    sessionForm,
    setSessionForm,
    sessionEditId,
    saveSession,
    cancelSessionEdit,
    startSessionEdit,
    deleteSession,
    getRecordId,
    toDateTimeLocal,
  } = useAdmin()

  return (
    <section className="page-grid">
      <article className="card">
        <h3>{sessionEditId ? 'Edit Session' : 'Create Session'}</h3>
        <form onSubmit={saveSession}>
          <div className="row">
            <label htmlFor="session-name">Name</label>
            <input
              id="session-name"
              value={sessionForm.name}
              onChange={(event) => setSessionForm((old) => ({ ...old, name: event.target.value }))}
              required
            />
          </div>

          <div className="row two-col">
            <div>
              <label htmlFor="session-start">Start Time</label>
              <input
                id="session-start"
                type="datetime-local"
                value={sessionForm.startTime}
                onChange={(event) => setSessionForm((old) => ({ ...old, startTime: event.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="session-end">End Time</label>
              <input
                id="session-end"
                type="datetime-local"
                value={sessionForm.endTime}
                onChange={(event) => setSessionForm((old) => ({ ...old, endTime: event.target.value }))}
              />
            </div>
          </div>

          <div className="row inline">
            <label htmlFor="session-active">Active</label>
            <input
              id="session-active"
              type="checkbox"
              checked={sessionForm.isActive}
              onChange={(event) => setSessionForm((old) => ({ ...old, isActive: event.target.checked }))}
            />
          </div>

          <div className="actions">
            <button type="submit" disabled={busy}>
              {busy ? 'Saving...' : `${sessionEditId ? 'Update' : 'Create'} Session`}
            </button>
            {sessionEditId ? (
              <button type="button" onClick={cancelSessionEdit}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="card">
        <h3>Session List</h3>
        <div className="list">
          {sessions.length === 0 ? <p className="empty-state">No sessions yet.</p> : null}
          {sessions.map((item) => {
            const id = getRecordId(item)
            return (
              <div key={id || item.name} className="list-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {toDateTimeLocal(item.startTime) || 'No start'} - {toDateTimeLocal(item.endTime) || 'No end'}
                  </p>
                </div>
                <div className="actions">
                  <button type="button" onClick={() => startSessionEdit(item)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteSession(id)} disabled={!id || busy}>
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
