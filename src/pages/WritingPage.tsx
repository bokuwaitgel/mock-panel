import { useRef, useState } from 'react'
import { useAdmin } from '../admin/AdminContext'
import { WRITING_QUESTION_TYPES } from '../admin/types'
import { ENDPOINTS } from '../admin/api'

export function WritingPage() {
  const {
    writingTaskForm: form,
    setWritingTaskForm: setForm,
    saveWritingTask,
    writingTasks,
    busy,
    getRecordId,
    uploadFile,
  } = useAdmin()

  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  async function handleUploadImage(taskId: string) {
    const file = uploadFiles[taskId]
    if (!file) return
    await uploadFile(ENDPOINTS.writingTaskUploadImage, 'task_id', taskId, file, file.type || 'image/jpeg')
    setUploadFiles((prev) => ({ ...prev, [taskId]: null }))
  }

  return (
    <section className="page-grid">
      {/* Create form */}
      <article className="card">
        <h3>Create Writing Task</h3>
        <form onSubmit={saveWritingTask}>
          <div className="row two-col">
            <div>
              <label htmlFor="wt-number">Task Number (1–2)</label>
              <select
                id="wt-number"
                value={form.task_number}
                onChange={(e) => setForm((f) => ({ ...f, task_number: Number(e.target.value) }))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
            <div>
              <label htmlFor="wt-type">Question Type</label>
              <select
                id="wt-type"
                value={form.question_type}
                onChange={(e) => setForm((f) => ({ ...f, question_type: e.target.value }))}
              >
                {WRITING_QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <label htmlFor="wt-prompt">Prompt</label>
            <textarea
              id="wt-prompt"
              rows={4}
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              required
            />
          </div>

          <div className="row two-col">
            <div>
              <label htmlFor="wt-minwords">Minimum Words</label>
              <input
                id="wt-minwords"
                type="number"
                min={1}
                value={form.min_words}
                onChange={(e) => setForm((f) => ({ ...f, min_words: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <label htmlFor="wt-time">Time Limit (minutes)</label>
              <input
                id="wt-time"
                type="number"
                min={1}
                value={form.time_limit_minutes}
                onChange={(e) => setForm((f) => ({ ...f, time_limit_minutes: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Writing Task'}
            </button>
          </div>
        </form>
      </article>

      {/* Server-fetched list */}
      <article className="card">
        <h3>Writing Tasks ({writingTasks.length})</h3>
        <div className="list">
          {writingTasks.length === 0 ? (
            <p className="empty-state">No writing tasks yet.</p>
          ) : (
            writingTasks.map((t) => {
              const id = getRecordId(t)
              const pendingFile = uploadFiles[id] ?? null
              return (
                <div key={id || Math.random()} className="list-item" style={{ flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div className="list-item-header">
                        <strong>Task {t.task_number}</strong>
                        <span className="badge badge-green">{t.question_type?.replace(/_/g, ' ')}</span>
                      </div>
                      <p>{t.prompt.length > 100 ? t.prompt.slice(0, 100) + '…' : t.prompt}</p>
                      {t.image_url && (
                        <div className="upload-current">
                          🖼️ <a href={t.image_url} target="_blank" rel="noreferrer">{t.image_url.split('/').pop()?.slice(0, 40)}</a>
                        </div>
                      )}
                      <small className="muted">
                        {t.min_words} min words · {t.time_limit_minutes} min
                        {id && <> · ID: {id.slice(-8)}</>}
                      </small>
                    </div>
                  </div>

                  {/* Upload image widget */}
                  <div className={`upload-zone${pendingFile ? ' has-file' : ''}`}>
                    <input
                      ref={(el) => { fileRefs.current[id] = el }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null
                        setUploadFiles((prev) => ({ ...prev, [id]: f }))
                      }}
                    />
                    <label className="upload-label" onClick={() => fileRefs.current[id]?.click()}>
                      🖼️ {pendingFile ? 'Change file' : 'Choose image'}
                    </label>
                    {pendingFile && <span className="upload-file-name">{pendingFile.name}</span>}
                    <button
                      type="button"
                      className="upload-btn"
                      disabled={!pendingFile || busy}
                      onClick={() => handleUploadImage(id)}
                    >
                      {busy ? 'Uploading…' : '⬆ Upload'}
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </article>
    </section>
  )
}
