/**
 * AI Tutor — SSE Streaming Client
 * Streams from FastAPI backend /chat/stream endpoint.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface StreamOptions {
  conversation_id?: number | null
  student_id?: string
  module_title?: string
  module_slug?: string
}

export async function streamMessageFromSchoolAI(
  message: string,
  onDelta: (text: string) => void,
  onDone: (fullText: string, conversationId: number | null) => void,
  options: StreamOptions = {}
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/school/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        student_id: options.student_id || localStorage.getItem('eduai_student_id') || 'anon',
        conversation_id: options.conversation_id ?? null,
        module_title: options.module_title ?? null,
        module_slug: options.module_slug ?? null,
      }),
    })

    if (!response.ok) {
      onDelta('Sorry, I couldn\'t connect to the AI service. Try again in a moment.')
      onDone('Sorry, I couldn\'t connect to the AI service. Try again in a moment.', null)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onDelta('Connection error.')
      onDone('Connection error.', null)
      return
    }

    const decoder = new TextDecoder()
    let fullText = ''
    let conversationId: number | null = null
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) continue

        try {
          const event = JSON.parse(jsonStr)

          if (event.type === 'conv' && event.conversation_id != null) {
            conversationId = event.conversation_id
          } else if (event.type === 'delta' && event.text) {
            fullText += event.text
            onDelta(event.text)
          } else if (event.type === 'done') {
            fullText = event.full_text || fullText
          } else if (event.type === 'error') {
            onDelta(`\n\n⚠️ ${event.message}`)
          }
        } catch {
          // skip malformed events
        }
      }
    }

    onDone(fullText, conversationId)
  } catch {
    onDelta('⚠️ Could not connect to the AI Tutor. Is the backend running on port 8000?')
    onDone('Could not connect to the AI Tutor.', null)
  }
}
