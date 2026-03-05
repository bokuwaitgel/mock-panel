import { useRef, useState } from 'react'
import { useAdmin } from '../admin/AdminContext'
import { ENDPOINTS } from '../admin/api'

export function ListeningSectionsPage() {
  const {
    busy,
    listeningSections,
    listeningForm: form,
    setListeningForm: setForm,
    saveListeningSection,
    deleteListeningSection,
    questions,
    getRecordId,
    uploadFile,
  } = useAdmin()

  // Upload state per section
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Available listening questions for linking
  const listeningQuestions = questions.filter((q) => q.section === 'listening')

  function toggleQuestionId(qid: string) {
    setForm((f) => {
      const ids = f.question_ids ?? []
      return {
        ...f,
        question_ids: ids.includes(qid) ? ids.filter((i) => i !== qid) : [...ids, qid],
      }
    })
  }

  async function handleUploadAudio(sectionId: string) {
    const file = uploadFiles[sectionId]
    if (!file) return
    await uploadFile(ENDPOINTS.listeningSectionUploadAudio, 'section_id', sectionId, file, file.type || 'audio/mpeg')
    setUploadFiles((prev) => ({ ...prev, [sectionId]: null }))
  }

  return (
    <section className="page-grid">
      <article className="card">
        <h3>Create Listening Section</h3>
        <form onSubmit={saveListeningSection}>
          <div className="row">
            <div>
              <label htmlFor="ls-part">Part Number (1–4)</label>
              <select
                id="ls-part"
                value={form.part_number}
                onChange={(e) => setForm((f) => ({ ...f, part_number: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <label htmlFor="ls-desc">Description <span className="muted">(optional)</span></label>
            <input
              id="ls-desc"
              type="text"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || undefined }))}
            />
          </div>

          {listeningQuestions.length > 0 && (
            <div className="row">
              <label>Link Questions <span className="muted">(select existing)</span></label>
              <div className="checkbox-grid">
                {listeningQuestions.map((q) => {
                  const qid = getRecordId(q)
                  const checked = (form.question_ids ?? []).includes(qid)
                  return (
                    <label key={qid} className="checkbox-label">
                      <input type="checkbox" checked={checked} onChange={() => toggleQuestionId(qid)} />
                      #{q.question_number} – {q.question_type.replace(/_/g, ' ')}
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Section'}
            </button>
          </div>
        </form>
      </article>

      <article className="card">
        <h3>Listening Sections ({listeningSections.length})</h3>
        <div className="list">
          {listeningSections.length === 0 ? (
            <p className="empty-state">No listening sections yet.</p>
          ) : (
            listeningSections.map((s) => {
              const id = getRecordId(s)
              const pendingFile = uploadFiles[id] ?? null
              return (
                <div key={id || Math.random()} className="list-item" style={{ flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div className="list-item-header">
                        <strong>Part {s.part_number}</strong>
                        <span className="badge badge-blue">
                          {(s.questions?.length ?? s.question_ids?.length ?? 0)} Q
                        </span>
                      </div>
                      {s.description && <p>{s.description}</p>}
                      {s.audio_url && (
                        <div className="upload-current">
                          🔊 <a href={s.audio_url} target="_blank" rel="noreferrer">{s.audio_url.split('/').pop()?.slice(0, 40)}</a>
                        </div>
                      )}
                      {id && <small className="muted">ID: {id.slice(-8)}</small>}
                    </div>
                    <div className="list-item-actions">
                      <button className="btn-small btn-danger" onClick={() => deleteListeningSection(id)} disabled={busy}>✕</button>
                    </div>
                  </div>

                  {/* Upload audio widget */}
                  <div className={`upload-zone${pendingFile ? ' has-file' : ''}`}>
                    <input
                      ref={(el) => { fileRefs.current[id] = el }}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null
                        setUploadFiles((prev) => ({ ...prev, [id]: f }))
                      }}
                    />
                    <label className="upload-label" onClick={() => fileRefs.current[id]?.click()}>
                      🎵 {pendingFile ? 'Change file' : 'Choose audio'}
                    </label>
                    {pendingFile && <span className="upload-file-name">{pendingFile.name}</span>}
                    <button
                      type="button"
                      className="upload-btn"
                      disabled={!pendingFile || busy}
                      onClick={() => handleUploadAudio(id)}
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
