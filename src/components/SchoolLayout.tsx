// School layout: top progress bar + centered content area + student name
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { STAGES_INFO } from '@/data/modules'
import { getStudentProfile } from '@/hooks/useProgress'
import { loadXPState } from '@/lib/XPEngine'
import { Zap } from 'lucide-react'

interface Props {
  currentStageIndex: number
  totalStages: number
  moduleTitle: string
  moduleSlug?: string
  children: ReactNode
}

export default function SchoolLayout({ currentStageIndex, totalStages, moduleTitle, children }: Props) {
  const pct = Math.round((currentStageIndex / totalStages) * 100)
  const profile = getStudentProfile()
  const xpState = loadXPState()

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo + back */}
          <Link to="/modules" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
              E
            </div>
            <span className="font-semibold text-sm text-white hidden sm:block">EduAI School</span>
          </Link>

          {/* Module title */}
          <span className="text-slate-400 text-xs truncate max-w-[120px] sm:max-w-[200px]">{moduleTitle}</span>

          {/* Right section: XP + stage dots */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1 text-xs text-amber-400">
              <Zap className="w-3 h-3" />
              <span className="font-medium">{xpState.totalXP}</span>
            </div>

            {/* Stage dots */}
            <div className="flex items-center gap-1.5">
              {STAGES_INFO.slice(0, totalStages).map((s, i) => (
                <div
                  key={s.key}
                  title={s.label}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < currentStageIndex
                      ? 'bg-amber-400'
                      : i === currentStageIndex
                      ? 'bg-amber-400 ring-2 ring-amber-400/30 scale-125'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Student name strip */}
        {profile && (
          <div className="bg-slate-900/50 border-b border-slate-800/50 px-4 py-1">
            <p className="text-[10px] text-slate-500 text-center">
              Logged in as <span className="text-amber-400 font-medium">{profile.name}</span> · {profile.batchName}
            </p>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
