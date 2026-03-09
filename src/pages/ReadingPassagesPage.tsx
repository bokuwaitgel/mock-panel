import { useRef, useState } from 'react'
import { useAdmin } from '../admin/AdminContext'
import { ENDPOINTS } from '../admin/api'
import { MODULE_TYPES, SOURCE_TYPES } from '../admin/types'

export function ReadingPassagesPage() {
  const {
    busy,
    readingPassages,
    passageForm: form,
    setPassageForm: setForm,
    saveReadingPassage,
    deleteReadingPassage,
    questions,
    getRecordId,
    uploadFile,
  } = useAdmin()

  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const readingQuestions = questions.filter((q) => q.section === 'reading')

  function toggleQuestionId(qid: string) {
    setForm((f) => {
      const ids = f.question_ids ?? []
      return {
        ...f,
        question_ids: ids.includes(qid) ? ids.filter((i) => i !== qid) : [...ids, qid],
      }
    })
  }

  async function handleUploadImage(passageId: string) {
    const file = uploadFiles[passageId]
    if (!file) return
    await uploadFile(ENDPOINTS.readingPassageUploadImage, 'passage_id', passageId, file, file.type || 'image/jpeg')
    setUploadFiles((prev) => ({ ...prev, [passageId]: null }))
  }

  return (
    <section className="page-grid">
      <article className="card">
        <h3>Create Reading Passage</h3>
        <form onSubmit={saveReadingPassage}>
          <div className="row two-col">
            <div>
              <label htmlFor="rp-num">Passage Number (1–3)</label>
              <select
                id="rp-num"
                value={form.passage_number}
                onChange={(e) => setForm((f) => ({ ...f, passage_number: Number(e.target.value) }))}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rp-title">Title</label>
              <input
                id="rp-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="row">
            <label htmlFor="rp-body">Passage Text</label>
            <textarea
              id="rp-body"
              rows={6}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              required
            />
          </div>

          <div className="row">
            <label htmlFor="rp-source">Source <span className="muted">(optional)</span></label>
            <input
              id="rp-source"
              type="text"
              value={form.source ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value || undefined }))}
              placeholder="The Economist, 2024"
            />
          </div>

          <div className="row three-col">
            <div>
              <label htmlFor="rp-source-type">Source Type</label>
              <select
                id="rp-source-type"
                value={form.source_type ?? ''}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  source_type: (e.target.value || undefined) as typeof f.source_type,
                }))}
              >
                <option value="">—</option>
                {SOURCE_TYPES.map((sourceType) => (
                  <option key={sourceType} value={sourceType}>{sourceType}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rp-module-override">Module Override</label>
              <select
                id="rp-module-override"
                value={form.module_type_override ?? ''}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  module_type_override: (e.target.value || undefined) as typeof f.module_type_override,
                }))}
              >
                <option value="">—</option>
                {MODULE_TYPES.map((module) => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>
            <div />
          </div>

          <div className="row two-col">
            <div>
              <label htmlFor="rp-qfrom">Question # From</label>
              <input
                id="rp-qfrom"
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
              <label htmlFor="rp-qto">Question # To</label>
              <input
                id="rp-qto"
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
          </div>

          {readingQuestions.length > 0 && (
            <div className="row">
              <label>Link Questions <span className="muted">(select existing)</span></label>
              <div className="checkbox-grid">
                {readingQuestions.map((q) => {
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
              {busy ? 'Creating…' : 'Create Passage'}
            </button>
          </div>
        </form>
      </article>

      <article className="card">
        <h3>Reading Passages ({readingPassages.length})</h3>
        <div className="list">
          {readingPassages.length === 0 ? (
            <p className="empty-state">No reading passages yet.</p>
          ) : (
            readingPassages.map((p) => {
              const id = getRecordId(p)
              const pendingFile = uploadFiles[id] ?? null
              return (
                <div key={id || Math.random()} className="list-item" style={{ flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div className="list-item-header">
                        <strong>Passage {p.passage_number}: {p.title}</strong>
                        <span className="badge badge-green">
                          {(p.questions?.length ?? p.question_ids?.length ?? 0)} Q
                        </span>
                        {p.module_type_override && <span className="badge badge-blue">{p.module_type_override}</span>}
                      </div>
                      <p>{p.body.length > 120 ? p.body.slice(0, 120) + '…' : p.body}</p>
                      {p.source && <small className="muted">Source: {p.source}</small>}
                      {(p.question_number_from || p.question_number_to) && (
                        <small className="muted">Range: {p.question_number_from ?? '?'}–{p.question_number_to ?? '?'}</small>
                      )}
                      {p.image_url && (
                        <div className="upload-current">
                          🖼️ <a href={p.image_url} target="_blank" rel="noreferrer">{p.image_url.split('/').pop()?.slice(0, 40)}</a>
                        </div>
                      )}
                      {id && <small className="muted">ID: {id.slice(-8)}</small>}
                    </div>
                    <div className="list-item-actions">
                      <button className="btn-small btn-danger" onClick={() => deleteReadingPassage(id)} disabled={busy}>✕</button>
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
