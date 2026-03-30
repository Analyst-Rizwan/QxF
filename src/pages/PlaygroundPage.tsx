/**
 * Standalone Code Playground — Free coding environment
 * Features: Split-pane, input() support, AI error explain, Python reference, code templates
 */
import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, RotateCcw, BookOpen, Sparkles, ChevronLeft,
  Terminal, X, FileCode, Zap, Loader2, Copy, Check
} from 'lucide-react'
import MonacoEditor from '@/components/MonacoEditor'
import PythonReference from '@/components/PythonReference'
import { runCode } from '@/lib/api'
import { streamMessageFromSchoolAI } from '@/lib/ai'
import { getStudentProfile } from '@/hooks/useProgress'
import { loadXPState } from '@/lib/XPEngine'

const STARTER_TEMPLATES = [
  { label: 'Hello World', icon: '👋', code: '# My first program\nprint("Hello, World!")' },
  { label: 'Calculator', icon: '🧮', code: '# Simple calculator\na = 10\nb = 5\nprint("Sum:", a + b)\nprint("Difference:", a - b)\nprint("Product:", a * b)\nprint("Division:", a / b)' },
  { label: 'User Input', icon: '💬', code: '# Getting user input\nname = input("What is your name? ")\nage = input("How old are you? ")\nprint(f"Hello {name}! You are {age} years old.")' },
  { label: 'If-Else', icon: '🚦', code: '# Grade checker\nscore = 85\n\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelif score >= 70:\n    grade = "C"\nelse:\n    grade = "F"\n\nprint(f"Score: {score} → Grade: {grade}")' },
  { label: 'For Loop', icon: '🔁', code: '# Multiplication table\nnum = 7\nfor i in range(1, 11):\n    print(f"{num} × {i} = {num * i}")' },
  { label: 'Function', icon: '⚙️', code: '# A reusable function\ndef is_palindrome(text):\n    text = text.lower().replace(" ", "")\n    return text == text[::-1]\n\nwords = ["racecar", "hello", "madam", "python"]\nfor word in words:\n    result = "✅ Yes" if is_palindrome(word) else "❌ No"\n    print(f"{word} → {result}")' },
  { label: 'List Fun', icon: '📋', code: '# List operations\nfruits = ["apple", "mango", "banana", "grape"]\n\nprint("All fruits:", fruits)\nprint("First:", fruits[0])\nprint("Last:", fruits[-1])\n\nfruits.append("orange")\nprint("After adding orange:", fruits)\n\nfruits.sort()\nprint("Sorted:", fruits)' },
  { label: 'Pattern', icon: '⭐', code: '# Star pattern\nn = 5\nfor i in range(1, n + 1):\n    print("⭐" * i)' },
]

export default function PlaygroundPage() {
  const profile = getStudentProfile()
  const xpState = loadXPState()

  const [code, setCode] = useState(STARTER_TEMPLATES[0].code)
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState(false)

  // Input() support
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [inputPrompt, setInputPrompt] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [collectedInputs, setCollectedInputs] = useState<string[]>([])
  const [pendingCode, setPendingCode] = useState('')

  // AI Error explanation
  const [aiExplaining, setAiExplaining] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')

  // Python reference drawer
  const [showRef, setShowRef] = useState(false)

  // Templates panel
  const [showTemplates, setShowTemplates] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleRun = useCallback(async () => {
    if (running || waitingForInput) return
    setRunning(true)
    setOutput(null)
    setError(null)
    setAiExplanation('')
    setCollectedInputs([])

    // Check if code has input() calls — pre-collect inputs
    const inputCount = (code.match(/input\s*\(/g) || []).length
    if (inputCount > 0 && collectedInputs.length === 0) {
      // Find the first input() prompt text
      const match = code.match(/input\s*\(\s*["']([^"']*)["']\s*\)/)
      setPendingCode(code)
      setInputPrompt(match ? match[1] : 'Enter value:')
      setWaitingForInput(true)
      setRunning(false)
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    const result = await runCode(code, collectedInputs.length > 0 ? collectedInputs : undefined)
    setRunning(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOutput(result.output || '(no output)')
    }
    setCollectedInputs([])
  }, [code, running, waitingForInput, collectedInputs])

  async function handleSubmitInput() {
    const newInputs = [...collectedInputs, inputValue]
    setCollectedInputs(newInputs)
    setInputValue('')

    // Check if there are more input() calls
    const inputCount = (pendingCode.match(/input\s*\(/g) || []).length
    if (newInputs.length < inputCount) {
      // Find the next input prompt
      const matches = [...pendingCode.matchAll(/input\s*\(\s*["']([^"']*)["']\s*\)/g)]
      const nextPrompt = matches[newInputs.length]
      setInputPrompt(nextPrompt ? nextPrompt[1] : 'Enter value:')
      setTimeout(() => inputRef.current?.focus(), 50)
      return
    }

    // All inputs collected — run the code
    setWaitingForInput(false)
    setRunning(true)
    setOutput(null)
    setError(null)

    const result = await runCode(pendingCode, newInputs)
    setRunning(false)

    if (result.error) {
      setError(result.error)
    } else {
      setOutput(result.output || '(no output)')
    }
    setPendingCode('')
    setCollectedInputs([])
  }

  function cancelInput() {
    setWaitingForInput(false)
    setCollectedInputs([])
    setPendingCode('')
  }

  async function handleExplainError() {
    if (!error || aiExplaining) return
    setAiExplaining(true)
    setAiExplanation('')

    const prompt = `I'm a beginner student. I wrote this Python code:\n\n\`\`\`python\n${code}\n\`\`\`\n\nAnd got this error:\n${error}\n\nExplain what went wrong in simple terms and how to fix it. Keep it short (2-3 sentences max).`

    await streamMessageFromSchoolAI(
      prompt,
      (chunk) => setAiExplanation(prev => prev + chunk),
      () => setAiExplaining(false),
      { module_title: 'Code Playground' }
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleInsertTemplate(templateCode: string) {
    setCode(templateCode)
    setOutput(null)
    setError(null)
    setAiExplanation('')
    setShowTemplates(false)
  }

  function handleReset() {
    setCode('# Write your Python code here\n')
    setOutput(null)
    setError(null)
    setAiExplanation('')
    setCollectedInputs([])
    setWaitingForInput(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f0f1a]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/modules" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                E
              </div>
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                Code Playground
              </h1>
              <p className="text-[10px] text-slate-500">Write, run & experiment freely</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* XP badge */}
            <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 text-xs text-amber-400">
              <Zap className="w-3 h-3" />
              <span className="font-medium">{xpState.totalXP} XP</span>
            </div>

            {/* Template button */}
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            {/* Reference button */}
            <button
              onClick={() => setShowRef(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reference</span>
            </button>
          </div>
        </div>
      </header>

      {/* Templates dropdown */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="sticky top-[58px] z-20 bg-[#1a1a2e] border-b border-slate-700 shadow-xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">Start from a template:</p>
                <button onClick={() => setShowTemplates(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {STARTER_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => handleInsertTemplate(t.code)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — split pane on desktop */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Editor pane */}
        <div className="flex-1 flex flex-col p-4 lg:border-r border-slate-800">
          <MonacoEditor
            value={code}
            onChange={setCode}
            onRun={handleRun}
            height="calc(100vh - 260px)"
            filename="playground.py"
          />

          {/* Controls */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleRun}
              disabled={running || waitingForInput}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5"
            >
              {running ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
              ) : (
                <><Play className="w-4 h-4" />Run Code</>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="w-12 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="w-12 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Output pane */}
        <div className="lg:w-[420px] flex flex-col p-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-medium text-slate-300">Output</h3>
          </div>

          {/* Terminal-style output */}
          <div className="flex-1 bg-[#0a0a14] border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[200px] lg:min-h-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border-b border-slate-800">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[10px] text-slate-600 font-mono">terminal</span>
            </div>

            <div className="flex-1 p-3 font-mono text-sm overflow-y-auto">
              {/* Waiting for input */}
              <AnimatePresence>
                {waitingForInput && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    {collectedInputs.map((inp, i) => (
                      <div key={i} className="text-slate-400">
                        <span className="text-teal-400">{'>'} </span>
                        <span className="text-white">{inp}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 flex-shrink-0">{inputPrompt}</span>
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmitInput() }}
                        className="flex-1 bg-transparent outline-none text-white caret-amber-400"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSubmitInput}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/30 transition-colors"
                      >
                        Submit ↵
                      </button>
                      <button
                        onClick={cancelInput}
                        className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Running indicator */}
              {running && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing...</span>
                </div>
              )}

              {/* Output */}
              {output && !waitingForInput && (
                <pre className="text-white whitespace-pre-wrap">{output}</pre>
              )}

              {/* Error */}
              {error && !waitingForInput && (
                <div className="space-y-3">
                  <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>

                  {/* AI Explain Error button */}
                  {!aiExplanation && !aiExplaining && (
                    <button
                      onClick={handleExplainError}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium hover:bg-purple-500/20 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Explain this error with AI
                    </button>
                  )}

                  {/* AI Explanation */}
                  {(aiExplaining || aiExplanation) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-purple-300">AI Explanation</span>
                        {aiExplaining && <Loader2 className="w-3 h-3 animate-spin text-purple-400 ml-1" />}
                      </div>
                      <p className="text-sm text-purple-100 leading-relaxed whitespace-pre-wrap">{aiExplanation}</p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!output && !error && !running && !waitingForInput && (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  <div className="text-center">
                    <p>Run your code to see output here</p>
                    <p className="mt-1 text-slate-700">Ctrl+Enter or click Run Code</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Student info */}
          {profile && (
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span>Logged in as <span className="text-amber-400">{profile.name}</span></span>
              <span>•</span>
              <Link to="/profile" className="text-purple-400 hover:text-purple-300 transition-colors">
                View Profile →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Python Reference Drawer */}
      <PythonReference
        isOpen={showRef}
        onClose={() => setShowRef(false)}
        onInsertCode={(insertCode) => {
          setCode(insertCode)
          setShowRef(false)
        }}
      />
    </div>
  )
}
