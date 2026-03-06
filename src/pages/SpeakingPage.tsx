import { useRef, useState } from 'react'
import { useAdmin } from '../admin/AdminContext'
import { SPEAKING_QUESTION_TYPES } from '../admin/types'
import { ENDPOINTS } from '../admin/api'

export function SpeakingPage() {
  const {
    speakingPartForm: form,
    setSpeakingPartForm: setForm,
    speakingPartEditId,
    saveSpeakingPart,
    startSpeakingPartEdit,
    cancelSpeakingPartEdit,
    deleteSpeakingPart,
    speakingParts,
    busy,
    getRecordId,
    uploadFile,
  } = useAdmin()

  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const followUpText = (form.follow_up_questions ?? []).join('\n')

  async function handleUploadAudio(partId: string) {
    const file = uploadFiles[partId]
    if (!file) return
    await uploadFile(ENDPOINTS.speakingPartUploadAudio, 'part_id', partId, file, file.type || 'audio/mpeg')
    setUploadFiles((prev) => ({ ...prev, [partId]: null }))
  }

  return (
    <section className="page-grid">
      {/* Create / Edit form */}
      <article className={`card${speakingPartEditId ? ' editing' : ''}`}>
        <h3>{speakingPartEditId ? '✎ Edit Speaking Part' : 'Create Speaking Part'}</h3>
        <form onSubmit={saveSpeakingPart}>
          <div className="row two-col">
            <div>
              <label htmlFor="sp-number">Part Number (1–3)</label>
              <select
                id="sp-number"
                value={form.part_number}
                onChange={(e) => setForm((f) => ({ ...f, part_number: Number(e.target.value) }))}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div>
              <label htmlFor="sp-type">Question Type</label>
              <select
                id="sp-type"
                value={form.question_type}
                onChange={(e) => setForm((f) => ({ ...f, question_type: e.target.value }))}
              >
                {SPEAKING_QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <label htmlFor="sp-topic">Topic</label>
            <input
              id="sp-topic"
              type="text"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              required
            />
          </div>

          <div className="row">
            <label htmlFor="sp-prompt">Prompt</label>
            <textarea
              id="sp-prompt"
              rows={4}
              value={form.prompt}
              onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
              required
            />
          </div>

          <div className="row">
            <label htmlFor="sp-followup">
              Follow-up Questions <span className="muted">(one per line, optional)</span>
            </label>
            <textarea
              id="sp-followup"
              rows={3}
              value={followUpText}
              onChange={(e) => {
                const lines = e.target.value.split('\n')
                setForm((f) => ({ ...f, follow_up_questions: lines }))
              }}
              placeholder={'What do you think about…?\nCan you explain…?'}
            />
          </div>

          <div className="row">
            <label htmlFor="sp-time">Time Limit (seconds)</label>
            <input
              id="sp-time"
              type="number"
              min={1}
              value={form.time_limit_seconds}
              onChange={(e) => setForm((f) => ({ ...f, time_limit_seconds: Number(e.target.value) }))}
              required
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : speakingPartEditId ? 'Update Speaking Part' : 'Create Speaking Part'}
            </button>
            {speakingPartEditId && (
              <button type="button" className="btn-secondary" onClick={cancelSpeakingPartEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </article>

      {/* Server-fetched list */}
      <article className="card">
        <h3>Speaking Parts ({speakingParts.length})</h3>
        <div className="list">
          {speakingParts.length === 0 ? (
            <p className="empty-state">No speaking parts yet.</p>
          ) : (
            speakingParts.map((p) => {
              const id = getRecordId(p)
              const pendingFile = uploadFiles[id] ?? null
              return (
                <div key={id || Math.random()} className="list-item" style={{ flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div className="list-item-header">
                        <strong>Part {p.part_number}</strong>
                        <span className="badge badge-blue">{p.question_type?.replace(/_/g, ' ')}</span>
                      </div>
                      <p>
                        <strong>{p.topic}</strong> –{' '}
                        {p.prompt.length > 80 ? p.prompt.slice(0, 80) + '…' : p.prompt}
                      </p>
                      {p.follow_up_questions && p.follow_up_questions.length > 0 && (
                        <small className="muted">{p.follow_up_questions.length} follow-up question(s)</small>
                      )}
                      {p.audio_url && (
                        <div className="upload-current">
                          🔊 <a href={p.audio_url} target="_blank" rel="noreferrer">{p.audio_url.split('/').pop()?.slice(0, 40)}</a>
                        </div>
                      )}
                      <small className="muted">
                        {p.time_limit_seconds}s
                        {id && <> · ID: {id.slice(-8)}</>}
                      </small>
                    </div>
                    <div className="list-item-actions">
                      <button type="button" className="btn-small" onClick={() => startSpeakingPartEdit(p)} title="Edit">✎</button>
                      <button type="button" className="btn-small btn-danger" onClick={() => deleteSpeakingPart(id)} disabled={!id || busy} title="Delete">✕</button>
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
