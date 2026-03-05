import { useAdmin } from '../admin/AdminContext'
import { QUESTION_TYPES } from '../admin/types'
import type { OptionItem } from '../admin/types'

/* Types that need an options list */
const TYPES_WITH_OPTIONS = new Set([
  'multiple_choice',
  'matching',
  'matching_information',
  'matching_headings',
  'matching_features',
  'matching_sentence_endings',
])

const NEXT_KEY = (opts: OptionItem[]) => {
  const used = new Set(opts.map((o) => o.key))
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (!used.has(ch)) return ch
  }
  return String(opts.length + 1)
}

export function QuestionsPage() {
  const {
    busy,
    questions,
    questionForm,
    setQuestionForm,
    questionSection,
    setQuestionSection,
    questionEditId,
    saveQuestion,
    cancelQuestionEdit,
    startQuestionEdit,
    deleteQuestion,
    getRecordId,
  } = useAdmin()

  const needsOptions = TYPES_WITH_OPTIONS.has(questionForm.question_type)

  /* ── Option helpers ─────────────────────── */
  function addOption() {
    const current = questionForm.options ?? []
    setQuestionForm((f) => ({
      ...f,
      options: [...current, { key: NEXT_KEY(current), text: '' }],
    }))
  }

  function updateOption(idx: number, field: 'key' | 'text', value: string) {
    setQuestionForm((f) => {
      const opts = [...(f.options ?? [])]
      opts[idx] = { ...opts[idx], [field]: value }
      return { ...f, options: opts }
    })
  }

  function removeOption(idx: number) {
    setQuestionForm((f) => ({
      ...f,
      options: (f.options ?? []).filter((_, i) => i !== idx),
    }))
  }

  return (
    <section className="page-grid">
      {/* ─── Create / Edit form ─── */}
      <article className={`card${questionEditId ? ' editing' : ''}`}>
        <h3>{questionEditId ? '✎ Edit Question' : 'Create Question'}</h3>

        <form onSubmit={saveQuestion}>
          {/* ── Basic Info ── */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="section-icon">📋</span> Basic Info
            </div>

            <div className="row three-col">
              <div>
                <label htmlFor="q-section">Section</label>
                <select
                  id="q-section"
                  value={questionSection}
                  onChange={(e) =>
                    setQuestionSection(e.target.value as 'listening' | 'reading')
                  }
                  disabled={!!questionEditId}
                >
                  <option value="listening">🎧 Listening</option>
                  <option value="reading">📖 Reading</option>
                </select>
                {questionEditId && (
                  <span className="field-hint">Cannot change section when editing</span>
                )}
              </div>
              <div>
                <label htmlFor="q-type">Question Type</label>
                <select
                  id="q-type"
                  value={questionForm.question_type}
                  onChange={(e) =>
                    setQuestionForm((f) => ({
                      ...f,
                      question_type: e.target.value,
                      // Reset options when switching away from MCQ types
                      options: TYPES_WITH_OPTIONS.has(e.target.value) ? f.options : undefined,
                    }))
                  }
                  required
                >
                  {QUESTION_TYPES.map((qt) => (
                    <option key={qt} value={qt}>
                      {qt.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="q-number">Question #</label>
                <input
                  id="q-number"
                  type="number"
                  min={1}
                  value={questionForm.question_number}
                  onChange={(e) =>
                    setQuestionForm((f) => ({
                      ...f,
                      question_number: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="section-icon">📝</span> Content
            </div>

            <div className="row">
              <label htmlFor="q-instructions">
                Instructions <span className="muted">(optional)</span>
              </label>
              <input
                id="q-instructions"
                value={questionForm.instructions ?? ''}
                onChange={(e) =>
                  setQuestionForm((f) => ({
                    ...f,
                    instructions: e.target.value || undefined,
                  }))
                }
                placeholder="e.g. Choose the correct letter, A, B, C or D…"
              />
            </div>

            <div className="row">
              <label htmlFor="q-text">Question Text</label>
              <textarea
                id="q-text"
                rows={3}
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm((f) => ({
                    ...f,
                    question_text: e.target.value,
                  }))
                }
                required
                placeholder="Enter the question stem…"
              />
            </div>

            {/* Options builder – only for MCQ-like types */}
            {needsOptions && (
              <div className="row field-conditional">
                <label>
                  Answer Options ({(questionForm.options ?? []).length})
                </label>
                <div className="options-builder">
                  {(questionForm.options ?? []).map((opt, idx) => (
                    <div key={idx} className="option-row">
                      <span className="option-key">{opt.key}</span>
                      <input
                        value={opt.text}
                        onChange={(e) => updateOption(idx, 'text', e.target.value)}
                        placeholder={`Option ${opt.key} text…`}
                      />
                      <button
                        type="button"
                        className="option-remove"
                        onClick={() => removeOption(idx)}
                        title="Remove option"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-option-btn" onClick={addOption}>
                    + Add Option
                  </button>
                </div>
                <span className="field-hint">
                  Add answer choices. Keys are auto-assigned (A, B, C…).
                </span>
              </div>
            )}
          </div>

          {/* ── Answer & Scoring ── */}
          <div className="form-section">
            <div className="form-section-label">
              <span className="section-icon">✅</span> Answer &amp; Scoring
            </div>

            <div className="row two-col">
              <div>
                <label htmlFor="q-correct">
                  Correct Answer <span className="muted">(hidden from students)</span>
                </label>
                <input
                  id="q-correct"
                  value={
                    questionForm.correct_answer !== undefined &&
                    questionForm.correct_answer !== null
                      ? String(questionForm.correct_answer)
                      : ''
                  }
                  onChange={(e) =>
                    setQuestionForm((f) => ({
                      ...f,
                      correct_answer: e.target.value || undefined,
                    }))
                  }
                  placeholder={needsOptions ? 'e.g. B' : 'e.g. True, 42, Cambridge…'}
                />
              </div>
              <div>
                <label htmlFor="q-points">Points</label>
                <input
                  id="q-points"
                  type="number"
                  step="0.5"
                  min={0}
                  value={questionForm.points}
                  onChange={(e) =>
                    setQuestionForm((f) => ({
                      ...f,
                      points: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="row two-col">
              <div>
                <label htmlFor="q-maxwords">
                  Max Words <span className="muted">(short answer types)</span>
                </label>
                <input
                  id="q-maxwords"
                  type="number"
                  min={1}
                  value={questionForm.max_words ?? ''}
                  onChange={(e) =>
                    setQuestionForm((f) => ({
                      ...f,
                      max_words: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="e.g. 3"
                />
              </div>
              <div />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="actions" style={{ marginTop: 8 }}>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy
                ? 'Saving…'
                : questionEditId
                  ? 'Update Question'
                  : 'Create Question'}
            </button>
            {questionEditId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={cancelQuestionEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </article>

      {/* ─── Question list ─── */}
      <article className="card">
        <h3>Question Bank ({questions.length})</h3>
        <div className="list">
          {questions.length === 0 && (
            <p className="empty-state">
              No questions yet — create one using the form.
            </p>
          )}
          {questions.map((item) => {
            const id = getRecordId(item)
            return (
              <div key={id || Math.random()} className="list-item">
                <div style={{ flex: 1 }}>
                  <div className="list-item-header">
                    <strong>#{item.question_number}</strong>
                    <span className="badge">
                      {item.question_type.replace(/_/g, ' ')}
                    </span>
                    {item.section && (
                      <span className="badge badge-blue">
                        {item.section === 'listening' ? '🎧' : '📖'} {item.section}
                      </span>
                    )}
                    <span className="muted">{item.points} pts</span>
                  </div>
                  <p>{item.question_text}</p>
                  {item.options && item.options.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                      {item.options.map((o) => (
                        <span key={o.key} className="badge" style={{ fontWeight: 400, textTransform: 'none' }}>
                          <strong>{o.key}</strong>&nbsp;{o.text.length > 25 ? o.text.slice(0, 25) + '…' : o.text}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.instructions && (
                    <p className="muted" style={{ marginTop: 2 }}>
                      ℹ {item.instructions}
                    </p>
                  )}
                  {id && <small className="muted">ID: {id.slice(-8)}</small>}
                </div>
                <div className="list-item-actions">
                  <button
                    type="button"
                    className="btn-small"
                    onClick={() => startQuestionEdit(item)}
                    title="Edit"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="btn-small btn-danger"
                    onClick={() => deleteQuestion(id)}
                    disabled={!id || busy}
                    title="Delete"
                  >
                    ✕
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
