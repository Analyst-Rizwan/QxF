import { useState, useCallback } from 'react'

const PROGRESS_KEY = 'eduai_school_progress'
const ENROLLMENT_KEY = 'eduai_school_enrollment'
const PROFILE_KEY = 'eduai_school_profile'

export interface StageProgress {
  moduleSlug: string
  stagesCompleted: string[]
  currentStage: number
  quizScore?: number
  lastUpdated: string
  completedAt?: string
  timeSpentSeconds?: number
  challengesCompleted?: number
}

export interface AllProgress {
  [moduleSlug: string]: StageProgress
}

export interface StudentProfile {
  name: string
  batchCode: string
  batchName: string
  enrolledAt: string
}

function loadProgress(moduleSlug: string): StageProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return makeEmpty(moduleSlug)
    const all = JSON.parse(raw) as AllProgress
    return all[moduleSlug] ?? makeEmpty(moduleSlug)
  } catch {
    return makeEmpty(moduleSlug)
  }
}

function makeEmpty(moduleSlug: string): StageProgress {
  return {
    moduleSlug,
    stagesCompleted: [],
    currentStage: 0,
    lastUpdated: new Date().toISOString(),
  }
}

function saveProgress(p: StageProgress) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    const all = raw ? (JSON.parse(raw) as AllProgress) : {}
    all[p.moduleSlug] = { ...p, lastUpdated: new Date().toISOString() }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
  } catch {
    // Storage blocked — fail silently
  }
}

export function getAllProgress(): AllProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as AllProgress
  } catch {
    return {}
  }
}

export function getCompletedModules(): string[] {
  const all = getAllProgress()
  return Object.entries(all)
    .filter(([, p]) => p.completedAt != null)
    .map(([slug]) => slug)
}

export function useProgress(moduleSlug: string) {
  const [progress, setProgress] = useState<StageProgress>(() => loadProgress(moduleSlug))

  const completeStage = useCallback(
    (stageKey: string, nextStageIndex: number, extras?: { quizScore?: number; challengesCompleted?: number }) => {
      setProgress((prev) => {
        const updated: StageProgress = {
          ...prev,
          stagesCompleted: prev.stagesCompleted.includes(stageKey)
            ? prev.stagesCompleted
            : [...prev.stagesCompleted, stageKey],
          currentStage: nextStageIndex,
          ...(extras?.quizScore !== undefined ? { quizScore: extras.quizScore } : {}),
          ...(extras?.challengesCompleted !== undefined ? { challengesCompleted: extras.challengesCompleted } : {}),
        }
        saveProgress(updated)
        return updated
      })
    },
    []
  )

  const markModuleComplete = useCallback((quizScore?: number) => {
    setProgress((prev) => {
      const updated: StageProgress = {
        ...prev,
        completedAt: new Date().toISOString(),
        ...(quizScore !== undefined ? { quizScore } : {}),
      }
      saveProgress(updated)
      return updated
    })
  }, [])

  const resetProgress = useCallback(() => {
    const empty = makeEmpty(moduleSlug)
    saveProgress(empty)
    setProgress(empty)
  }, [moduleSlug])

  return { progress, completeStage, markModuleComplete, resetProgress }
}

// Enrollment helpers
export function getEnrollment(): { batchCode: string; batchName: string } | null {
  try {
    const raw = localStorage.getItem(ENROLLMENT_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setEnrollment(batchCode: string, batchName: string) {
  localStorage.setItem(
    ENROLLMENT_KEY,
    JSON.stringify({ batchCode, batchName, enrolledAt: new Date().toISOString() })
  )
}

export function clearEnrollment() {
  localStorage.removeItem(ENROLLMENT_KEY)
  localStorage.removeItem(PROFILE_KEY)
}

// Student profile helpers
export function getStudentProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStudentProfile(name: string, batchCode: string, batchName: string) {
  const profile: StudentProfile = {
    name,
    batchCode,
    batchName,
    enrolledAt: new Date().toISOString(),
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}
