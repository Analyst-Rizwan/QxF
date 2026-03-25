// Stage 3 — Pyodide Sandbox
// Students edit and run Python in the browser, zero backend
import { useState, useRef } from 'react'
import { usePyodide } from '@/hooks/usePyodide'

interface Props {
  starterCode: string
  challenge: string
  successHint: string
  onComplete: () => void
}

export default function SandboxStage({ starterCode, challenge, successHint, onComplete }: Props) {
  const { isLoading, isReady, loadError, runPython } = usePyodide()
  const [code, setCode] = useState(starterCode)
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  async function handleRun() {
    if (!isReady || running) return
    setRunning(true)
    setOutput(null)
    setError(null)

    const result = await runPython(code)

    setRunning(false)
    if (result.error) {
      setError(result.error)
    } else {
      setOutput(result.output || '(no output)')
      setHasRun(true)
    }
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100)
  }

  function handleReset() {
    setCode(starterCode)
    setOutput(null)
    setError(null)
  }

  const lineCount = code.split('\n').length

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-xs font-medium text-purple-400 mb-3">
          ⌨️ Stage 3 — Try it
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Your turn</h2>
        <p className="text-slate-400 text-sm leading-relaxed">{challenge}</p>
      </div>

      {/* Pyodide loading state */}
      {isLoading && (
        <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5 mb-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm text-white font-medium">Loading Python engine...</p>
            <p className="text-xs text-slate-500 mt-0.5">First load takes ~10 seconds. It's cached after that.</p>
          </div>
        </div>
      )}

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4">
          <p className="text-sm text-red-400">⚠ Couldn't load Python engine: {loadError}</p>
          <p className="text-xs text-slate-500 mt-1">Check your internet connection and refresh.</p>
        </div>
      )}

      {/* Code editor */}
      <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl overflow-hidden mb-3">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-slate-500 font-mono">program.py</span>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reset ↺
          </button>
        </div>

        {/* Editor */}
        <div className="flex">
          {/* Line numbers */}
          <div className="flex-shrink-0 px-3 py-3 bg-[#0f0f1a]/50 border-r border-slate-700/30 select-none">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-xs text-slate-600 font-mono leading-6 text-right min-w-[1.5rem]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-transparent px-3 py-3 text-xs font-mono text-slate-200 leading-6 outline-none resize-none min-h-[140px]"
            style={{ tabSize: 4 }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault()
                const el = e.currentTarget
                const start = el.selectionStart
                const end = el.selectionEnd
                const newVal = code.substring(0, start) + '    ' + code.substring(end)
                setCode(newVal)
                requestAnimationFrame(() => {
                  el.selectionStart = el.selectionEnd = start + 4
                })
              }
            }}
          />
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={!isReady || running}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 mb-3"
      >
        {running ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Running...
          </>
        ) : (
          <>▶ Run</>
        )}
      </button>

      {/* Output panel */}
      {(output !== null || error !== null) && (
        <div ref={outputRef} className="mb-4 animate-slide-up">
          {error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <p className="text-xs font-medium text-red-400 uppercase tracking-wider mb-1">Error</p>
              <pre className="text-sm font-mono text-red-300 whitespace-pre-wrap">{error}</pre>
              <p className="text-xs text-slate-500 mt-2">Check your code for typos and try again.</p>
            </div>
          ) : (
            <div className="bg-[#0f0f1a] border border-teal-500/30 rounded-2xl p-4">
              <p className="text-xs font-medium text-teal-400 uppercase tracking-wider mb-1">Output</p>
              <pre className="text-sm font-mono text-white whitespace-pre-wrap">{output}</pre>
            </div>
          )}
        </div>
      )}

      {/* Success hint + continue */}
      {hasRun && (
        <div className="animate-slide-up space-y-3">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
            <p className="text-sm text-purple-300">{successHint}</p>
          </div>
          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}
