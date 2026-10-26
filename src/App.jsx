import { useState } from 'react'
import './App.css'

function App() {
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('Beginner')
  const [subject, setSubject] = useState('General')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function study(action) {
    if (!topic.trim()) {
      setResult('Please enter a topic first.')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/study', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic,
          subject,
          level,
          action
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'AI service unavailable.')
      }

      setResult(data.result)
    } catch (error) {
      setResult(`AI error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">✦</span> StudyMate AI
        </div>
        <span className="tag">YOUR PERSONAL AI TUTOR</span>
      </header>

      <section className="hero">
        <div className="eyebrow">LEARN SMARTER WITH AI</div>

        <h1>
          Big topics.
          <br />
          <span>Clear answers.</span>
        </h1>

        <p>
          Turn difficult subjects into simple explanations, useful examples
          and practice questions tailored to you.
        </p>
      </section>

      <section className="workspace">
        <div className="panel">
          <label htmlFor="topic">What do you want to learn today?</label>

          <textarea
            id="topic"
            placeholder="Try: How does the internet work?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="selectors">
            <div>
              <label htmlFor="subject">Subject</label>

              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {[
                  'General',
                  'Mathematics',
                  'Biology',
                  'Chemistry',
                  'Physics',
                  'Computer Science'
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level">Study level</label>

              <select
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                {['Beginner', 'Intermediate', 'Advanced'].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="actions">
            <button onClick={() => study('Explain')}>
              ✦ Explain with AI
            </button>

            <button
              className="secondary"
              onClick={() => study('Examples')}
            >
              Examples
            </button>

            <button
              className="secondary"
              onClick={() => study('Quiz')}
            >
              Practice quiz
            </button>

            <button
              className="secondary"
              onClick={() => study('Summarize')}
            >
              Summarize
            </button>
          </div>
        </div>

        <div className="result-panel">
          <div className="result-heading">
            <span className="result-icon">✧</span>

            <div>
              <h2>Your learning space</h2>
              <p>Personalized for your level</p>
            </div>
          </div>

          <div className="result-content">
            {loading ? (
              <p>Preparing your learning material...</p>
            ) : result ? (
              <p className="answer">{result}</p>
            ) : (
              <div className="empty">
                <span>✦</span>
                <h3>Your next discovery starts here.</h3>
                <p>
                  Enter a topic and choose an AI learning tool to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer>
        StudyMate AI · Making learning clearer, one topic at a time.
      </footer>
    </main>
  )
}

export default App