/**
 * Explore Playground — All modules & stages immediately accessible
 * Sidebar module picker + stage tabs + full content area
 * No auth required, tracks progress
 */
import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Zap, CheckCircle, Lock,
  Compass, Menu, X
} from 'lucide-react'
import HookStage from '@/components/stages/HookStage'
import VisualizerStage from '@/components/stages/VisualizerStage'
import SandboxStage from '@/components/stages/SandboxStage'
import TutorStage from '@/components/stages/TutorStage'
import QuizStage from '@/components/stages/QuizStage'
import { MODULES, MODULE_ORDER, STAGES_INFO, COLOR_MAP, type Module } from '@/data/modules'
import { getAllProgress, useProgress, type AllProgress } from '@/hooks/useProgress'
import { loadXPState, addXP, getXPProgressPercent } from '@/lib/XPEngine'

export default function ExplorePlayground() {
  const navigate = useNavigate()
  const [selectedModule, setSelectedModule] = useState(MODULE_ORDER[0])
  const [selectedStage, setSelectedStage] = useState(0)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'xp' } | null>(null)
  // Force re-render when progress changes
  const [, setProgressTick] = useState(0)

  const allProgress = getAllProgress()
  const xpState = loadXPState()
  const xpPercent = getXPProgressPercent(xpState.totalXP)

  const mod = MODULES[selectedModule]
  const colors = COLOR_MAP[mod.color] ?? COLOR_MAP.amber
  const stageKey = STAGES_INFO[selectedStage]?.key ?? 'hook'

  function showToast(message: string, type: 'success' | 'xp' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleStageComplete(moduleSlug: string, currentStageKey: string, currentStageIdx: number, extras?: { quizScore?: number; challengesCompleted?: number }) {
    setProgressTick(t => t + 1)

    if (extras?.quizScore !== undefined) {
      const baseXP = Math.round(mod.xpReward * 0.4)
      const bonusXP = extras.quizScore === 100 ? 50 : extras.quizScore >= 80 ? 25 : 0
      addXP(baseXP + bonusXP)
      showToast(`+${baseXP + bonusXP} XP — Quiz ${extras.quizScore}%`, 'xp')
    } else if (currentStageKey === 'sandbox' && extras?.challengesCompleted) {
      const xp = extras.challengesCompleted * 10
      addXP(xp)
      showToast(`+${xp} XP — ${extras.challengesCompleted} challenges`, 'xp')
    } else {
      addXP(10)
      showToast(`Stage complete! +10 XP`, 'xp')
    }

    // Auto-advance to next stage (or stay if last)
    const nextIndex = currentStageIdx + 1
    if (nextIndex < STAGES_INFO.length) {
      setSelectedStage(nextIndex)
    }
  }

  function selectModule(slug: string) {
    setSelectedModule(slug)
    setSelectedStage(0)
    setMobileSidebarOpen(false)
  }

  const moduleProgress = allProgress[selectedModule]
  const stagesCompleted = moduleProgress?.stagesCompleted ?? []

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col lg:flex-row">
      {/* ─── Mobile Header ─── */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#0f0f1a]/95 backdrop-blur border-b border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                Explore Mode
              </h1>
              <p className="text-[10px] text-slate-500">{mod.icon} {mod.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 text-xs text-amber-400">
            <Zap className="w-3 h-3" />
            <span className="font-medium">{xpState.totalXP} XP</span>
          </div>
        </div>
      </header>

      {/* ─── Mobile Sidebar Overlay ─── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#12121f] border-r border-slate-800 z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                      E
                    </div>
                    <span className="text-sm font-semibold text-white">Explore Mode</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderSidebarContent(selectedModule, allProgress, selectModule)}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-[#12121f] border-r border-slate-800 min-h-screen sticky top-0 overflow-y-auto">
        {/* Sidebar header */}
        <div className="p-5 border-b border-slate-800/50">
          <Link to="/modules" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs mb-4">
            <ChevronLeft className="w-3 h-3" />
            Back to Modules
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-amber-500/20">
              E
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Explore Mode</h1>
              <p className="text-[11px] text-slate-500">All modules unlocked</p>
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4 bg-[#1a1a2e] rounded-xl p-3 border border-slate-800/50">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Zap className="w-3 h-3" />
                <span className="font-semibold">{xpState.totalXP} XP</span>
              </div>
              <span className="text-[10px] text-slate-500">Lv. {xpState.level} {xpState.levelName}</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module list */}
        <div className="flex-1 p-4">
          {renderSidebarContent(selectedModule, allProgress, selectModule)}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <Link
            to="/playground"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-purple-400 transition-colors"
          >
            Free Playground →
          </Link>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Desktop header bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-[#0f0f1a]/90 backdrop-blur border-b border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mod.icon}</span>
            <div>
              <h2 className="text-base font-bold text-white">{mod.title}</h2>
              <p className="text-xs text-slate-500">{mod.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stagesCompleted.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                {stagesCompleted.length}/{STAGES_INFO.length} done
              </div>
            )}
          </div>
        </div>

        {/* Stage tabs */}
        <div className="bg-[#12121f] border-b border-slate-800 sticky top-0 lg:top-[53px] z-10">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
              {STAGES_INFO.map((s, i) => {
                const isActive = i === selectedStage
                const isDone = stagesCompleted.includes(s.key)
                return (
                  <button
                    key={s.key}
                    onClick={() => setSelectedStage(i)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/10'
                        : isDone
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {isDone && !isActive && <CheckCircle className="w-3 h-3" />}
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Content area — keyed by module+stage to force full remount */}
        <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6">
          <ExploreStageRenderer
            key={`${selectedModule}-${stageKey}`}
            moduleSlug={selectedModule}
            mod={mod}
            stageKey={stageKey}
            stageIndex={selectedStage}
            onStageComplete={handleStageComplete}
          />
        </div>
      </main>

      {/* ─── Toast notification ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium flex items-center gap-2 ${
              toast.type === 'xp'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/30'
                : 'bg-emerald-600 text-white shadow-emerald-500/30'
            }`}
          >
            {toast.type === 'xp' && <Zap className="w-4 h-4" />}
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Inner stage renderer — keyed so it remounts on module/stage change ─── */
function ExploreStageRenderer({
  moduleSlug,
  mod,
  stageKey,
  stageIndex,
  onStageComplete,
}: {
  moduleSlug: string
  mod: Module
  stageKey: string
  stageIndex: number
  onStageComplete: (moduleSlug: string, stageKey: string, stageIndex: number, extras?: { quizScore?: number; challengesCompleted?: number }) => void
}) {
  const { completeStage } = useProgress(moduleSlug)

  function handleComplete(extras?: { quizScore?: number; challengesCompleted?: number }) {
    const nextIndex = stageIndex + 1
    completeStage(stageKey, nextIndex, extras)
    onStageComplete(moduleSlug, stageKey, stageIndex, extras)
  }

  switch (stageKey) {
    case 'hook':
      return (
        <HookStage
          hookConfig={mod.hookConfig}
          moduleTitle={mod.title}
          onComplete={() => handleComplete()}
        />
      )
    case 'visualizer':
      return (
        <VisualizerStage
          codeLines={mod.codeLines}
          steps={mod.visualizerSteps}
          onComplete={() => handleComplete()}
        />
      )
    case 'sandbox':
      return (
        <SandboxStage
          starterCode={mod.sandboxConfig.starterCode}
          challenge={mod.sandboxConfig.challenge}
          successHint={mod.sandboxConfig.successHint}
          challenges={mod.sandboxConfig.challenges}
          onComplete={(challengesCompleted) => handleComplete({ challengesCompleted })}
        />
      )
    case 'tutor':
      return (
        <TutorStage
          moduleTitle={mod.title}
          presetQuestions={mod.tutorPresetQuestions}
          onComplete={() => handleComplete()}
        />
      )
    case 'quiz':
      return (
        <QuizStage
          questions={mod.quizQuestions}
          onComplete={(score) => handleComplete({ quizScore: score })}
        />
      )
    default:
      return null
  }
}

/* ─── Sidebar content (shared between mobile & desktop) ─── */
function renderSidebarContent(
  selectedModule: string,
  allProgress: AllProgress,
  onSelect: (slug: string) => void,
) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold mb-3 px-2">
        All Modules
      </p>
      {MODULE_ORDER.map((slug, idx) => {
        const mod = MODULES[slug]
        if (!mod) return null
        const isSelected = slug === selectedModule
        const prog = allProgress[slug]
        const doneCount = prog?.stagesCompleted.length ?? 0
        const isComplete = prog?.completedAt != null
        const colors = COLOR_MAP[mod.color] ?? COLOR_MAP.amber

        return (
          <button
            key={slug}
            onClick={() => onSelect(slug)}
            className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
              isSelected
                ? 'bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 shadow-lg'
                : 'hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            {/* Module icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border transition-all duration-200 ${
              isSelected
                ? `${colors.icon} scale-105`
                : 'bg-slate-800/80 border-slate-700/50 group-hover:bg-slate-800'
            }`}>
              {mod.icon}
            </div>

            {/* Module info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-mono ${isSelected ? 'text-amber-400' : 'text-slate-600'}`}>
                  M{idx + 1}
                </span>
                {isComplete && (
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                )}
              </div>
              <p className={`text-sm font-medium truncate ${
                isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
              }`}>
                {mod.title}
              </p>
              {/* Mini stage progress */}
              <div className="flex gap-1 mt-1.5">
                {mod.stages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < doneCount ? colors.progress : 'bg-slate-700/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Active indicator */}
            {isSelected && (
              <div className="w-1 h-8 rounded-full bg-amber-400 flex-shrink-0" />
            )}
          </button>
        )
      })}
    </div>
  )
}
