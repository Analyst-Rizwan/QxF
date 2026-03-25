// Stage 5 — Quiz
// MCQ questions with instant feedback + score summary
import { useState } from 'react'

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface Props {
  questions: QuizQuestion[]
  onComplete: () => void
}

export default function QuizStage({ questions, onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showSummary, setShowSummary] = useState(false)

  const q = questions[currentQ]
  const isAnswered = selected !== null
  const score = answers.filter(Boolean).length

  function handleSelect(idx: number) {
    if (isAnswered) return
    setSelected(idx)
  }

  function handleNext() {
    const correct = selected === q.correctIndex
    const newAnswers = [...answers, correct]
    setAnswers(newAnswers)

    if (currentQ + 1 >= questions.length) {
      setShowSummary(true)
    } else {
      setCurrentQ((prev) => prev + 1)
      setSelected(null)
    }
  }

  if (showSummary) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-xs font-medium text-green-400 mb-5">
          ✅ Stage 5 — Quiz Complete
        </div>

        {/* Score card */}
        <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-6 mb-5 text-center">
          <div className="text-5xl font-bold text-white mb-1">
            {score}<span className="text-slate-500 text-2xl">/{questions.length}</span>
          </div>
          <p className="text-slate-400 text-sm mb-4">{pct}% correct</p>

          {/* Bar */}
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                pct >= 80 ? 'bg-green-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="text-sm text-slate-300">
            {pct === 100
              ? '🎉 Perfect! You nailed it!'
              : pct >= 80
              ? '🌟 Great job! You really understand programs.'
              : pct >= 50
              ? '👍 Good effort! Review the ones you missed.'
              : '💪 Keep going — review the module and try again!'}
          </p>
        </div>

        {/* Answer review */}
        <div className="space-y-2 mb-5">
          {questions.map((qu, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                answers[i]
                  ? 'border-green-500/20 bg-green-500/5 text-green-300'
                  : 'border-red-500/20 bg-red-500/5 text-red-300'
              }`}
            >
              <span className="flex-shrink-0 mt-0.5">{answers[i] ? '✓' : '✗'}</span>
              <span className="text-slate-300">{qu.question}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
        >
          Complete Module ✓
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-xs font-medium text-green-400 mb-3">
          ✅ Stage 5 — Quiz
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Quick check</h2>
        <p className="text-slate-400 text-sm">Let's see what you learned.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-slate-500">Q{currentQ + 1} of {questions.length}</span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5 mb-4">
        <p className="text-base font-semibold text-white leading-relaxed">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-4">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex
          const isSelected = i === selected

          let style = 'border-slate-700/50 bg-[#1a1a2e] text-slate-300 hover:border-slate-500 hover:bg-slate-800/50'
          if (isAnswered) {
            if (isCorrect) style = 'border-green-500/60 bg-green-500/10 text-green-300'
            else if (isSelected) style = 'border-red-500/60 bg-red-500/10 text-red-300'
            else style = 'border-slate-700/30 bg-[#1a1a2e] text-slate-500 opacity-50'
          } else if (isSelected) {
            style = 'border-purple-400/60 bg-purple-500/10 text-purple-300'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 disabled:cursor-default flex items-center gap-3 ${style}`}
            >
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs flex-shrink-0 font-mono">
                {isAnswered && isCorrect ? '✓' : isAnswered && isSelected ? '✗' : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation (after answer) */}
      {isAnswered && (
        <div className={`rounded-xl p-3 mb-4 animate-slide-up border text-sm ${
          selected === q.correctIndex
            ? 'bg-green-500/10 border-green-500/20 text-green-300'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <span className="font-medium">{selected === q.correctIndex ? '✓ Correct! ' : '✗ Not quite. '}</span>
          <span className="text-slate-300">{q.explanation}</span>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={!isAnswered}
        className="w-full bg-gradient-to-r from-green-500 to-teal-400 hover:from-green-400 hover:to-teal-300 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-green-500/20 hover:-translate-y-0.5"
      >
        {currentQ + 1 >= questions.length ? 'See results →' : 'Next →'}
      </button>
    </div>
  )
}
