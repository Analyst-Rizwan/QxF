/**
 * Standalone Code Playground — Multi-language, Judge0 CE backed
 * Features: 17 languages, Monaco editor, stdin, status badges, AI error explain, templates
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, RotateCcw, BookOpen, Sparkles, ChevronLeft,
  Terminal, X, FileCode, Zap, Loader2, Copy, Check,
  ChevronDown, Clock, Cpu, AlertCircle, CheckCircle2,
  AlertTriangle, Keyboard,
} from 'lucide-react'
import MonacoEditor from '@/components/MonacoEditor'
import PythonReference from '@/components/PythonReference'
import { codeApi, J0ExecuteResponse } from '@/lib/api'
import { runCode } from '@/lib/api'
import { streamMessageFromSchoolAI } from '@/lib/ai'
import { getStudentProfile } from '@/hooks/useProgress'
import { loadXPState } from '@/lib/XPEngine'

// ─── Language definitions ────────────────────────────────────────────────────

interface Language {
  id: number
  name: string
  monacoLang: string
  label: string
  boilerplate: string
}

const LANGUAGES: Language[] = [
  {
    id: 71, name: 'Python (3.8.1)', monacoLang: 'python', label: 'Python',
    boilerplate: '# Python\nprint("Hello, World!")\n',
  },
  {
    id: 63, name: 'JavaScript (Node.js 12.14.0)', monacoLang: 'javascript', label: 'JavaScript',
    boilerplate: '// JavaScript\nconsole.log("Hello, World!");\n',
  },
  {
    id: 74, name: 'TypeScript (3.7.4)', monacoLang: 'typescript', label: 'TypeScript',
    boilerplate: '// TypeScript\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);\n',
  },
  {
    id: 54, name: 'C++ (GCC 9.2.0)', monacoLang: 'cpp', label: 'C++',
    boilerplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  },
  {
    id: 50, name: 'C (GCC 9.2.0)', monacoLang: 'c', label: 'C',
    boilerplate: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
  },
  {
    id: 62, name: 'Java (OpenJDK 13.0.1)', monacoLang: 'java', label: 'Java',
    boilerplate: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  },
  {
    id: 60, name: 'Go (1.13.5)', monacoLang: 'go', label: 'Go',
    boilerplate: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n',
  },
  {
    id: 73, name: 'Rust (1.40.0)', monacoLang: 'rust', label: 'Rust',
    boilerplate: 'fn main() {\n    println!("Hello, World!");\n}\n',
  },
  {
    id: 51, name: 'C# (Mono 6.6.0)', monacoLang: 'csharp', label: 'C#',
    boilerplate: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}\n',
  },
  {
    id: 78, name: 'Kotlin (1.3.70)', monacoLang: 'kotlin', label: 'Kotlin',
    boilerplate: 'fun main() {\n    println("Hello, World!")\n}\n',
  },
  {
    id: 72, name: 'Ruby (2.7.0)', monacoLang: 'ruby', label: 'Ruby',
    boilerplate: '# Ruby\nputs "Hello, World!"\n',
  },
  {
    id: 83, name: 'Swift (5.2.3)', monacoLang: 'swift', label: 'Swift',
    boilerplate: 'print("Hello, World!")\n',
  },
  {
    id: 68, name: 'PHP (7.4.1)', monacoLang: 'php', label: 'PHP',
    boilerplate: '<?php\necho "Hello, World!\\n";\n',
  },
  {
    id: 90, name: 'Dart (2.19.2)', monacoLang: 'dart', label: 'Dart',
    boilerplate: 'void main() {\n  print("Hello, World!");\n}\n',
  },
  {
    id: 46, name: 'Bash (5.0.0)', monacoLang: 'shell', label: 'Bash',
    boilerplate: '#!/bin/bash\necho "Hello, World!"\n',
  },
  {
    id: 80, name: 'R (4.0.0)', monacoLang: 'r', label: 'R',
    boilerplate: 'cat("Hello, World!\\n")\n',
  },
  {
    id: 82, name: 'SQL (SQLite 3.27.2)', monacoLang: 'sql', label: 'SQL',
    boilerplate: 'SELECT "Hello, World!" AS greeting;\n',
  },
]

const PYTHON_LANG = LANGUAGES[0]

// ─── Templates (Python-specific) ─────────────────────────────────────────────

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

// ─── Status helpers ───────────────────────────────────────────────────────────

type RunStatus = 'idle' | 'running' | 'accepted' | 'error' | 'tle' | 'mle'

function judgeStatusToRunStatus(id: number): RunStatus {
  if (id === 3) return 'accepted'
  if (id === 5) return 'tle'
  if (id === 6) return 'mle'
  if (id >= 4) return 'error'
  return 'idle'
}

const STATUS_CONFIG: Record<RunStatus, { label: string; color: string; icon: React.ReactNode }> = {
  idle:     { label: 'Ready',              color: 'text-slate-400',   icon: <Terminal className="w-3.5 h-3.5" /> },
  running:  { label: 'Running…',           color: 'text-amber-400',   icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  accepted: { label: 'Accepted',           color: 'text-emerald-400', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  error:    { label: 'Error',              color: 'text-red-400',     icon: <AlertCircle className="w-3.5 h-3.5" /> },
  tle:      { label: 'Time Limit Exceeded', color: 'text-orange-400', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  mle:      { label: 'Memory Limit',       color: 'text-orange-400',  icon: <AlertTriangle className="w-3.5 h-3.5" /> },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const profile = getStudentProfile()
  const xpState = loadXPState()

  const [selectedLang, setSelectedLang] = useState<Language>(PYTHON_LANG)
  const [code, setCode] = useState(PYTHON_LANG.boilerplate)
  const [stdin, setStdin] = useState('')
  const [activeTab, setActiveTab] = useState<'output' | 'stdin'>('output')
  const [runStatus, setRunStatus] = useState<RunStatus>('idle')
  const [result, setResult] = useState<J0ExecuteResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showRef, setShowRef] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  // AI error explain
  const [aiExplaining, setAiExplaining] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')

  const langMenuRef = useRef<HTMLDivElement>(null)

  // Close lang menu on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Ctrl+Enter global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  function handleSelectLang(lang: Language) {
    setSelectedLang(lang)
    setCode(lang.boilerplate)
    setResult(null)
    setRunStatus('idle')
    setErrorMessage(null)
    setAiExplanation('')
    setShowLangMenu(false)
  }

  function handleInsertTemplate(templateCode: string) {
    setCode(templateCode)
    setResult(null)
    setRunStatus('idle')
    setErrorMessage(null)
    setAiExplanation('')
    setShowTemplates(false)
  }

  function handleReset() {
    setCode(selectedLang.boilerplate)
    setResult(null)
    setRunStatus('idle')
    setErrorMessage(null)
    setAiExplanation('')
    setStdin('')
  }

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = useCallback(async () => {
    if (runStatus === 'running') return
    setRunStatus('running')
    setResult(null)
    setErrorMessage(null)
    setAiExplanation('')
    setActiveTab('output')

    try {
      // Python fallback: use local runner if Judge0 unavailable
      const res = await codeApi.execute({
        source_code: code,
        language_id: selectedLang.id,
        stdin: stdin || undefined,
      })
      setResult(res)
      setRunStatus(judgeStatusToRunStatus(res.status.id))
    } catch (err: any) {
      // If Judge0 fails and language is Python, fall back to local runner
      if (selectedLang.monacoLang === 'python') {
        try {
          const fallback = await runCode(code)
          if (fallback.error) {
            setErrorMessage(fallback.error)
            setRunStatus('error')
          } else {
            setResult({
              stdout: fallback.output,
              stderr: null,
              compile_output: null,
              status: { id: 3, description: 'Accepted' },
              time: null,
              memory: null,
              token: null,
            })
            setRunStatus('accepted')
          }
          return
        } catch { /* fall through to the outer error */ }
      }
      setErrorMessage(err.message || 'Failed to connect to code execution service.')
      setRunStatus('error')
    }
  }, [code, selectedLang, stdin, runStatus])

  async function handleExplainError() {
    if (aiExplaining) return
    const errText = errorOutput
    if (!errText) return
    setAiExplaining(true)
    setAiExplanation('')

    const prompt = `I'm a student learning ${selectedLang.label}. I wrote this code:\n\n\`\`\`${selectedLang.monacoLang}\n${code}\n\`\`\`\n\nAnd got this error:\n${errText}\n\nExplain what went wrong in simple terms and how to fix it. Keep it short (2-3 sentences max).`

    await streamMessageFromSchoolAI(
      prompt,
      (chunk) => setAiExplanation(prev => prev + chunk),
      () => setAiExplaining(false),
      { module_title: 'Code Playground' }
    )
  }

  // Derived output text
  const stdout = result?.stdout?.trim() || ''
  const stderr = result?.stderr?.trim() || ''
  const compileErr = result?.compile_output?.trim() || ''
  const errorOutput = errorMessage || compileErr || stderr
  const hasOutput = stdout || errorOutput
  const statusCfg = STATUS_CONFIG[runStatus]

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#0f0f1a]/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Back + Logo */}
          <Link to="/modules" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors flex-shrink-0">
            <ChevronLeft className="w-4 h-4" />
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">E</div>
          </Link>

          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-purple-400" />
              Code Playground
            </h1>
            <p className="text-[10px] text-slate-500 hidden sm:block">Multi-language · Judge0 CE</p>
          </div>

          <div className="flex-1" />

          {/* Status badge */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium ${statusCfg.color} transition-colors`}>
            {statusCfg.icon}
            <span>{statusCfg.label}</span>
          </div>

          {/* XP */}
          <div className="hidden md:flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 text-xs text-amber-400">
            <Zap className="w-3 h-3" />
            <span className="font-medium">{xpState.totalXP} XP</span>
          </div>

          {/* Language selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              <span>{selectedLang.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-52 bg-[#1a1a2e] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-1 max-h-72 overflow-y-auto">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => handleSelectLang(lang)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between
                          ${selectedLang.id === lang.id
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'text-slate-300 hover:bg-slate-800'}`}
                      >
                        <span>{lang.label}</span>
                        {selectedLang.id === lang.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Templates (Python only) */}
          {selectedLang.monacoLang === 'python' && (
            <button
              onClick={() => setShowTemplates(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Templates</span>
            </button>
          )}

          {/* Reference */}
          <button
            onClick={() => setShowRef(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ref</span>
          </button>

          {/* Shortcuts */}
          <button
            onClick={() => setShowShortcuts(v => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading bar */}
        <AnimatePresence>
          {runStatus === 'running' && (
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="h-0.5 bg-gradient-to-r from-purple-500 via-violet-400 to-purple-600 w-full"
            />
          )}
        </AnimatePresence>
      </header>

      {/* ── Templates panel ── */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#13131f] border-b border-slate-700/60 overflow-hidden z-30"
          >
            <div className="max-w-screen-xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">Python templates:</p>
                <button onClick={() => setShowTemplates(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {STARTER_TEMPLATES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => handleInsertTemplate(t.code)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap flex-shrink-0"
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

      {/* ── Shortcuts modal ── */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1a1a2e] border border-slate-700 rounded-2xl p-5 w-72 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-purple-400" /> Shortcuts
                </h3>
                <button onClick={() => setShowShortcuts(false)} className="text-slate-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {[
                ['Ctrl + Enter', 'Run code'],
                ['Ctrl + Z', 'Undo'],
                ['Ctrl + Shift + Z', 'Redo'],
                ['Ctrl + /', 'Toggle comment'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <span className="text-xs text-slate-400">{desc}</span>
                  <kbd className="text-[10px] font-mono bg-slate-800 border border-slate-600 text-slate-300 px-2 py-0.5 rounded">{key}</kbd>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main split pane ── */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-screen-xl w-full mx-auto">

        {/* Editor pane */}
        <div className="flex-1 flex flex-col p-4 lg:border-r border-slate-800">
          <MonacoEditor
            value={code}
            onChange={setCode}
            onRun={handleRun}
            language={selectedLang.monacoLang}
            height="calc(100vh - 240px)"
          />

          {/* Controls */}
          <div className="flex gap-2 mt-3">
            <button
              id="playground-run-btn"
              onClick={handleRun}
              disabled={runStatus === 'running'}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              {runStatus === 'running' ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Running…</>
              ) : (
                <><Play className="w-4 h-4" />Run Code</>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="w-11 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="w-11 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Reset to boilerplate"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Student info */}
          {profile && (
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span>Logged in as <span className="text-amber-400">{profile.name}</span></span>
              <span>·</span>
              <Link to="/profile" className="text-purple-400 hover:text-purple-300 transition-colors">View Profile →</Link>
            </div>
          )}
        </div>

        {/* Output pane */}
        <div className="lg:w-[420px] flex flex-col p-4">

          {/* Output / Stdin tabs + metadata */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-1 bg-slate-800/60 rounded-lg p-0.5">
              {(['output', 'stdin'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize
                    ${activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Execution metadata */}
            {result && runStatus !== 'running' && (
              <div className="flex items-center gap-2">
                {result.time && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 rounded-md px-2 py-1">
                    <Clock className="w-2.5 h-2.5" />{result.time}s
                  </span>
                )}
                {result.memory && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 rounded-md px-2 py-1">
                    <Cpu className="w-2.5 h-2.5" />{(result.memory / 1024).toFixed(1)} MB
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Terminal / Stdin panel */}
          <div className="flex-1 flex flex-col bg-[#09090f] border border-slate-800 rounded-xl overflow-hidden min-h-[200px] lg:min-h-0">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex-shrink-0">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <span className="text-[10px] text-slate-600 font-mono">{activeTab}</span>
              {/* Status badge (mobile) */}
              <div className={`ml-auto flex items-center gap-1 text-[10px] font-medium ${statusCfg.color} sm:hidden`}>
                {statusCfg.icon}
                <span>{statusCfg.label}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* ── STDIN tab ── */}
              {activeTab === 'stdin' && (
                <div className="p-3 h-full flex flex-col">
                  <p className="text-[10px] text-slate-500 mb-2">Program input (stdin) — one value per line:</p>
                  <textarea
                    value={stdin}
                    onChange={e => setStdin(e.target.value)}
                    placeholder="e.g.\nAlice\n25"
                    className="flex-1 w-full bg-transparent text-sm font-mono text-slate-300 placeholder-slate-600 outline-none resize-none"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* ── OUTPUT tab ── */}
              {activeTab === 'output' && (
                <div className="p-3 font-mono text-sm h-full">
                  {/* Running */}
                  {runStatus === 'running' && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing on Judge0 CE…</span>
                    </div>
                  )}

                  {/* stdout */}
                  {stdout && runStatus !== 'running' && (
                    <pre className="text-white whitespace-pre-wrap leading-relaxed">{stdout}</pre>
                  )}

                  {/* Error / stderr / compile error */}
                  {errorOutput && runStatus !== 'running' && (
                    <div className="space-y-3">
                      <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">{errorOutput}</pre>

                      {/* AI Explain button */}
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
                          initial={{ opacity: 0, y: 6 }}
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

                  {/* TLE / MLE special message */}
                  {runStatus === 'tle' && !errorOutput && (
                    <p className="text-orange-400">⏱️ Time Limit Exceeded — your code took too long to execute.</p>
                  )}
                  {runStatus === 'mle' && !errorOutput && (
                    <p className="text-orange-400">💾 Memory Limit Exceeded — your program used too much memory.</p>
                  )}

                  {/* Empty state */}
                  {!hasOutput && runStatus !== 'running' && runStatus !== 'tle' && runStatus !== 'mle' && (
                    <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                      <div className="text-center space-y-1">
                        <p>Run your code to see output here</p>
                        <p className="text-slate-700">Ctrl+Enter or click Run Code</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
