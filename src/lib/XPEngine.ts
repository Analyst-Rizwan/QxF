// XP & Gamification Engine
// Handles XP, levels, streaks, and achievements

export interface XPState {
  totalXP: number
  level: number
  levelName: string
  xpForNextLevel: number
  streakDays: number
  lastActiveDate: string
  achievements: Achievement[]
  unlockedAchievementIds: string[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const XP_KEY = 'eduai_xp_state'

export const LEVELS = [
  { level: 1, name: 'Beginner', minXP: 0, color: 'slate' },
  { level: 2, name: 'Explorer', minXP: 100, color: 'blue' },
  { level: 3, name: 'Builder', minXP: 300, color: 'green' },
  { level: 4, name: 'Coder', minXP: 600, color: 'purple' },
  { level: 5, name: 'Pro', minXP: 1000, color: 'amber' },
  { level: 6, name: 'Expert', minXP: 1500, color: 'orange' },
  { level: 7, name: 'Master', minXP: 2200, color: 'red' },
]

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_program', title: 'First Program', description: 'Complete Module 1: What is a Program?', icon: '🚀', rarity: 'common' },
  { id: 'decision_maker', title: 'Decision Maker', description: 'Complete Module 2: Conditions & Decisions', icon: '🚦', rarity: 'common' },
  { id: 'loop_master', title: 'Loop Master', description: 'Complete Module 3: Loops', icon: '🔁', rarity: 'common' },
  { id: 'function_writer', title: 'Function Writer', description: 'Complete Module 4: Functions', icon: '⚙️', rarity: 'rare' },
  { id: 'data_handler', title: 'Data Handler', description: 'Complete Module 5: Lists & Data', icon: '📋', rarity: 'rare' },
  { id: 'perfect_quiz', title: 'Perfect Score', description: 'Get 100% on any quiz', icon: '🌟', rarity: 'rare' },
  { id: 'streak_3', title: '3-Day Streak', description: 'Learn 3 days in a row', icon: '🔥', rarity: 'rare' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Learn 7 days in a row', icon: '⚡', rarity: 'epic' },
  { id: 'all_modules', title: 'Foundation Complete', description: 'Complete all 5 Class 9-10 modules', icon: '🏆', rarity: 'legendary' },
  { id: 'challenge_master', title: 'Challenge Master', description: 'Complete all sandbox challenges in any module', icon: '💪', rarity: 'epic' },
  { id: 'speed_runner', title: 'Speed Runner', description: 'Complete a module in under 20 minutes', icon: '⚡', rarity: 'epic' },
]

export function getLevelForXP(xp: number): typeof LEVELS[0] {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (xp >= l.minXP) level = l
  }
  return level
}

export function getXPForNextLevel(xp: number): number {
  const currentLevel = getLevelForXP(xp)
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)
  return nextLevel ? nextLevel.minXP : currentLevel.minXP
}

export function loadXPState(): XPState {
  try {
    const raw = localStorage.getItem(XP_KEY)
    if (!raw) return makeDefaultXPState()
    return { ...makeDefaultXPState(), ...JSON.parse(raw) }
  } catch {
    return makeDefaultXPState()
  }
}

function makeDefaultXPState(): XPState {
  return {
    totalXP: 0,
    level: 1,
    levelName: 'Beginner',
    xpForNextLevel: 100,
    streakDays: 0,
    lastActiveDate: '',
    achievements: ALL_ACHIEVEMENTS,
    unlockedAchievementIds: [],
  }
}

export function saveXPState(state: XPState) {
  try {
    localStorage.setItem(XP_KEY, JSON.stringify(state))
  } catch {
    // Storage blocked — fail silently
  }
}

export function addXP(amount: number): { newState: XPState; leveledUp: boolean; newLevel: string } {
  const state = loadXPState()
  const oldLevel = getLevelForXP(state.totalXP)
  state.totalXP += amount

  const newLevel = getLevelForXP(state.totalXP)
  state.level = newLevel.level
  state.levelName = newLevel.name
  state.xpForNextLevel = getXPForNextLevel(state.totalXP)

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  if (state.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (state.lastActiveDate === yesterday) {
      state.streakDays += 1
    } else if (state.lastActiveDate !== today) {
      state.streakDays = 1
    }
    state.lastActiveDate = today
  }

  saveXPState(state)
  return {
    newState: state,
    leveledUp: newLevel.level > oldLevel.level,
    newLevel: newLevel.name,
  }
}

export function unlockAchievement(achievementId: string): Achievement | null {
  const state = loadXPState()
  if (state.unlockedAchievementIds.includes(achievementId)) return null

  const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) return null

  state.unlockedAchievementIds.push(achievementId)
  saveXPState(state)
  return achievement
}

export function checkAndUnlockAchievements(
  completedModules: string[],
  quizScore?: number,
  challengesCompleted?: boolean,
): Achievement[] {
  const unlocked: Achievement[] = []

  const moduleAchievements: Record<string, string> = {
    m1: 'first_program',
    m2: 'decision_maker',
    m3: 'loop_master',
    m4: 'function_writer',
    m5: 'data_handler',
  }

  // Module completions
  for (const mod of completedModules) {
    const achId = moduleAchievements[mod]
    if (achId) {
      const ach = unlockAchievement(achId)
      if (ach) unlocked.push(ach)
    }
  }

  // All modules complete
  if (['m1', 'm2', 'm3', 'm4', 'm5'].every(m => completedModules.includes(m))) {
    const ach = unlockAchievement('all_modules')
    if (ach) unlocked.push(ach)
  }

  // Perfect quiz
  if (quizScore === 100) {
    const ach = unlockAchievement('perfect_quiz')
    if (ach) unlocked.push(ach)
  }

  // Challenge master
  if (challengesCompleted) {
    const ach = unlockAchievement('challenge_master')
    if (ach) unlocked.push(ach)
  }

  // Streak achievements
  const state = loadXPState()
  if (state.streakDays >= 3) {
    const ach = unlockAchievement('streak_3')
    if (ach) unlocked.push(ach)
  }
  if (state.streakDays >= 7) {
    const ach = unlockAchievement('streak_7')
    if (ach) unlocked.push(ach)
  }

  return unlocked
}

export function getXPProgressPercent(xp: number): number {
  const currentLevel = getLevelForXP(xp)
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)
  if (!nextLevel) return 100
  const range = nextLevel.minXP - currentLevel.minXP
  const earned = xp - currentLevel.minXP
  return Math.round((earned / range) * 100)
}
