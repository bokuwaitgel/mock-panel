export function HskPage() {
  return (
    <section className="page-grid">
      <article className="card coming-soon-card" style={{ gridColumn: '1 / -1' }}>
        <div className="coming-soon-hero">
          <div className="coming-soon-icon">汉</div>
          <h2>HSK — Coming Soon</h2>
          <p>
            Full support for HSK (Hanyu Shuiping Kaoshi) exam preparation is currently under development.
          </p>
          <div className="coming-soon-features">
            <div className="feature-pill">
              <strong>HSK 1–6</strong>
              <span>All levels</span>
            </div>
            <div className="feature-pill">
              <strong>Vocabulary</strong>
              <span>Word banks</span>
            </div>
            <div className="feature-pill">
              <strong>Listening</strong>
              <span>Audio drills</span>
            </div>
            <div className="feature-pill">
              <strong>Reading</strong>
              <span>Comprehension</span>
            </div>
            <div className="feature-pill">
              <strong>Writing</strong>
              <span>Characters</span>
            </div>
            <div className="feature-pill">
              <strong>Mock Tests</strong>
              <span>Full exams</span>
            </div>
          </div>
          <div className="coming-soon-timeline">
            <div className="timeline-step done">
              <div className="timeline-dot" />
              <span>Planning</span>
            </div>
            <div className="timeline-bar done" />
            <div className="timeline-step active">
              <div className="timeline-dot" />
              <span>Design</span>
            </div>
            <div className="timeline-bar" />
            <div className="timeline-step">
              <div className="timeline-dot" />
              <span>Development</span>
            </div>
            <div className="timeline-bar" />
            <div className="timeline-step">
              <div className="timeline-dot" />
              <span>Launch</span>
            </div>
          </div>
        </div>
      </article>

      {/* HSK Level breakdown cards */}
      <article className="card">
        <h3>HSK 1–3 <span className="badge badge-soon">Planned</span></h3>
        <div className="hsk-level-list">
          <div className="hsk-level">
            <strong>HSK 1</strong>
            <span className="muted">150 words · Basic phrases</span>
          </div>
          <div className="hsk-level">
            <strong>HSK 2</strong>
            <span className="muted">300 words · Simple sentences</span>
          </div>
          <div className="hsk-level">
            <strong>HSK 3</strong>
            <span className="muted">600 words · Daily communication</span>
          </div>
        </div>
      </article>

      <article className="card">
        <h3>HSK 4–6 <span className="badge badge-soon">Planned</span></h3>
        <div className="hsk-level-list">
          <div className="hsk-level">
            <strong>HSK 4</strong>
            <span className="muted">1200 words · Wide range of topics</span>
          </div>
          <div className="hsk-level">
            <strong>HSK 5</strong>
            <span className="muted">2500 words · News &amp; formal writing</span>
          </div>
          <div className="hsk-level">
            <strong>HSK 6</strong>
            <span className="muted">5000+ words · Near-fluency</span>
          </div>
        </div>
      </article>
    </section>
  )
}
