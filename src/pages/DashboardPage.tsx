import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../admin/AdminContext'

/* ── helpers ──────────────────────────────── */

/** Count occurrences of each value for a given key */
function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const map: Record<string, number> = {}
  for (const item of arr) {
    const k = key(item)
    map[k] = (map[k] ?? 0) + 1
  }
  return map
}

const BAR_COLORS = [
  '#6366f1', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#64748b',
  '#3b82f6', '#a855f7', '#22c55e', '#e11d48', '#0ea5e9',
  '#84cc16', '#d946ef',
]

const STATUS_COLORS: Record<string, string> = {
  started: '#f59e0b',
  in_progress: '#3b82f6',
  submitted: '#8b5cf6',
  graded: '#10b981',
  finalized: '#06b6d4',
  cancelled: '#ef4444',
}

const ROLE_COLORS: Record<string, string> = {
  candidate: '#3b82f6',
  examiner: '#8b5cf6',
  admin: '#ef4444',
}

/* ── component ────────────────────────────── */

export function DashboardPage() {
  const {
    questions,
    listeningSections,
    readingPassages,
    writingTasks,
    speakingParts,
    tests,
    sessions,
    users,
    formatDate,
    getRecordId,
  } = useAdmin()

  /* derived data */
  const qByType = useMemo(() => countBy(questions, (q) => q.question_type), [questions])
  const qBySection = useMemo(() => countBy(questions, (q) => q.section || 'unassigned'), [questions])
  const sByStatus = useMemo(() => countBy(sessions, (s) => s.status || 'unknown'), [sessions])
  const uByRole = useMemo(() => countBy(users, (u) => u.role), [users])

  const maxQType = Math.max(1, ...Object.values(qByType))
  const totalSessions = Math.max(1, sessions.length)
  const totalUsers = Math.max(1, users.length)

  return (
    <section className="dash-grid">
      {/* ── IELTS Section Header ── */}
      <article className="card card-full section-header-card">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">
              <span className="section-icon">🇬🇧</span> IELTS
            </h3>
            <p className="muted">International English Language Testing System</p>
          </div>
          <div className="section-header-stats">
            <span><strong>{questions.length}</strong> Questions</span>
            <span><strong>{tests.length}</strong> Tests</span>
            <span><strong>{sessions.length}</strong> Sessions</span>
          </div>
        </div>
      </article>

      {/* ── IELTS Stats ── */}
      <article className="card card-full">
        <h3>IELTS Overview</h3>
        <div className="stats-grid stats-grid-wide">
          <Link to="/questions" className="stat-card">
            <span>Questions</span>
            <strong>{questions.length}</strong>
          </Link>
          <Link to="/listening" className="stat-card">
            <span>Listening</span>
            <strong>{listeningSections.length}</strong>
          </Link>
          <Link to="/reading" className="stat-card">
            <span>Reading</span>
            <strong>{readingPassages.length}</strong>
          </Link>
          <Link to="/writing" className="stat-card">
            <span>Writing</span>
            <strong>{writingTasks.length}</strong>
          </Link>
          <Link to="/speaking" className="stat-card">
            <span>Speaking</span>
            <strong>{speakingParts.length}</strong>
          </Link>
          <Link to="/tests" className="stat-card">
            <span>Tests</span>
            <strong>{tests.length}</strong>
          </Link>
          <Link to="/sessions" className="stat-card">
            <span>Sessions</span>
            <strong>{sessions.length}</strong>
          </Link>
          <Link to="/users" className="stat-card">
            <span>Users</span>
            <strong>{users.length}</strong>
          </Link>
        </div>
      </article>

      {/* ── Question Type Distribution ── */}
      <article className="card">
        <h3>Questions by Type</h3>
        {Object.keys(qByType).length === 0 ? (
          <p className="empty-state">No questions yet.</p>
        ) : (
          <div className="bar-chart">
            {Object.entries(qByType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count], i) => (
                <div key={type} className="bar-row">
                  <span className="bar-label">{type.replace(/_/g, ' ')}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(count / maxQType) * 100}%`,
                        background: BAR_COLORS[i % BAR_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="bar-value">{count}</span>
                </div>
              ))}
          </div>
        )}
      </article>

      {/* ── Questions by Section (ring chart) ── */}
      <article className="card">
        <h3>Questions by Section</h3>
        {questions.length === 0 ? (
          <p className="empty-state">No questions yet.</p>
        ) : (
          <div className="ring-chart-wrap">
            <RingChart
              segments={Object.entries(qBySection).map(([label, count]) => ({
                label,
                value: count,
                color: label === 'listening' ? '#06b6d4' : label === 'reading' ? '#8b5cf6' : '#94a3b8',
              }))}
              total={questions.length}
              centerLabel="Total"
            />
            <div className="ring-legend">
              {Object.entries(qBySection).map(([label, count]) => (
                <div key={label} className="legend-item">
                  <span
                    className="legend-dot"
                    style={{
                      background:
                        label === 'listening' ? '#06b6d4' : label === 'reading' ? '#8b5cf6' : '#94a3b8',
                    }}
                  />
                  <span className="legend-label">{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* ── Session Status ── */}
      <article className="card">
        <h3>Sessions by Status</h3>
        {sessions.length === 0 ? (
          <p className="empty-state">No sessions yet.</p>
        ) : (
          <>
            {/* stacked bar */}
            <div className="stacked-bar">
              {Object.entries(sByStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="stacked-segment"
                  style={{
                    width: `${(count / totalSessions) * 100}%`,
                    background: STATUS_COLORS[status] ?? '#94a3b8',
                  }}
                  title={`${status}: ${count}`}
                />
              ))}
            </div>
            <div className="ring-legend" style={{ marginTop: 12 }}>
              {Object.entries(sByStatus).map(([status, count]) => (
                <div key={status} className="legend-item">
                  <span className="legend-dot" style={{ background: STATUS_COLORS[status] ?? '#94a3b8' }} />
                  <span className="legend-label">{status.replace(/_/g, ' ')}</span>
                  <strong>{count}</strong>
                  <span className="muted">({Math.round((count / totalSessions) * 100)}%)</span>
                </div>
              ))}
            </div>
          </>
        )}
      </article>

      {/* ── User Roles ── */}
      <article className="card">
        <h3>Users by Role</h3>
        {users.length === 0 ? (
          <p className="empty-state">No users yet.</p>
        ) : (
          <>
            <div className="stacked-bar">
              {Object.entries(uByRole).map(([role, count]) => (
                <div
                  key={role}
                  className="stacked-segment"
                  style={{
                    width: `${(count / totalUsers) * 100}%`,
                    background: ROLE_COLORS[role] ?? '#94a3b8',
                  }}
                  title={`${role}: ${count}`}
                />
              ))}
            </div>
            <div className="ring-legend" style={{ marginTop: 12 }}>
              {Object.entries(uByRole).map(([role, count]) => (
                <div key={role} className="legend-item">
                  <span className="legend-dot" style={{ background: ROLE_COLORS[role] ?? '#94a3b8' }} />
                  <span className="legend-label">{role}</span>
                  <strong>{count}</strong>
                  <span className="muted">({Math.round((count / totalUsers) * 100)}%)</span>
                </div>
              ))}
            </div>
          </>
        )}
      </article>

      {/* ── Test Composition ── */}
      <article className="card">
        <h3>Test Composition</h3>
        {tests.length === 0 ? (
          <p className="empty-state">No tests assembled yet.</p>
        ) : (
          <div className="list" style={{ maxHeight: 320 }}>
            {tests.map((t) => {
              const id = getRecordId(t)
              const parts = [
                { label: 'L', count: t.listening_section_ids?.length ?? 0, color: '#06b6d4' },
                { label: 'R', count: t.reading_passage_ids?.length ?? 0, color: '#8b5cf6' },
                { label: 'W', count: t.writing_task_ids?.length ?? 0, color: '#f59e0b' },
                { label: 'S', count: t.speaking_part_ids?.length ?? 0, color: '#10b981' },
              ]
              const totalParts = parts.reduce((s, p) => s + p.count, 0) || 1
              return (
                <div key={id || Math.random()} className="list-item">
                  <div style={{ flex: 1 }}>
                    <div className="list-item-header">
                      <strong>{t.title}</strong>
                      <span className="badge badge-blue">{t.module_type}</span>
                    </div>
                    {/* mini stacked bar */}
                    <div className="stacked-bar" style={{ marginTop: 8, height: 10 }}>
                      {parts.map((p) =>
                        p.count > 0 ? (
                          <div
                            key={p.label}
                            className="stacked-segment"
                            style={{
                              width: `${(p.count / totalParts) * 100}%`,
                              background: p.color,
                            }}
                            title={`${p.label}: ${p.count}`}
                          />
                        ) : null,
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                      {parts.map((p) => (
                        <span key={p.label} style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>
                          {p.label}: {p.count}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <Link to="/tests" className="text-link" style={{ marginTop: 8, display: 'inline-block' }}>
          Manage tests →
        </Link>
      </article>

      {/* ── Recent Sessions ── */}
      <article className="card">
        <h3>Recent Sessions</h3>
        <div className="list compact">
          {sessions.length === 0 && <p className="empty-state">No sessions yet.</p>}
          {sessions.slice(0, 6).map((s) => (
            <div key={getRecordId(s) || Math.random()} className="list-item compact-item">
              <div>
                <div className="list-item-header">
                  <strong>{(s.test_type || 'ielts').toUpperCase()}</strong>
                  <span
                    className={`badge ${s.status === 'graded' ? 'badge-green' : s.status === 'submitted' ? 'badge-blue' : ''}`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="muted">{formatDate(s.started_at)}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/sessions" className="text-link">View all sessions →</Link>
      </article>

      {/* ── Recent Questions ── */}
      <article className="card">
        <h3>Recent Questions</h3>
        <div className="list compact">
          {questions.length === 0 && <p className="empty-state">No questions yet.</p>}
          {questions.slice(0, 6).map((q) => (
            <div key={getRecordId(q) || Math.random()} className="list-item compact-item">
              <div>
                <div className="list-item-header">
                  <strong>#{q.question_number}</strong>
                  <span className="badge">{q.question_type.replace(/_/g, ' ')}</span>
                  {q.section && <span className="badge badge-blue">{q.section}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/questions" className="text-link">View all questions →</Link>
      </article>

      {/* ── HSK Section ── */}
      <article className="card card-full section-header-card hsk-section">
        <div className="section-header-row">
          <div>
            <h3 className="section-title">
              <span className="section-icon">🇨🇳</span> HSK
            </h3>
            <p className="muted">Hanyu Shuiping Kaoshi — Chinese Proficiency Test</p>
          </div>
          <Link to="/hsk" className="badge badge-soon badge-lg">Coming Soon</Link>
        </div>
        <div className="hsk-preview-grid">
          {['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map((lvl) => (
            <div key={lvl} className="hsk-preview-card">
              <strong>{lvl}</strong>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '0%', background: '#ef4444' }} />
              </div>
              <span className="muted">0%</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

/* ── SVG Ring Chart ───────────────────────── */

type Segment = { label: string; value: number; color: string }

function RingChart({ segments, total, centerLabel }: { segments: Segment[]; total: number; centerLabel: string }) {
  const size = 140
  const strokeWidth = 22
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ring-svg">
      {/* background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      {segments.map((seg) => {
        const pct = seg.value / total
        const dashLen = pct * circumference
        const dashGap = circumference - dashLen
        const el = (
          <circle
            key={seg.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLen} ${dashGap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dasharray 0.4s, stroke-dashoffset 0.4s' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )
        offset += dashLen
        return el
      })}
      <text x="50%" y="46%" textAnchor="middle" fontSize="26" fontWeight="700" fill="#111827">
        {total}
      </text>
      <text x="50%" y="62%" textAnchor="middle" fontSize="10" fill="#6b7280" style={{ textTransform: 'uppercase' }}>
        {centerLabel}
      </text>
    </svg>
  )
}
