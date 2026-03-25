import { useState, useCallback } from 'react'

const PROGRESS_KEY = 'eduai_school_progress'

export interface StageProgress {
  moduleSlug: string
  stagesCompleted: string[]
  currentStage: number
  lastUpdated: string
}

function loadProgress(moduleSlug: string): StageProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return makeEmpty(moduleSlug)
    const all = JSON.parse(raw) as Record<string, StageProgress>
    return all[moduleSlug] ?? makeEmpty(moduleSlug)
  } catch {
    return makeEmpty(moduleSlug)
  }
}

function makeEmpty(moduleSlug: string): StageProgress {
  return { moduleSlug, stagesCompleted: [], currentStage: 0, lastUpdated: new Date().toISOString() }
}

function saveProgress(p: StageProgress) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, StageProgress>) : {}
    all[p.moduleSlug] = { ...p, lastUpdated: new Date().toISOString() }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
  } catch {
    // Storage might be blocked — fail silently
  }
}

export function useProgress(moduleSlug: string) {
  const [progress, setProgress] = useState<StageProgress>(() => loadProgress(moduleSlug))

  const completeStage = useCallback(
    (stageKey: string, nextStageIndex: number) => {
      setProgress((prev) => {
        const updated: StageProgress = {
          ...prev,
          stagesCompleted: prev.stagesCompleted.includes(stageKey)
            ? prev.stagesCompleted
            : [...prev.stagesCompleted, stageKey],
          currentStage: nextStageIndex,
        }
        saveProgress(updated)
        return updated
      })
    },
    []
  )

  const resetProgress = useCallback(() => {
    const empty = makeEmpty(moduleSlug)
    saveProgress(empty)
    setProgress(empty)
  }, [moduleSlug])

  return { progress, completeStage, resetProgress }
}

export function getEnrollment(): { batchCode: string; batchName: string } | null {
  try {
    const raw = localStorage.getItem('eduai_school_enrollment')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setEnrollment(batchCode: string, batchName: string) {
  localStorage.setItem(
    'eduai_school_enrollment',
    JSON.stringify({ batchCode, batchName, enrolledAt: new Date().toISOString() })
  )
}

export function clearEnrollment() {
  localStorage.removeItem('eduai_school_enrollment')
}
