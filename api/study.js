export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topic, subject, level, action } = req.body

    if (!topic?.trim()) {
      return res.status(400).json({ error: 'Please enter a topic.' })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured.'
      })
    }

    const prompt = `You are StudyMate AI, a helpful computer science tutor.

Subject: ${subject || 'General'}
Student level: ${level || 'Beginner'}
Task: ${action || 'Explain'}
Topic: ${topic}

Give a clear, accurate, student-friendly response.

If the task is Explain, teach the topic step by step using simple language and examples.
If the task is Examples, give practical examples.
If the task is Quiz, create useful practice questions and answers.
If the task is Summarize, provide a concise summary of the most important points.`

    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent'

    let response
    let data

    // Try up to 3 times for temporary Gemini 503/429 errors
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      })

      data = await response.json()

      if (response.ok) {
        break
      }

      if (response.status !== 503 && response.status !== 429) {
        break
      }

      if (attempt < 2) {
        await new Promise(resolve =>
          setTimeout(resolve, 1500 * Math.pow(2, attempt))
        )
      }
    }

    if (!response.ok) {
      console.error('Gemini API error:', data)

      return res.status(502).json({
        error:
          data.error?.message ||
          'Gemini is temporarily unavailable. Please try again.'
      })
    }

    const result = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('\n')

    return res.status(200).json({
      result:
        result ||
        'Gemini returned no answer. Please try again.'
    })
  } catch (error) {
    console.error('StudyMate error:', error)

    return res.status(500).json({
      error: error.message || 'Something went wrong.'
    })
  }
}