/**
 * EduAI School — Backend API Client
 * DB-backed routes removed — profile/progress/XP live in localStorage on the frontend.
 * Backend handles: health, code execution (Judge0), batch enrollment, AI chat stream.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// ── Code Execution (sandboxed Python) ──

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

// ── Student Profile (localStorage only — no server call) ──

export async function saveProfileToServer(
  _studentId: string, _name: string, _batchCode: string, _batchName: string
) {
  // No-op: profile is stored in localStorage by the frontend
}

// ── Progress (localStorage only — no server call) ──

export interface ProgressPayload {
  student_id: string
  module_slug: string
  stages_completed: string[]
  current_stage: number
  quiz_score?: number
  challenges_completed?: number
  completed_at?: string
}

export async function saveProgressToServer(_data: ProgressPayload) {
  // No-op: progress is stored in localStorage by the frontend
}

export async function loadProgressFromServer(_studentId: string) {
  return null // Always fall back to localStorage
}

// ── XP (localStorage only — no server call) ──

export interface XPPayload {
  student_id: string
  total_xp: number
  level: number
  level_name: string
  streak_days: number
  last_active_date: string
  unlocked_achievements: string[]
}

export async function saveXPToServer(_data: XPPayload) {
  // No-op: XP state is stored in localStorage by the frontend
}

// ── Dashboard (not available in stateless demo) ──

export async function fetchDashboard(_batchCode?: string) {
  return null
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

// ── Judge0 Code Execution (multi-language playground) ──

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
