import { useRef, useState } from 'react'
import { useAdmin } from '../admin/AdminContext'
import { ENDPOINTS } from '../admin/api'
import { QUESTION_TYPES } from '../admin/types'

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

  // Question filter state
  const [qTypeFilter, setQTypeFilter] = useState<string>('')
  const [qSearchText, setQSearchText] = useState('')

  // Available listening questions for linking (with filters)
  const listeningQuestions = questions
    .filter((q) => q.section === 'listening')
    .filter((q) => !qTypeFilter || q.question_type === qTypeFilter)
    .filter((q) => {
      if (!qSearchText.trim()) return true
      const search = qSearchText.toLowerCase()
      return (
        q.question_text.toLowerCase().includes(search) ||
        String(q.question_number).includes(search) ||
        (q.instructions ?? '').toLowerCase().includes(search)
      )
    })

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
            <div>
              <label htmlFor="ls-title">Part Title <span className="muted">(optional)</span></label>
              <input
                id="ls-title"
                type="text"
                value={form.part_title ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, part_title: e.target.value || undefined }))}
                placeholder="Section topic"
              />
            </div>
          </div>

          <div className="row three-col">
            <div>
              <label htmlFor="ls-qfrom">Question # From</label>
              <input
                id="ls-qfrom"
                type="number"
                min={1}
                max={40}
                value={form.question_number_from ?? ''}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  question_number_from: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>
            <div>
              <label htmlFor="ls-qto">Question # To</label>
              <input
                id="ls-qto"
                type="number"
                min={1}
                max={40}
                value={form.question_number_to ?? ''}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  question_number_to: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <label className="checkbox-label" style={{ margin: 0 }}>
                <input
                  type="checkbox"
                  checked={form.is_shared_across_modules ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, is_shared_across_modules: e.target.checked }))}
                />
                Shared across Academic/General
              </label>
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

          <div className="row">
            <label>Link Questions <span className="muted">(select existing)</span></label>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <select
                value={qTypeFilter}
                onChange={(e) => setQTypeFilter(e.target.value)}
                style={{ flex: '0 0 auto', minWidth: 180 }}
              >
                <option value="">All question types</option>
                {QUESTION_TYPES.map((qt) => (
                  <option key={qt} value={qt}>{qt.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search by text or #number…"
                value={qSearchText}
                onChange={(e) => setQSearchText(e.target.value)}
                style={{ flex: 1, minWidth: 140 }}
              />
              {(qTypeFilter || qSearchText) && (
                <button
                  type="button"
                  className="btn-small"
                  onClick={() => { setQTypeFilter(''); setQSearchText('') }}
                >
                  Clear
                </button>
              )}
            </div>

            <small className="muted" style={{ marginBottom: 4, display: 'block' }}>
              Showing {listeningQuestions.length} of {questions.filter((q) => q.section === 'listening').length} listening questions
              {(form.question_ids ?? []).length > 0 && <> · <strong>{(form.question_ids ?? []).length} selected</strong></>}
            </small>

            <div className="checkbox-grid">
              {listeningQuestions.map((q) => {
                const qid = getRecordId(q)
                const checked = (form.question_ids ?? []).includes(qid)
                return (
                  <label key={qid} className="checkbox-label" title={q.question_text}>
                    <input type="checkbox" checked={checked} onChange={() => toggleQuestionId(qid)} />
                    #{q.question_number} – {q.question_type.replace(/_/g, ' ')}
                  </label>
                )
              })}
              {questions.filter((q) => q.section === 'listening').length === 0 && (
                <span className="muted">No existing listening questions yet. Create some in the Questions page.</span>
              )}
              {questions.filter((q) => q.section === 'listening').length > 0 && listeningQuestions.length === 0 && (
                <span className="muted">No questions match the current filters.</span>
              )}
            </div>
          </div>

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
                        {s.is_shared_across_modules !== false && <span className="badge">shared</span>}
                      </div>
                      {s.part_title && <p><strong>{s.part_title}</strong></p>}
                      {s.description && <p>{s.description}</p>}
                      {(s.question_number_from || s.question_number_to) && (
                        <small className="muted">
                          Range: {s.question_number_from ?? '?'}–{s.question_number_to ?? '?'}
                        </small>
                      )}
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
