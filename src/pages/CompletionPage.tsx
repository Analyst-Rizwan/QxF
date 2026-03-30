import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Star, ChevronRight, Home, Zap } from 'lucide-react'
import { MODULES, MODULE_ORDER } from '@/data/modules'
import { getAllProgress, getCompletedModules, getStudentProfile } from '@/hooks/useProgress'
import { addXP, checkAndUnlockAchievements, loadXPState, getXPProgressPercent, type Achievement } from '@/lib/XPEngine'

const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-300 bg-slate-700/50 border-slate-600',
  rare: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  epic: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  legendary: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
}

export default function CompletionPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const module = slug ? MODULES[slug] : null
  const profile = getStudentProfile()

  const [xpGained, setXpGained] = useState(0)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const [leveledUp, setLeveledUp] = useState(false)
  const [newLevelName, setNewLevelName] = useState('')
  const [xpState, setXpState] = useState(loadXPState())
  const [showCelebration, setShowCelebration] = useState(false)

  const allProgress = getAllProgress()
  const completedModules = getCompletedModules()

  // Find the quiz score from progress
  const moduleProgress = slug ? allProgress[slug] : null
  const quizScore = moduleProgress?.quizScore
  const challengesDone = moduleProgress?.challengesCompleted ?? 0

  useEffect(() => {
    if (!module) return

    // Award XP
    const baseXP = module.xpReward
    const bonusXP = quizScore === 100 ? 50 : quizScore && quizScore >= 80 ? 25 : 0
    const challengeBonus = challengesDone >= 3 ? 30 : 0
    const total = baseXP + bonusXP + challengeBonus
    setXpGained(total)

    const { newState, leveledUp: lu, newLevel } = addXP(total)
    setXpState(newState)
    setLeveledUp(lu)
    setNewLevelName(newLevel)

    // Check achievements
    const allCompleted = [...completedModules, slug!]
    const unlocked = checkAndUnlockAchievements(
      allCompleted,
      quizScore,
      challengesDone >= 3
    )
    setNewAchievements(unlocked)

    setTimeout(() => setShowCelebration(true), 300)
  }, []) // run once on mount

  // Find next module
  const currentIndex = MODULE_ORDER.indexOf(slug ?? '')
  const nextSlug = currentIndex >= 0 && currentIndex < MODULE_ORDER.length - 1 ? MODULE_ORDER[currentIndex + 1] : null
  const nextModule = nextSlug ? MODULES[nextSlug] : null
  const nextUnlocked = nextSlug ? completedModules.includes(slug ?? '') || true : false

  const xpPercent = getXPProgressPercent(xpState.totalXP)

  if (!module) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <Link to="/modules" className="text-slate-400 hover:text-white">← Back to modules</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-4 text-center py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-5">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="text-7xl"
        >
          🏆
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">You did it!</h1>
          {profile && <p className="text-amber-400 font-medium">{profile.name} ✓</p>}
          <p className="text-slate-400 text-base mt-2">
            Completed <span className="text-white font-semibold">{module.title}</span>
          </p>
        </motion.div>

        {/* XP Earned Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 rounded-2xl p-5"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-bold text-amber-300">+{xpGained} XP</span>
          </div>

          {leveledUp && (
            <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-2 mb-3">
              <p className="text-amber-300 font-semibold text-sm">🎉 Level Up! You're now a {newLevelName}!</p>
            </div>
          )}

          {/* XP bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Level {xpState.level}: {xpState.levelName}</span>
              <span>{xpState.totalXP} / {xpState.xpForNextLevel} XP</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              />
            </div>
          </div>

          {/* Quiz score breakdown */}
          {quizScore !== undefined && (
            <div className="flex items-center justify-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400" />
                <span className={`font-semibold ${quizScore >= 80 ? 'text-emerald-300' : quizScore >= 60 ? 'text-amber-300' : 'text-slate-300'}`}>
                  Quiz: {quizScore}%
                </span>
              </div>
              {challengesDone > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span className="text-teal-300 font-semibold">{challengesDone} challenges</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* New Achievements */}
        <AnimatePresence>
          {showCelebration && newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">New Achievements</p>
              {newAchievements.map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${RARITY_COLORS[ach.rarity]}`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{ach.title}</p>
                    <p className="text-xs opacity-70">{ach.description}</p>
                  </div>
                  <span className="ml-auto text-[10px] font-medium uppercase opacity-60">{ach.rarity}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* What you covered */}
        {module.completionSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5 text-left"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">What you covered</p>
            <ul className="space-y-2.5">
              {module.completionSummary.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {nextModule ? (
            <button
              onClick={() => navigate(`/module/${nextSlug}`)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
            >
              Next: {nextModule.title}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-300 font-semibold text-sm">🎊 Class 9-10 Foundation Complete!</p>
              <p className="text-xs text-amber-400/60 mt-1">Class 11-12 track coming soon</p>
            </div>
          )}

          <Link
            to="/modules"
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium rounded-xl py-3 text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to All Modules
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
