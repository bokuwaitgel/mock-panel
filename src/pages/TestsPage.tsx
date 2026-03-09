import { useAdmin } from '../admin/AdminContext'
import { MODULE_TYPES } from '../admin/types'

export function TestsPage() {
  const {
    busy,
    tests,
    testForm: form,
    testEditId,
    setTestForm: setForm,
    saveTest,
    startTestEdit,
    cancelTestEdit,
    deleteTest,
    listeningSections,
    readingPassages,
    writingTasks,
    speakingParts,
    getRecordId,
  } = useAdmin()

  function toggleId(
    field: 'listening_section_ids' | 'reading_passage_ids' | 'writing_task_ids' | 'speaking_part_ids',
    id: string,
  ) {
    setForm((f) => {
      const list = f[field] ?? []
      return { ...f, [field]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] }
    })
  }

  const totalSelected =
    (form.listening_section_ids?.length ?? 0) +
    (form.reading_passage_ids?.length ?? 0) +
    (form.writing_task_ids?.length ?? 0) +
    (form.speaking_part_ids?.length ?? 0)

  const structurePolicy = {
    strict_ielts_format: form.structure_policy?.strict_ielts_format ?? false,
    enforce_global_40_questions: form.structure_policy?.enforce_global_40_questions ?? false,
    enforce_module_specific_rw: form.structure_policy?.enforce_module_specific_rw ?? false,
    expected_counts: form.structure_policy?.expected_counts,
  }

  const formMetadata = {
    form_code: form.form_metadata?.form_code ?? '',
    version: form.form_metadata?.version ?? '',
    source: form.form_metadata?.source ?? '',
  }

  return (
    <section className="page-grid">
      <article className={`card${testEditId ? ' editing' : ''}`}>
        <h3>{testEditId ? '✎ Edit Test' : 'Assemble Test'}</h3>
        <form onSubmit={saveTest}>
          <div className="row two-col">
            <div>
              <label htmlFor="t-title">Title</label>
              <input
                id="t-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="IELTS Academic Mock 1"
              />
            </div>
            <div>
              <label htmlFor="t-module">Module Type</label>
              <select
                id="t-module"
                value={form.module_type}
                onChange={(e) => setForm((f) => ({ ...f, module_type: e.target.value as 'academic' | 'general' }))}
              >
                {MODULE_TYPES.map((m) => (
                  <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <label htmlFor="t-desc">Description <span className="muted">(optional)</span></label>
            <textarea
              id="t-desc"
              rows={2}
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || '' }))}
              placeholder="Full-length IELTS practice test…"
            />
          </div>

          <div className="row">
            <label>Structure Policy</label>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={structurePolicy.strict_ielts_format}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    structure_policy: {
                      strict_ielts_format: e.target.checked,
                      enforce_global_40_questions: f.structure_policy?.enforce_global_40_questions ?? false,
                      enforce_module_specific_rw: f.structure_policy?.enforce_module_specific_rw ?? false,
                      expected_counts: f.structure_policy?.expected_counts,
                    },
                  }))}
                />
                Strict IELTS format (4/3/2/3)
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={structurePolicy.enforce_global_40_questions}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    structure_policy: {
                      strict_ielts_format: f.structure_policy?.strict_ielts_format ?? false,
                      enforce_global_40_questions: e.target.checked,
                      enforce_module_specific_rw: f.structure_policy?.enforce_module_specific_rw ?? false,
                      expected_counts: f.structure_policy?.expected_counts,
                    },
                  }))}
                />
                Enforce 40Q for Listening & Reading
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={structurePolicy.enforce_module_specific_rw}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    structure_policy: {
                      strict_ielts_format: f.structure_policy?.strict_ielts_format ?? false,
                      enforce_global_40_questions: f.structure_policy?.enforce_global_40_questions ?? false,
                      enforce_module_specific_rw: e.target.checked,
                      expected_counts: f.structure_policy?.expected_counts,
                    },
                  }))}
                />
                Enforce module-specific Reading/Writing override
              </label>
            </div>
          </div>

          <div className="row two-col">
            <div>
              <label htmlFor="t-total-duration">Total Duration (minutes)</label>
              <input
                id="t-total-duration"
                type="number"
                min={1}
                value={form.duration_policy?.total_duration_minutes ?? 164}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  duration_policy: {
                    total_duration_minutes: Number(e.target.value),
                    section_time_limits_minutes: {
                      listening: f.duration_policy?.section_time_limits_minutes?.listening ?? 40,
                      reading: f.duration_policy?.section_time_limits_minutes?.reading ?? 60,
                      writing: f.duration_policy?.section_time_limits_minutes?.writing ?? 60,
                    },
                  },
                }))}
              />
            </div>
            <div />
          </div>

          <div className="row three-col">
            <div>
              <label htmlFor="t-listening-min">Listening Minutes</label>
              <input
                id="t-listening-min"
                type="number"
                min={1}
                value={form.duration_policy?.section_time_limits_minutes?.listening ?? 40}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  duration_policy: {
                    total_duration_minutes: f.duration_policy?.total_duration_minutes ?? 164,
                    section_time_limits_minutes: {
                      listening: Number(e.target.value),
                      reading: f.duration_policy?.section_time_limits_minutes?.reading ?? 60,
                      writing: f.duration_policy?.section_time_limits_minutes?.writing ?? 60,
                    },
                  },
                }))}
              />
            </div>
            <div>
              <label htmlFor="t-reading-min">Reading Minutes</label>
              <input
                id="t-reading-min"
                type="number"
                min={1}
                value={form.duration_policy?.section_time_limits_minutes?.reading ?? 60}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  duration_policy: {
                    total_duration_minutes: f.duration_policy?.total_duration_minutes ?? 164,
                    section_time_limits_minutes: {
                      listening: f.duration_policy?.section_time_limits_minutes?.listening ?? 40,
                      reading: Number(e.target.value),
                      writing: f.duration_policy?.section_time_limits_minutes?.writing ?? 60,
                    },
                  },
                }))}
              />
            </div>
            <div>
              <label htmlFor="t-writing-min">Writing Minutes</label>
              <input
                id="t-writing-min"
                type="number"
                min={1}
                value={form.duration_policy?.section_time_limits_minutes?.writing ?? 60}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  duration_policy: {
                    total_duration_minutes: f.duration_policy?.total_duration_minutes ?? 164,
                    section_time_limits_minutes: {
                      listening: f.duration_policy?.section_time_limits_minutes?.listening ?? 40,
                      reading: f.duration_policy?.section_time_limits_minutes?.reading ?? 60,
                      writing: Number(e.target.value),
                    },
                  },
                }))}
              />
            </div>
          </div>

          <div className="row three-col">
            <div>
              <label htmlFor="t-form-code">Form Code</label>
              <input
                id="t-form-code"
                type="text"
                value={formMetadata.form_code}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  form_metadata: { ...(f.form_metadata ?? {}), form_code: e.target.value },
                }))}
              />
            </div>
            <div>
              <label htmlFor="t-version">Version</label>
              <input
                id="t-version"
                type="text"
                value={formMetadata.version}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  form_metadata: { ...(f.form_metadata ?? {}), version: e.target.value },
                }))}
              />
            </div>
            <div>
              <label htmlFor="t-source">Source</label>
              <input
                id="t-source"
                type="text"
                value={formMetadata.source}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  form_metadata: { ...(f.form_metadata ?? {}), source: e.target.value },
                }))}
              />
            </div>
          </div>

          <div className="test-pickers">
            <div className="picker-section">
              <div className="picker-header">
                <span className="picker-icon">🎧</span>
                <span className="picker-title">Listening Sections</span>
                <span className={`picker-count${(form.listening_section_ids?.length ?? 0) > 0 ? ' has-items' : ''}`}>
                  {form.listening_section_ids?.length ?? 0} selected
                </span>
              </div>
              {listeningSections.length === 0 ? (
                <p className="picker-empty">No listening sections created yet.</p>
              ) : (
                <div className="picker-grid">
                  {listeningSections.map((ls) => {
                    const id = getRecordId(ls)
                    const checked = (form.listening_section_ids ?? []).includes(id)
                    return (
                      <label key={id} className={`picker-card${checked ? ' selected' : ''}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleId('listening_section_ids', id)} />
                        <div className="picker-card-body">
                          <strong>Part {ls.part_number}</strong>
                          {ls.description && <span className="picker-detail">{ls.description.slice(0, 40)}</span>}
                          <span className="picker-meta">
                            {ls.questions?.length ?? ls.question_ids?.length ?? 0} questions
                            {ls.audio_url ? ' · 🔊' : ''}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="picker-section">
              <div className="picker-header">
                <span className="picker-icon">📖</span>
                <span className="picker-title">Reading Passages</span>
                <span className={`picker-count${(form.reading_passage_ids?.length ?? 0) > 0 ? ' has-items' : ''}`}>
                  {form.reading_passage_ids?.length ?? 0} selected
                </span>
              </div>
              {readingPassages.length === 0 ? (
                <p className="picker-empty">No reading passages created yet.</p>
              ) : (
                <div className="picker-grid">
                  {readingPassages.map((rp) => {
                    const id = getRecordId(rp)
                    const checked = (form.reading_passage_ids ?? []).includes(id)
                    return (
                      <label key={id} className={`picker-card${checked ? ' selected' : ''}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleId('reading_passage_ids', id)} />
                        <div className="picker-card-body">
                          <strong>Passage {rp.passage_number}</strong>
                          <span className="picker-detail">{rp.title.slice(0, 40)}</span>
                          <span className="picker-meta">
                            {rp.questions?.length ?? rp.question_ids?.length ?? 0} questions
                            {rp.source ? ` · ${rp.source.slice(0, 20)}` : ''}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="picker-section">
              <div className="picker-header">
                <span className="picker-icon">✍️</span>
                <span className="picker-title">Writing Tasks</span>
                <span className={`picker-count${(form.writing_task_ids?.length ?? 0) > 0 ? ' has-items' : ''}`}>
                  {form.writing_task_ids?.length ?? 0} selected
                </span>
              </div>
              {writingTasks.length === 0 ? (
                <p className="picker-empty">No writing tasks created yet.</p>
              ) : (
                <div className="picker-grid">
                  {writingTasks.map((wt) => {
                    const id = getRecordId(wt)
                    const checked = (form.writing_task_ids ?? []).includes(id)
                    return (
                      <label key={id} className={`picker-card${checked ? ' selected' : ''}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleId('writing_task_ids', id)} />
                        <div className="picker-card-body">
                          <strong>Task {wt.task_number}</strong>
                          <span className="picker-detail">{wt.question_type?.replace(/_/g, ' ')}</span>
                          <span className="picker-meta">
                            {wt.min_words} min words · {wt.time_limit_minutes} min
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="picker-section">
              <div className="picker-header">
                <span className="picker-icon">🗣️</span>
                <span className="picker-title">Speaking Parts</span>
                <span className={`picker-count${(form.speaking_part_ids?.length ?? 0) > 0 ? ' has-items' : ''}`}>
                  {form.speaking_part_ids?.length ?? 0} selected
                </span>
              </div>
              {speakingParts.length === 0 ? (
                <p className="picker-empty">No speaking parts created yet.</p>
              ) : (
                <div className="picker-grid">
                  {speakingParts.map((sp) => {
                    const id = getRecordId(sp)
                    const checked = (form.speaking_part_ids ?? []).includes(id)
                    return (
                      <label key={id} className={`picker-card${checked ? ' selected' : ''}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleId('speaking_part_ids', id)} />
                        <div className="picker-card-body">
                          <strong>Part {sp.part_number}</strong>
                          <span className="picker-detail">{sp.topic?.slice(0, 40)}</span>
                          <span className="picker-meta">
                            {sp.time_limit_seconds}s
                            {sp.follow_up_questions?.length ? ` · ${sp.follow_up_questions.length} follow-ups` : ''}
                            {sp.audio_url ? ' · 🔊' : ''}
                          </span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="test-summary">
            <span>🎧 {form.listening_section_ids?.length ?? 0}</span>
            <span>📖 {form.reading_passage_ids?.length ?? 0}</span>
            <span>✍️ {form.writing_task_ids?.length ?? 0}</span>
            <span>🗣️ {form.speaking_part_ids?.length ?? 0}</span>
            <strong>{totalSelected} total components</strong>
          </div>

          <div className="actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? (testEditId ? 'Updating…' : 'Creating…') : (testEditId ? 'Update Test' : 'Create Test')}
            </button>
            {testEditId && (
              <button type="button" className="btn-secondary" onClick={cancelTestEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </article>

      <article className="card">
        <h3>Tests ({tests.length})</h3>
        <div className="list">
          {tests.length === 0 ? (
            <p className="empty-state">No tests assembled yet.</p>
          ) : (
            tests.map((t) => {
              const id = getRecordId(t)
              const lc = t.listening_section_ids?.length ?? 0
              const rc = t.reading_passage_ids?.length ?? 0
              const wc = t.writing_task_ids?.length ?? 0
              const sc = t.speaking_part_ids?.length ?? 0
              return (
                <div key={id || Math.random()} className="list-item" style={{ flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div className="list-item-header">
                        <strong>{t.title}</strong>
                        <span className="badge badge-blue">{t.module_type}</span>
                        {t.structure_policy?.strict_ielts_format && <span className="badge">strict</span>}
                      </div>
                      {t.description && <p>{t.description}</p>}
                      {(t.form_metadata?.form_code || t.form_metadata?.version) && (
                        <small className="muted">
                          {t.form_metadata?.form_code ?? '—'} {t.form_metadata?.version ? `· v${t.form_metadata.version}` : ''}
                        </small>
                      )}
                    </div>
                    <div className="list-item-actions">
                      <button className="btn-small" onClick={() => startTestEdit(t)} title="Edit">✎</button>
                      <button className="btn-small btn-danger" onClick={() => deleteTest(id)} title="Delete" disabled={busy}>✕</button>
                    </div>
                  </div>
                  <div className="test-component-bar">
                    <div className={`test-component-chip${lc > 0 ? ' active' : ''}`}>🎧 {lc} Listening</div>
                    <div className={`test-component-chip${rc > 0 ? ' active' : ''}`}>📖 {rc} Reading</div>
                    <div className={`test-component-chip${wc > 0 ? ' active' : ''}`}>✍️ {wc} Writing</div>
                    <div className={`test-component-chip${sc > 0 ? ' active' : ''}`}>🗣️ {sc} Speaking</div>
                  </div>
                  {id && <small className="muted">ID: {id.slice(-8)}</small>}
                </div>
              )
            })
          )}
        </div>
      </article>
    </section>
  )
}
