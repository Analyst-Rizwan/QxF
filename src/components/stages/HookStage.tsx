// T3: Concept Hook — Stage 1
// Auto-rickshaw analogy: a hand writes 3 instructions, the auto follows them
// Implemented as inline SVG + CSS animations (no external lib needed)
import { useState, useEffect } from 'react'

interface Props {
  onComplete: () => void
}

const STEPS = [
  { label: 'Turn left', delay: 0 },
  { label: 'Go 200m', delay: 2000 },
  { label: 'Stop', delay: 4000 },
]

export default function HookStage({ onComplete }: Props) {
  const [phase, setPhase] = useState<'intro' | 'animation' | 'final'>('intro')
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const [autoPos, setAutoPos] = useState(0) // 0–100 (x position %)

  // Start animation sequence
  function startAnimation() {
    setPhase('animation')
    setVisibleSteps([])
    setAutoPos(0)

    // Reveal instruction steps one by one
    STEPS.forEach((s, i) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, i])
      }, s.delay)
    })

    // Move auto-rickshaw
    setTimeout(() => setAutoPos(20), 1500)   // turn left
    setTimeout(() => setAutoPos(60), 3000)   // go 200m
    setTimeout(() => setAutoPos(60), 5000)   // stop

    // Show final frame
    setTimeout(() => setPhase('final'), 6000)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-xs font-medium text-amber-400 mb-3">
          💡 Stage 1 — Concept
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">What is a Program?</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Let's use a real-life example you already know.
        </p>
      </div>

      {phase === 'intro' && (
        <div className="animate-fade-in">
          {/* Intro illustration */}
          <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-6 mb-6">
            <div className="text-4xl mb-4 text-center">🛺</div>
            <p className="text-slate-300 text-base leading-relaxed text-center">
              Imagine you're giving directions to an <span className="text-amber-400 font-semibold">auto-rickshaw driver</span>.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed text-center mt-2">
              You write down the steps. The driver follows them, one at a time.
            </p>
          </div>

          <button
            onClick={startAnimation}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
          >
            Show me →
          </button>
        </div>
      )}

      {phase === 'animation' && (
        <div className="animate-fade-in space-y-5">
          {/* Auto-rickshaw scene */}
          <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5 overflow-hidden">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-4 font-medium">The auto follows the instructions</p>

            {/* Road scene */}
            <div className="relative h-20 bg-slate-800/50 rounded-xl overflow-hidden mb-4">
              {/* Road markings */}
              <div className="absolute bottom-3 left-0 right-0 h-0.5 border-t-2 border-dashed border-slate-600" />

              {/* Auto SVG */}
              <div
                className="absolute bottom-4 transition-all duration-1000 ease-in-out"
                style={{ left: `${autoPos}%` }}
              >
                <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
                  {/* Body */}
                  <rect x="6" y="8" width="36" height="16" rx="4" fill="#f59e0b" />
                  {/* Windshield */}
                  <rect x="30" y="10" width="10" height="8" rx="2" fill="#bfdbfe" opacity="0.8" />
                  {/* Canopy */}
                  <path d="M6 8 Q24 2 42 8" stroke="#d97706" strokeWidth="1.5" fill="none" />
                  {/* Wheels */}
                  <circle cx="12" cy="24" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  <circle cx="36" cy="24" r="5" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  <circle cx="12" cy="24" r="2" fill="#475569" />
                  <circle cx="36" cy="24" r="2" fill="#475569" />
                </svg>
              </div>
            </div>

            {/* Instructions written on paper */}
            <div className="bg-[#0f0f1a] rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-3 font-medium">Instructions on paper:</p>
              <div className="space-y-2">
                {STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 transition-all duration-500 ${
                      visibleSteps.includes(i) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      visibleSteps.includes(i) ? 'bg-amber-400 text-black' : 'bg-slate-700 text-slate-500'
                    }`}>
                      {i + 1}
                    </div>
                    <span className="font-mono text-sm text-slate-200">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-sm text-center animate-pulse">
            Watch the auto follow each instruction...
          </p>
        </div>
      )}

      {phase === 'final' && (
        <div className="animate-fade-in space-y-5">
          {/* Key insight card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="text-lg font-bold text-white mb-2">
              That's a program.
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              A program is a list of <span className="text-amber-400 font-semibold">instructions</span> that a computer follows, one step at a time — just like the auto followed the directions.
            </p>
          </div>

          {/* Recap */}
          <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Auto directions = Program instructions</p>
            <div className="space-y-2">
              {[
                { left: '"Turn left"', right: 'name = "Priya"' },
                { left: '"Go 200m"', right: 'age = 17' },
                { left: '"Stop"', right: 'print(message)' },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-400 font-mono flex-1 text-right">{row.left}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-amber-400 font-mono flex-1">{row.right}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Question + CTA */}
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
