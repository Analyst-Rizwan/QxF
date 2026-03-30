import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getEnrollment } from '@/hooks/useProgress'
import { setStudentProfile } from '@/hooks/useProgress'

export default function StudentProfileSetup() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const enrollment = getEnrollment()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Please enter your name')
      return
    }
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }
    if (!enrollment) {
      navigate('/')
      return
    }
    setStudentProfile(trimmed, enrollment.batchCode, enrollment.batchName)
    navigate('/modules')
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-4">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">✓</div>
          <div className="h-px w-8 bg-slate-600" />
          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs text-black font-bold">2</div>
          <div className="h-px w-8 bg-slate-700" />
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-500 font-bold">3</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-6 shadow-2xl"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">👋</div>
            <h2 className="text-xl font-bold text-white mb-1">What's your name?</h2>
            <p className="text-slate-400 text-sm">
              This is just for the AI Tutor so it can address you personally.
            </p>
            {enrollment && (
              <p className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mt-3 inline-block font-mono">
                {enrollment.batchName}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="student-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="e.g. Priya"
                autoFocus
                autoComplete="given-name"
                className={`w-full bg-[#0f0f1a] border rounded-xl px-4 py-3.5 text-center text-lg font-semibold text-white placeholder:text-slate-600 placeholder:font-normal outline-none transition-all duration-200
                  ${error ? 'border-red-500/70 focus:border-red-400' : 'border-slate-700 focus:border-amber-400/60'}`}
              />
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                  <span>⚠</span> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-semibold rounded-xl py-3.5 text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Let's Start Learning →
            </button>
          </form>
        </motion.div>

        <p className="text-center text-slate-600 text-xs mt-6">
          EduAI School · Your name stays on this device only
        </p>
      </div>
    </div>
  )
}
