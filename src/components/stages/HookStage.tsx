// T3: Concept Hook — Stage 1 (Module-aware, configurable per module)
import { useState } from 'react'
import type { HookConfig } from '@/data/modules'

interface Props {
  hookConfig?: HookConfig
  moduleTitle?: string
  onComplete: () => void
}

const DEFAULT_CONFIG: HookConfig = {
  analogy: 'auto-rickshaw',
  emoji: '🛺',
  steps: [
    { label: 'Turn left', delay: 0 },
    { label: 'Go 200m', delay: 2000 },
    { label: 'Stop', delay: 4000 },
  ],
  insight: "That's a program.",
  insightDetail: 'A program is a list of instructions that a computer follows, one step at a time.',
  mapping: [
    { left: '"Turn left"', right: 'name = "Priya"' },
    { left: '"Go 200m"', right: 'age = 17' },
    { left: '"Stop"', right: 'print(message)' },
  ],
}

export default function HookStage({ hookConfig, moduleTitle, onComplete }: Props) {
  const cfg = hookConfig ?? DEFAULT_CONFIG
  const [phase, setPhase] = useState<'intro' | 'animation' | 'final'>('intro')
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const [activeStep, setActiveStep] = useState<number>(-1)

  function startAnimation() {
    setPhase('animation')
    setVisibleSteps([])
    setActiveStep(-1)

    cfg.steps.forEach((s, i) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, i])
        setActiveStep(i)
      }, s.delay + 500)
    })

    setTimeout(() => setPhase('final'), cfg.steps[cfg.steps.length - 1].delay + 2200)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-xs font-medium text-amber-400 mb-3">
          💡 Stage 1 — Concept
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {moduleTitle ? moduleTitle : 'What is a Program?'}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Let's start with a real-life example you already know.
        </p>
      </div>

      {phase === 'intro' && (
        <div className="animate-fade-in">
          <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-6 mb-6 text-center">
            <div className="text-5xl mb-4">{cfg.emoji}</div>
            <p className="text-slate-300 text-base leading-relaxed">
              Think about a <span className="text-amber-400 font-semibold">{cfg.analogy}</span>.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mt-2">
              It follows steps, one at a time — just like a computer program.
            </p>
          </div>

          <button
            onClick={startAnimation}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
          >
            Show me how →
          </button>
        </div>
      )}

      {phase === 'animation' && (
        <div className="animate-fade-in space-y-5">
          <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5 overflow-hidden">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-4 font-medium">
              The {cfg.analogy} follows instructions:
            </p>

            {/* Big emoji */}
            <div className="text-center mb-6">
              <div className="text-6xl">{cfg.emoji}</div>
            </div>

            {/* Instructions */}
            <div className="bg-[#0f0f1a] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-3 font-medium">Instructions:</p>
              <div className="space-y-2">
                {cfg.steps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      visibleSteps.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                      activeStep === i ? 'bg-amber-400 text-black scale-110' :
                      visibleSteps.includes(i) ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700 text-slate-500'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`font-mono text-sm transition-colors ${activeStep === i ? 'text-amber-300 font-semibold' : 'text-slate-200'}`}>
                      {step.label}
                    </span>
                    {activeStep === i && (
                      <span className="ml-auto text-amber-400 text-xs animate-pulse">← running</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-sm text-center animate-pulse">
            Watch each step execute...
          </p>
        </div>
      )}

      {phase === 'final' && (
        <div className="animate-fade-in space-y-5">
          {/* Key insight */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-lg font-bold text-white mb-2">{cfg.insight}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{cfg.insightDetail}</p>
          </div>

          {/* Mapping: analogy ↔ Python */}
          <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">
              {cfg.analogy} → Python code
            </p>
            <div className="space-y-2">
              {cfg.mapping.map((row, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400 font-mono flex-1 text-right">{row.left}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-amber-400 font-mono flex-1">{row.right}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5">
            <p className="text-slate-300 text-base font-medium mb-1">
              What do you think happens when you run this code?
            </p>
            <p className="text-slate-500 text-sm mb-4">
              Let's step through it and see — line by line.
            </p>
            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
            >
              Let's find out →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
