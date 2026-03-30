import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, CheckCircle, ChevronRight, Flame, Star, Zap, Terminal, User, Compass } from 'lucide-react'
import { MODULES, MODULE_ORDER, COLOR_MAP } from '@/data/modules'
import { getAllProgress } from '@/hooks/useProgress'
import { getStudentProfile } from '@/hooks/useProgress'
import { loadXPState, getXPProgressPercent } from '@/lib/XPEngine'

export default function ModuleListPage() {
  const navigate = useNavigate()
  const allProgress = getAllProgress()
  const profile = getStudentProfile()
  const xpState = loadXPState()

  const completedModules = Object.entries(allProgress)
    .filter(([, p]) => p.completedAt != null)
    .map(([slug]) => slug)

  function isUnlocked(slug: string): boolean {
    const mod = MODULES[slug]
    if (!mod) return false
    return mod.prerequisites.every(prereq => completedModules.includes(prereq))
  }

  function getModuleStatus(slug: string): 'locked' | 'in-progress' | 'completed' | 'available' {
    if (completedModules.includes(slug)) return 'completed'
    const prog = allProgress[slug]
    if (prog && prog.stagesCompleted.length > 0) return 'in-progress'
    if (isUnlocked(slug)) return 'available'
    return 'locked'
  }

  const xpPercent = getXPProgressPercent(xpState.totalXP)

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-200">
      {/* Header */}
      <div className="bg-[#0f0f1a]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-base font-bold text-black shadow-lg shadow-amber-500/25">
              E
            </div>
            <div>
              <p className="text-xs text-slate-400">EduAI School</p>
              <p className="text-sm font-semibold text-white leading-tight">
                {profile?.name ? `Hi, ${profile.name}!` : 'Your Learning Path'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {xpState.streakDays > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-full px-2.5 py-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-300">{xpState.streakDays}</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">{xpState.totalXP} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* XP Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a1a2e] to-[#12121f] border border-slate-700/50 rounded-2xl p-5 shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-slate-400 font-medium">Your Level</p>
              <p className="text-xl font-bold text-white">
                {xpState.level > 1 ? (
                  <span className="text-amber-400">{xpState.levelName}</span>
                ) : xpState.levelName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Progress to next level</p>
              <p className="text-lg font-semibold text-white">{xpState.totalXP} <span className="text-slate-500 text-sm">/ {xpState.xpForNextLevel} XP</span></p>
            </div>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-slate-500">{completedModules.length} of {MODULE_ORDER.length} modules complete</p>
            <p className="text-xs text-slate-500">{xpPercent}%</p>
          </div>
        </motion.div>

        {/* Grade Band Label */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Class 9–10 Foundation</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Explore All — CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 border border-amber-500/20 rounded-2xl p-5 cursor-pointer hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-0.5 group"
          onClick={() => navigate('/explore')}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">Explore All Modules</h3>
              <p className="text-xs text-slate-400 mt-0.5">Jump into any module & stage freely — no order required</p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.div>

        {/* Module Cards */}
        <div className="space-y-3">
          {MODULE_ORDER.map((slug, idx) => {
            const mod = MODULES[slug]
            if (!mod) return null
            const status = getModuleStatus(slug)
            const prog = allProgress[slug]
            const stageCount = mod.stages.length
            const doneCount = prog?.stagesCompleted.length ?? 0
            const colors = COLOR_MAP[mod.color] ?? COLOR_MAP.amber
            const quizScore = prog?.quizScore

            return (
              <motion.button
                key={slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                onClick={() => {
                  if (status !== 'locked') navigate(`/module/${slug}`)
                }}
                disabled={status === 'locked'}
                className={`w-full text-left bg-[#1a1a2e] border rounded-2xl p-5 transition-all duration-200 ${
                  status === 'locked'
                    ? 'border-slate-800 opacity-50 cursor-not-allowed'
                    : `border-slate-700/50 ${colors.card} hover:shadow-xl ${colors.glow} hover:-translate-y-0.5 active:translate-y-0`
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border ${
                    status === 'locked' ? 'bg-slate-800 border-slate-700' : `${colors.icon}`
                  }`}>
                    {status === 'locked' ? <Lock className="w-5 h-5 text-slate-600" /> : mod.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-slate-500 font-mono">M{idx + 1}</span>
                      {status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Complete
                        </span>
                      )}
                      {status === 'in-progress' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                          In Progress
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white text-base leading-snug">{mod.title}</h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{mod.description}</p>

                    <div className="flex items-center gap-3 mt-3">
                      {/* Stage progress bar */}
                      <div className="flex gap-1.5 flex-1">
                        {mod.stages.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                              i < doneCount ? colors.progress : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 flex-shrink-0">{doneCount}/{stageCount}</span>

                      {/* XP Badge */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-400 font-medium">{mod.xpReward} XP</span>
                      </div>

                      {/* Quiz score */}
                      {quizScore !== undefined && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                          quizScore >= 80 ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                        }`}>
                          {quizScore}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  {status !== 'locked' && (
                    <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Coming soon teaser */}
        <div className="bg-[#1a1a2e]/50 border border-slate-800 border-dashed rounded-2xl p-5 text-center">
          <p className="text-2xl mb-2">🔜</p>
          <p className="text-sm font-medium text-slate-400">Class 11–12 Track Coming Soon</p>
          <p className="text-xs text-slate-600 mt-1">Data Structures · Algorithms · OOP · Web Fundamentals</p>
        </div>

        {/* Spacer for bottom nav */}
        <div className="h-20" />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-[#0f0f1a]/95 backdrop-blur-md border-t border-slate-800 z-20">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-around py-2">
          {[
            { label: 'Modules', icon: <Star className="w-5 h-5" />, to: '/modules', active: true },
            { label: 'Explore', icon: <Compass className="w-5 h-5" />, to: '/explore', active: false },
            { label: 'Playground', icon: <Terminal className="w-5 h-5" />, to: '/playground', active: false },
            { label: 'Profile', icon: <User className="w-5 h-5" />, to: '/profile', active: false },
          ].map(item => (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                item.active
                  ? 'text-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
