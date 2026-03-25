// School layout: top progress bar + centered content area
import type { ReactNode } from 'react'
import { STAGES_INFO } from '@/data/modules'

interface Props {
  currentStageIndex: number
  totalStages: number
  moduleTitle: string
  children: ReactNode
}

export default function SchoolLayout({ currentStageIndex, totalStages, moduleTitle, children }: Props) {
  const pct = Math.round(((currentStageIndex) / totalStages) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
              E
            </div>
            <span className="font-semibold text-sm text-white hidden sm:block">EduAI School</span>
          </div>

          {/* Module title */}
          <span className="text-slate-400 text-xs truncate max-w-[160px] sm:max-w-none">{moduleTitle}</span>

          {/* Stage dots */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
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

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
