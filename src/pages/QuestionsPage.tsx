import { useAdmin } from '../admin/AdminContext'

export function QuestionsPage() {
  const {
    busy,
    questions,
    questionForm,
    setQuestionForm,
    questionEditId,
    saveQuestion,
    cancelQuestionEdit,
    startQuestionEdit,
    deleteQuestion,
    getRecordId,
  } = useAdmin()

  return (
    <section className="page-grid">
      <article className="card">
        <h3>{questionEditId ? 'Edit Question' : 'Create Question'}</h3>
        <form onSubmit={saveQuestion}>
          <div className="row">
            <label htmlFor="question-title">Title</label>
            <input
              id="question-title"
              value={questionForm.title}
              onChange={(event) => setQuestionForm((old) => ({ ...old, title: event.target.value }))}
              required
            />
          </div>
          <div className="row">
            <label htmlFor="question-text">Question Text</label>
            <textarea
              id="question-text"
              value={questionForm.text}
              onChange={(event) => setQuestionForm((old) => ({ ...old, text: event.target.value }))}
              rows={5}
              required
            />
          </div>
          <div className="row two-col">
            <div>
              <label htmlFor="question-answer">Answer</label>
              <input
                id="question-answer"
                value={questionForm.answer}
                onChange={(event) => setQuestionForm((old) => ({ ...old, answer: event.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="question-category">Category</label>
              <input
                id="question-category"
                value={questionForm.category}
                onChange={(event) => setQuestionForm((old) => ({ ...old, category: event.target.value }))}
              />
            </div>
          </div>

          <div className="actions">
            <button type="submit" disabled={busy}>
              {busy ? 'Saving...' : `${questionEditId ? 'Update' : 'Create'} Question`}
            </button>
            {questionEditId ? (
              <button type="button" onClick={cancelQuestionEdit}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="card">
        <h3>Question List</h3>
        <div className="list">
          {questions.length === 0 ? <p className="empty-state">No questions yet.</p> : null}
          {questions.map((item) => {
            const id = getRecordId(item)
            return (
              <div key={id || item.title} className="list-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
                <div className="actions">
                  <button type="button" onClick={() => startQuestionEdit(item)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteQuestion(id)} disabled={!id || busy}>
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
