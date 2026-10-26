import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

async function readBody(req) {
  let body = ''
  for await (const chunk of req) body += chunk
  return JSON.parse(body || '{}')
}

function studyMateApi() {
  return {
    name: 'studymate-api',
    configureServer(server) {
      server.middlewares.use('/api/study', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Use POST to send a study request.' }))
          return
        }

        try {
          const { topic, subject, level, action } = await readBody(req)
          const apiKey = process.env.GEMINI_API_KEY

          if (!apiKey) {
            throw new Error('GEMINI_API_KEY is missing from the Codespace environment.')
          }

          const prompt = `You are StudyMate AI, a helpful tutor.
Subject: ${subject || 'General'}
Student level: ${level || 'Beginner'}
Task: ${action || 'Explain'}
Topic: ${topic}
Give a clear, accurate, student-friendly response. For a quiz, include questions and answers.`

          const response = await fetch(
           'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey,
              },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            },
          )

          const data = await response.json()

          if (!response.ok) {
            console.error('Gemini API error:', data)
            res.statusCode = 502
            res.end(JSON.stringify({
              error: data.error?.message || 'Gemini could not answer. Check your API key and project access.',
            }))
            return
          }

          const result = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || '')
            .join('\n')

          res.end(JSON.stringify({
            result: result || 'Gemini returned no text. Please try again.',
          }))
        } catch (error) {
          console.error('StudyMate API error:', error)
          res.statusCode = 500
          res.end(JSON.stringify({
            error: error.message || 'Something went wrong.',
          }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), studyMateApi()],
})