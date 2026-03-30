// Stage 3 — Multi-Challenge Sandbox with Monaco Editor + Backend Execution
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Lightbulb, CheckCircle, RotateCcw, Sparkles, Loader2 } from 'lucide-react'
import MonacoEditor from '@/components/MonacoEditor'
import { runCode } from '@/lib/api'
import { streamMessageFromSchoolAI } from '@/lib/ai'
import type { SandboxChallenge } from '@/data/modules'

interface Props {
  starterCode: string
  challenge: string
  successHint: string
  challenges?: SandboxChallenge[]
  onComplete: (challengesCompleted?: number) => void
}

export default function SandboxStage({ starterCode, challenge, successHint, challenges, onComplete }: Props) {
  // Multi-challenge state
  const hasChallenges = challenges && challenges.length > 0
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  const currentChallenge = hasChallenges ? challenges![challengeIndex] : null
  const [code, setCode] = useState(currentChallenge?.starterCode ?? starterCode)
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [aiExplaining, setAiExplaining] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  function loadChallenge(index: number) {
    if (!challenges) return
    const c = challenges[index]
    setChallengeIndex(index)
    setCode(c.starterCode)
    setOutput(null)
    setError(null)
    setHasRun(false)
    setShowHint(false)
    setShowSolution(false)
  }

  const handleRun = useCallback(async () => {
    if (running) return
    setRunning(true)
    setOutput(null)
    setAiExplanation('')
    setError(null)

    const result = await runCode(code)
    setRunning(false)

    if (result.error) {
      setError(result.error)
    } else {
      const out = result.output || '(no output)'
      setOutput(out)
      setHasRun(true)

      // Check if this challenge is solved
      if (currentChallenge?.successCheck && out.includes(currentChallenge.successCheck)) {
        if (!completedChallenges.includes(challengeIndex)) {
          setCompletedChallenges(prev => [...prev, challengeIndex])
        }
      }
    }
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
  }, [code, running, currentChallenge, completedChallenges, challengeIndex])

  async function handleExplainError() {
    if (!error || aiExplaining) return
    setAiExplaining(true)
    setAiExplanation('')
    const prompt = `I'm a beginner. My code:\n\`\`\`python\n${code}\n\`\`\`\nError: ${error}\nExplain simply and how to fix it (2-3 sentences).`
    await streamMessageFromSchoolAI(
      prompt,
      (chunk) => setAiExplanation(prev => prev + chunk),
      () => setAiExplaining(false),
      { module_title: 'Code Lab' }
    )
  }

  function handleReset() {
    setCode(currentChallenge?.starterCode ?? starterCode)
    setOutput(null)
    setError(null)
    setShowHint(false)
    setShowSolution(false)
  }

  function handleNextChallenge() {
    if (!challenges || challengeIndex >= challenges.length - 1) {
      onComplete(completedChallenges.length)
      return
    }
    loadChallenge(challengeIndex + 1)
  }

  const isChallengeCompleted = completedChallenges.includes(challengeIndex)
  const allChallengesComplete = hasChallenges && completedChallenges.length === challenges!.length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-xs font-medium text-purple-400 mb-3">
          ⌨️ Stage 3 — Code Lab
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Your turn to code</h2>

        {/* Challenge tabs */}
        {hasChallenges && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {challenges!.map((c, i) => (
              <button
                key={i}
                onClick={() => loadChallenge(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  i === challengeIndex
                    ? 'bg-purple-600 text-white'
                    : completedChallenges.includes(i)
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {completedChallenges.includes(i) && <CheckCircle className="w-3 h-3" />}
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Current challenge description */}
      <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-xl p-4 mb-4">
        <p className="text-slate-300 text-sm leading-relaxed">
          <span className="font-semibold text-purple-300">Challenge: </span>
          {currentChallenge?.description ?? challenge}
        </p>
      </div>

      {/* Monaco code editor */}
      <div className="mb-3">
        <MonacoEditor
          value={code}
          onChange={setCode}
          onRun={handleRun}
          height="220px"
        />
      </div>

      {/* Controls row */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handleRun}
          disabled={running}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
        >
          {running ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>▶ Run Code</>
          )}
        </button>
        <button
          onClick={handleReset}
          className="w-12 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reset code"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hint system */}
      {currentChallenge && !isChallengeCompleted && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs font-medium hover:bg-amber-500/10 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showHint ? 'Hide Hint' : 'Hint'}
          </button>
          {showHint && (
            <button
              onClick={() => { setCode(currentChallenge.solution); setShowSolution(true) }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              Show Solution
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {showHint && currentChallenge && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3"
          >
            <p className="text-xs font-medium text-amber-400 mb-1">💡 Hint</p>
            <p className="text-sm text-amber-200">{currentChallenge.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output panel */}
      {(output !== null || error !== null) && (
        <div ref={outputRef} className="mb-4 animate-slide-up">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Error</p>
              <pre className="text-sm font-mono text-red-300 whitespace-pre-wrap">{error}</pre>
              {!aiExplanation && !aiExplaining && (
                <button onClick={handleExplainError} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition-colors">
                  <Sparkles className="w-3 h-3" /> Explain with AI
                </button>
              )}
              {(aiExplaining || aiExplanation) && (
                <div className="mt-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-medium text-purple-300">AI Explanation</span>
                    {aiExplaining && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
                  </div>
                  <p className="text-xs text-purple-100 leading-relaxed whitespace-pre-wrap">{aiExplanation}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`border rounded-2xl p-4 ${isChallengeCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#0f0f1a] border-teal-500/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium uppercase tracking-wider text-teal-400">Output</p>
                {isChallengeCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <pre className="text-sm font-mono text-white whitespace-pre-wrap">{output}</pre>
              {isChallengeCompleted && (
                <p className="text-xs text-emerald-400 mt-2 font-medium">✓ Challenge complete!</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Success / Continue */}
      {hasRun && (
        <div className="animate-slide-up space-y-3">
          {!hasChallenges && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
              <p className="text-sm text-purple-300">{successHint}</p>
            </div>
          )}

          {allChallengesComplete ? (
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <p className="text-emerald-300 font-semibold">🎉 All challenges complete!</p>
                <p className="text-xs text-emerald-400/70 mt-1">You completed {challenges!.length} sandbox challenges</p>
              </div>
              <button
                onClick={() => onComplete(completedChallenges.length)}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
              >
                Continue to AI Tutor →
              </button>
            </div>
          ) : isChallengeCompleted && hasChallenges && challengeIndex < challenges!.length - 1 ? (
            <button
              onClick={handleNextChallenge}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200"
            >
              Next Challenge
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : !hasChallenges ? (
            <button
              onClick={() => onComplete(0)}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => onComplete(completedChallenges.length)}
              className="w-full text-slate-400 hover:text-slate-200 text-sm py-2.5 transition-colors"
            >
              Skip remaining challenges →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
