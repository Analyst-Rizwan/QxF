/**
 * EduAI School — Backend API Client
 * All frontend ↔ FastAPI communication goes through here.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ── Code Execution ──

export interface RunResult {
  output: string
  error: string | null
  timeout: boolean
}

export async function runCode(code: string, inputs?: string[]): Promise<RunResult> {
  try {
    const res = await fetch(`${API_BASE}/school/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, inputs }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { output: '', error: err.detail || `Server error (${res.status})`, timeout: false }
    }
    return await res.json()
  } catch {
    return { output: '', error: '⚠️ Could not connect to code server. Is the backend running?', timeout: false }
  }
}

// ── Enrollment ──

export async function validateBatchCode(batchCode: string) {
  try {
    const res = await fetch(`${API_BASE}/school/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch_code: batchCode }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null // Offline — let frontend validation handle it
  }
}

// ── Student Profile ──

export async function saveProfileToServer(studentId: string, name: string, batchCode: string, batchName: string) {
  try {
    await fetch(`${API_BASE}/school/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id: studentId, name, batch_code: batchCode, batch_name: batchName }),
    })
  } catch {
    // Offline — fail silently, localStorage is primary
  }
}

// ── Progress ──

export interface ProgressPayload {
  student_id: string
  module_slug: string
  stages_completed: string[]
  current_stage: number
  quiz_score?: number
  challenges_completed?: number
  completed_at?: string
}

export async function saveProgressToServer(data: ProgressPayload) {
  try {
    await fetch(`${API_BASE}/school/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    // Offline — localStorage is primary
  }
}

export async function loadProgressFromServer(studentId: string) {
  try {
    const res = await fetch(`${API_BASE}/school/progress/${studentId}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// ── XP ──

export interface XPPayload {
  student_id: string
  total_xp: number
  level: number
  level_name: string
  streak_days: number
  last_active_date: string
  unlocked_achievements: string[]
}

export async function saveXPToServer(data: XPPayload) {
  try {
    await fetch(`${API_BASE}/school/xp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    // Offline
  }
}

// ── Dashboard ──

export async function fetchDashboard(batchCode?: string) {
  try {
    const url = batchCode
      ? `${API_BASE}/school/dashboard?batch_code=${batchCode}`
      : `${API_BASE}/school/dashboard`
    const res = await fetch(url)
    if (!res.ok) throw new Error('API error')
    return await res.json()
  } catch {
    return null
  }
}

// ── Health ──

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}

// ── Judge0 Code Execution ──

export interface J0ExecuteRequest {
  source_code: string
  language_id: number
  stdin?: string
}

export interface J0ExecuteResponse {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  status: { id: number; description: string }
  time: string | null
  memory: number | null
  token: string | null
}

export const codeApi = {
  execute: async (data: J0ExecuteRequest): Promise<J0ExecuteResponse> => {
    const res = await fetch(`${API_BASE}/code/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || `Execution error (${res.status})`)
    }
    return res.json()
  },

  getLanguages: async (): Promise<{ id: number; name: string }[]> => {
    const res = await fetch(`${API_BASE}/code/languages`)
    if (!res.ok) throw new Error('Failed to fetch languages')
    return res.json()
  },
}
