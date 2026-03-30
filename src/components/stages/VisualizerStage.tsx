// T4: Code Step-Through Visualizer — Stage 2
// Enhanced: auto-play, speed control, keyboard navigation
import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import type { VisualizerStep } from '@/data/modules'

interface Props {
  codeLines: string[]
  steps: VisualizerStep[]
  onComplete: () => void
}

const SPEEDS = [
  { label: '0.5×', ms: 2400 },
  { label: '1×', ms: 1200 },
  { label: '2×', ms: 600 },
]

export default function VisualizerStage({ codeLines, steps, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)
  const [prevVarKeys, setPrevVarKeys] = useState<string[]>([])
  const [flashingKeys, setFlashingKeys] = useState<string[]>([])
  const [showComplete, setShowComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1) // default 1×
  const outputRef = useRef<HTMLDivElement>(null)
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1

  const advanceTo = useCallback((nextIdx: number) => {
    const nextStep = steps[nextIdx]
    const nextKeys = Object.keys(nextStep.vars)
    const prevKeys = Object.keys(steps[currentStep]?.vars ?? {})

    const changed = nextKeys.filter(
      (k) => prevKeys.includes(k) && nextStep.vars[k] !== steps[currentStep]?.vars[k]
    )

    setPrevVarKeys(prevKeys)
    setCurrentStep(nextIdx)
    setShowComplete(false)

    if (changed.length > 0) {
      setFlashingKeys(changed)
      setTimeout(() => setFlashingKeys([]), 500)
    }
  }, [currentStep, steps])

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearTimeout(playTimerRef.current)
      return
    }
    const speed = SPEEDS[speedIndex].ms
    playTimerRef.current = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        advanceTo(currentStep + 1)
      } else {
        setIsPlaying(false)
        setShowComplete(true)
      }
    }, speed)
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current)
    }
  }, [isPlaying, currentStep, speedIndex, steps.length, advanceTo])

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        if (currentStep < steps.length - 1) advanceTo(currentStep + 1)
        else setShowComplete(true)
      }
      if (e.key === 'ArrowLeft' && currentStep > 0) advanceTo(currentStep - 1)
      if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentStep, steps.length, advanceTo])

  useEffect(() => {
    if (step?.output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [step?.output])

  function goNext() {
    if (currentStep < steps.length - 1) advanceTo(currentStep + 1)
    else setShowComplete(true)
  }

  function goPrev() {
    if (currentStep > 0) advanceTo(currentStep - 1)
  }

  const varEntries = Object.entries(step.vars)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1 text-xs font-medium text-teal-400 mb-3">
          🔍 Stage 2 — Visualizer
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Code step-through</h2>
        <p className="text-slate-400 text-sm">Follow the code as it runs, one line at a time.</p>
      </div>

      {/* Step counter + controls row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => advanceTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-4 bg-teal-400' : i < currentStep ? 'w-1.5 bg-teal-700' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
        {/* Auto-play controls */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {SPEEDS.map((s, i) => (
              <button
                key={i}
                onClick={() => setSpeedIndex(i)}
                className={`px-2 py-1 text-[10px] font-medium transition-colors ${
                  i === speedIndex ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isPlaying ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Auto-play (Space)'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main panels */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        {/* Code panel */}
        <div className="flex-1 bg-[#1a1a2e] border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-slate-500 font-mono">program.py</span>
          </div>
          <div className="p-3">
            {codeLines.map((line, i) => {
              const isActive = i === step.line
              const [code, ...commentParts] = line.split('#')
              const comment = commentParts.length > 0 ? '#' + commentParts.join('#') : ''

              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-2 py-1.5 rounded-lg text-xs font-mono transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-400/10 border-l-2 border-amber-400'
                      : 'border-l-2 border-transparent'
                  }`}
                >
                  <span className={`flex-shrink-0 w-4 text-right select-none ${isActive ? 'text-amber-400 font-bold' : 'text-slate-600'}`}>
                    {i + 1}
                  </span>
                  <span>
                    <span className={isActive ? 'text-amber-100' : 'text-slate-400'}>{code}</span>
                    {comment && <span className="text-slate-600">{comment}</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Variables panel */}
        <div className="sm:w-44 bg-[#1a1a2e] border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Variables</span>
            <span className="text-[10px] text-slate-600">{varEntries.length} stored</span>
          </div>
          <div className="p-3 space-y-2">
            {varEntries.length === 0 && (
              <p className="text-xs text-slate-600 italic">None yet</p>
            )}
            {varEntries.map(([key, value]) => {
              const isNew = !prevVarKeys.includes(key)
              const isFlashing = flashingKeys.includes(key)
              return (
                <div
                  key={key}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300
                    ${isNew ? 'animate-slide-down' : ''}
                    ${isFlashing ? 'bg-amber-400/20 border-amber-400/40' : 'bg-[#0f0f1a] border-slate-700/60'}
                  `}
                >
                  <div className="text-slate-500 text-[10px] mb-0.5">{key}</div>
                  <div className={`font-semibold truncate ${isFlashing ? 'text-amber-300' : 'text-teal-400'}`}>
                    {value}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Output panel */}
      {step.output && (
        <div
          ref={outputRef}
          className="bg-[#0f0f1a] border border-teal-500/30 rounded-xl p-3 mb-3 animate-slide-up"
        >
          <p className="text-xs text-teal-500 uppercase tracking-wider mb-1 font-medium">Output</p>
          <p className="font-mono text-base text-white whitespace-pre">{step.output}</p>
        </div>
      )}

      {/* Explanation */}
      <div className="bg-[#1a1a2e] border border-slate-700/30 rounded-xl px-4 py-3 mb-4 min-h-[64px]">
        <p className="text-sm text-slate-300 leading-relaxed">{step.explanation}</p>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-slate-600 text-center mb-3">
        ← → arrow keys to step · Space to play/pause
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 flex-1 justify-center bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        {!showComplete ? (
          <button
            onClick={goNext}
            className="flex items-center gap-1 flex-1 justify-center bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-black font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5"
          >
            {isLast ? 'See result' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 animate-slide-up"
          >
            Continue ✓
          </button>
        )}
      </div>
    </div>
  )
}
