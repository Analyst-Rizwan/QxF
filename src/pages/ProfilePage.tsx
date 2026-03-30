/**
 * Profile & Achievements Page
 * Shows XP, level, streak calendar, unlocked achievements, and module progress
 */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Zap, Flame, Star, Trophy, Lock, CheckCircle, Terminal } from 'lucide-react'
import { getStudentProfile, getAllProgress } from '@/hooks/useProgress'
import { loadXPState, getXPProgressPercent, LEVELS, ALL_ACHIEVEMENTS, type Achievement } from '@/lib/XPEngine'
import { MODULES, MODULE_ORDER } from '@/data/modules'

const RARITY_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: { bg: 'bg-slate-700/30', border: 'border-slate-600/50', text: 'text-slate-300', glow: '' },
  rare: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-300', glow: 'shadow-blue-500/5' },
  epic: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300', glow: 'shadow-purple-500/10' },
  legendary: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300', glow: 'shadow-amber-500/15 shadow-lg' },
}

export default function ProfilePage() {
  const profile = getStudentProfile()
  const xpState = loadXPState()
  const allProgress = getAllProgress()
  const xpPercent = getXPProgressPercent(xpState.totalXP)

  const completedModules = Object.entries(allProgress)
    .filter(([, p]) => p.completedAt != null)
    .map(([slug]) => slug)

  const totalStagesCompleted = Object.values(allProgress).reduce((acc, p) => acc + p.stagesCompleted.length, 0)

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-200 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link to="/modules" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-4 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Modules
          </Link>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-black flex-shrink-0 shadow-lg shadow-amber-500/20">
              {profile?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{profile?.name ?? 'Student'}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{profile?.batchName ?? 'EduAI School'}</p>

              {/* Level + XP bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-semibold text-sm">Level {xpState.level}: {xpState.levelName}</span>
                  </div>
                  <span className="text-xs text-slate-500">{xpState.totalXP} / {xpState.xpForNextLevel} XP</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-6 mt-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total XP', value: xpState.totalXP, icon: <Zap className="w-4 h-4 text-amber-400" />, bg: 'bg-amber-500/10' },
            { label: 'Streak', value: `${xpState.streakDays}d`, icon: <Flame className="w-4 h-4 text-orange-400" />, bg: 'bg-orange-500/10' },
            { label: 'Modules', value: `${completedModules.length}/${MODULE_ORDER.length}`, icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, bg: 'bg-emerald-500/10' },
            { label: 'Stages', value: totalStagesCompleted, icon: <Star className="w-4 h-4 text-purple-400" />, bg: 'bg-purple-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1a1a2e] border border-slate-700/50 rounded-xl p-3 text-center">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg mx-auto flex items-center justify-center mb-1.5`}>
                {stat.icon}
              </div>
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Level roadmap */}
        <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Level Roadmap
          </h3>
          <div className="flex items-center gap-1">
            {LEVELS.map((lvl, i) => {
              const isReached = xpState.level >= lvl.level
              const isCurrent = xpState.level === lvl.level
              return (
                <div key={lvl.level} className="flex-1 flex flex-col items-center">
                  <div className={`w-full h-2 rounded-full mb-2 ${
                    isReached ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-slate-700'
                  } ${isCurrent ? 'ring-2 ring-amber-400/30' : ''}`} />
                  <p className={`text-[10px] font-medium ${isReached ? 'text-amber-400' : 'text-slate-600'}`}>
                    {lvl.name}
                  </p>
                  <p className="text-[9px] text-slate-600">{lvl.minXP} XP</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Module Progress */}
        <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Module Progress</h3>
          <div className="space-y-3">
            {MODULE_ORDER.map((slug) => {
              const mod = MODULES[slug]
              if (!mod) return null
              const prog = allProgress[slug]
              const doneCount = prog?.stagesCompleted.length ?? 0
              const isComplete = prog?.completedAt != null
              return (
                <div key={slug} className="flex items-center gap-3">
                  <span className="text-xl">{mod.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-slate-200 truncate">{mod.title}</p>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">{doneCount}/{mod.stages.length}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : doneCount > 0 ? 'bg-amber-400' : 'bg-slate-700'}`}
                        style={{ width: `${(doneCount / mod.stages.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  {isComplete && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  {prog?.quizScore !== undefined && (
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                      prog.quizScore >= 80 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>{prog.quizScore}%</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              Achievements
            </h3>
            <span className="text-xs text-slate-500">
              {xpState.unlockedAchievementIds.length} / {ALL_ACHIEVEMENTS.length} unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ALL_ACHIEVEMENTS.map((ach) => {
              const unlocked = xpState.unlockedAchievementIds.includes(ach.id)
              const styles = RARITY_STYLES[ach.rarity]
              return (
                <motion.div
                  key={ach.id}
                  initial={false}
                  animate={unlocked ? { scale: [1, 1.02, 1] } : {}}
                  className={`p-3 rounded-xl border transition-all ${
                    unlocked
                      ? `${styles.bg} ${styles.border} ${styles.glow}`
                      : 'bg-slate-800/30 border-slate-800 opacity-40'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xl ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${unlocked ? styles.text : 'text-slate-500'}`}>
                        {ach.title}
                      </p>
                      <p className="text-[10px] text-slate-600 leading-tight mt-0.5">{ach.description}</p>
                      <span className={`inline-block text-[9px] font-medium uppercase mt-1 ${unlocked ? 'text-slate-500' : 'text-slate-700'}`}>
                        {ach.rarity}
                      </span>
                    </div>
                    {!unlocked && <Lock className="w-3 h-3 text-slate-700 flex-shrink-0" />}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex gap-3">
          <Link
            to="/playground"
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-xl py-3 text-sm font-medium hover:bg-purple-600/30 transition-colors"
          >
            <Terminal className="w-4 h-4" />
            Open Playground
          </Link>
          <Link
            to="/modules"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl py-3 text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Continue Learning →
          </Link>
        </div>
      </div>
    </div>
  )
}
