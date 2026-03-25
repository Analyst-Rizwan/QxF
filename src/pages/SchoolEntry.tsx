// T1: Batch code enrollment page
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { VALID_BATCH_CODES } from '@/data/modules'
import { setEnrollment } from '@/hooks/useProgress'

export default function SchoolEntry() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()

    if (!trimmed) {
      setError('Please enter your batch code')
      return
    }
    if (trimmed.length !== 6) {
      setError('Batch codes are 6 characters long')
      return
    }

    setLoading(true)
    setError('')

    // Simulate brief validation delay for UX
    setTimeout(() => {
      const batchName = VALID_BATCH_CODES[trimmed]
      if (!batchName) {
        setError('Code not recognized. Please check with your teacher.')
        setLoading(false)
        return
      }
      setEnrollment(trimmed, batchName)
      navigate('/module/m1')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-4">
      {/* Background gradient blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-500/25 mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold text-white">EduAI School</h1>
          <p className="text-slate-400 text-sm mt-1">Learn programming, step by step</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Enter your batch code</h2>
          <p className="text-slate-400 text-sm mb-6">
            Your teacher gave you a 6-character code to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="batch-code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder="e.g. PILOT1"
                className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3.5 text-center text-xl font-mono font-bold tracking-[0.3em] text-white placeholder:text-slate-600 placeholder:font-normal placeholder:tracking-normal placeholder:text-base outline-none transition-all duration-200
                  ${error ? 'border-red-500/70 focus:border-red-400' : 'border-slate-700 focus:border-amber-400/60'}`}
                autoComplete="off"
                spellCheck={false}
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5 animate-fade-in">
                  <span>⚠</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                'Start Learning →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          EduAI School Pilot · Powered by EduAI
        </p>
      </div>
    </div>
  )
}
