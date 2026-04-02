import { useEffect, useState } from 'react'
import { Download, Users, CheckCircle, Activity, ChevronRight, Loader2, Star, BarChart2 } from 'lucide-react'
import { getAllProgress, getStudentProfile } from '@/hooks/useProgress'
import { MODULES, MODULE_ORDER } from '@/data/modules'
import { loadXPState } from '@/lib/XPEngine'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface ApiStudentProgress {
  id: string
  name: string
  stages_completed: number
  quiz_score: number | null
  completed_at: string | null
}

interface ApiDashboardData {
  batch_code: string
  enrolled: number
  active: number
  completed: number
  average_score: number
  students: ApiStudentProgress[]
}

export default function DashboardPage() {
  const [apiData, setApiData] = useState<ApiDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Local real data from this browser session
  const localProgress = getAllProgress()
  const localProfile = getStudentProfile()
  const localXP = loadXPState()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/school/dashboard`)
        if (!res.ok) throw new Error('API not available')
        const json = await res.json()
        setApiData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Build local student row
  const localStudent: ApiStudentProgress | null = localProfile ? {
    id: 'local-1',
    name: localProfile.name,
    stages_completed: Object.values(localProgress).reduce((acc, p) => acc + p.stagesCompleted.length, 0),
    quiz_score: (() => {
      const scores = Object.values(localProgress).filter(p => p.quizScore !== undefined).map(p => p.quizScore as number)
      return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    })(),
    completed_at: Object.values(localProgress).some(p => p.completedAt) ? new Date().toISOString() : null,
  } : null

  // Merge: API data takes priority; local session is appended if no API
  const displayData: ApiDashboardData = apiData ?? {
    batch_code: localProfile?.batchCode ?? 'PILOT1',
    enrolled: localStudent ? 1 : 12,
    active: 1,
    completed: localStudent?.completed_at ? 1 : 0,
    average_score: localStudent?.quiz_score ?? 0,
    students: localStudent ? [localStudent] : [
      { id: '1', name: 'Student A', stages_completed: 5, quiz_score: 80, completed_at: new Date().toISOString() },
      { id: '2', name: 'Student B', stages_completed: 3, quiz_score: null, completed_at: null },
      { id: '3', name: 'Student C', stages_completed: 5, quiz_score: 100, completed_at: new Date().toISOString() },
    ],
  }

  function handleExportCsv() {
    const headers = ['Student ID', 'Name', 'Stages Completed', 'Quiz Score', 'Status']
    const rows = displayData.students.map(s => [
      s.id,
      s.name,
      s.stages_completed.toString(),
      s.quiz_score !== null ? s.quiz_score + '%' : 'N/A',
      s.completed_at ? 'Completed' : 'In Progress',
    ])
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `eduai_batch_${displayData.batch_code}_report.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Coordinator Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Batch Code: <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{displayData.batch_code}</span>
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-lg text-sm transition-colors text-white whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-lg text-sm">
            ⚠ Backend API not connected. Showing {localStudent ? 'live session' : 'preview'} data.
          </div>
        )}

        {/* Live Session Card (only when API is offline) */}
        {error && localProfile && (
          <div className="bg-[#1a1a2e] border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <p className="text-sm font-medium text-purple-300">Live Session — {localProfile.name}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {MODULE_ORDER.map(slug => {
                const prog = localProgress[slug]
                const mod = MODULES[slug]
                if (!mod) return null
                const done = prog?.stagesCompleted.length ?? 0
                const completed = prog?.completedAt != null
                return (
                  <div key={slug} className={`p-3 rounded-xl border ${completed ? 'border-emerald-500/20 bg-emerald-500/5' : done > 0 ? 'border-blue-500/20 bg-blue-500/5' : 'border-slate-700 bg-slate-900'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mod.icon}</span>
                      <div>
                        <p className="text-xs font-medium text-slate-200 leading-tight">{mod.title}</p>
                        <p className="text-[10px] text-slate-500">{done}/{mod.stages.length} stages{prog?.quizScore !== undefined ? ` · ${prog.quizScore}%` : ''}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>{localXP.totalXP} XP • Level {localXP.level}: {localXP.levelName}</span>
              <span>•</span>
              <span>{localXP.unlockedAchievementIds.length} achievements</span>
            </div>
          </div>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Enrolled', value: displayData.enrolled, icon: <Users className="w-5 h-5 text-blue-400" />, bg: 'bg-blue-500/10' },
            { label: 'Active', value: displayData.active, icon: <Activity className="w-5 h-5 text-amber-400" />, bg: 'bg-amber-500/10' },
            { label: 'Completed', value: displayData.completed, icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/10' },
            { label: 'Avg Score', value: displayData.average_score + '%', icon: <BarChart2 className="w-5 h-5 text-purple-400" />, bg: 'bg-purple-500/10' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 ${stat.bg} rounded-lg`}>{stat.icon}</div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </div>
              <p className="text-3xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Student Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-medium text-white">Student Progress</h3>
            <span className="text-xs text-slate-500">{displayData.students.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Student Name</th>
                  <th className="px-6 py-3 font-medium">Stages (out of 5)</th>
                  <th className="px-6 py-3 font-medium">Quiz Score</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayData.students.map((student) => {
                  const isComplete = student.completed_at !== null
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{student.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-300 w-4">{student.stages_completed}</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-[80px] overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(student.stages_completed / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.quiz_score !== null ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            student.quiz_score >= 80 ? 'bg-emerald-500/10 text-emerald-300' :
                            student.quiz_score >= 60 ? 'bg-amber-500/10 text-amber-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {student.quiz_score}%
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Completed
                          </span>
                        ) : student.stages_completed > 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Not Started
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-white transition-colors p-1">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
