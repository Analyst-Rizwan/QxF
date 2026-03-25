import { useEffect, useState } from 'react'
import { Download, Users, CheckCircle, Activity, ChevronRight, Loader2 } from 'lucide-react'

// Use VITE_API_URL or fallback to localhost:8000 for local backend testing
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface StudentProgress {
  id: string
  name: string
  stages_completed: number
  quiz_score: number | null
  completed_at: string | null
}

interface DashboardData {
  batch_code: string
  enrolled: number
  active: number
  completed: number
  average_score: number
  students: StudentProgress[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE_URL}/school/dashboard`, {
          // If auth was required, we'd include credentials or headers here
        })
        if (!res.ok) throw new Error('Failed to fetch dashboard data')
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        console.error('Fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function handleExportCsv() {
    if (!data) return

    const headers = ['Student ID', 'Name', 'Stages Completed', 'Quiz Score', 'Completion Date']
    const rows = data.students.map(s => [
      s.id,
      s.name,
      s.stages_completed.toString(),
      s.quiz_score !== null ? s.quiz_score.toString() : 'N/A',
      s.completed_at ? new Date(s.completed_at).toLocaleDateString() : 'In Progress'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `eduai_batch_${data.batch_code}_report.csv`)
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

  // Fallback state if backend connection fails during pilot demo (so it doesn't just crash)
  const displayData = data || {
    batch_code: 'PILOT1',
    enrolled: 12,
    active: 8,
    completed: 5,
    average_score: 80,
    students: [
      { id: '1', name: 'Student A', stages_completed: 5, quiz_score: 80, completed_at: new Date().toISOString() },
      { id: '2', name: 'Student B', stages_completed: 3, quiz_score: null, completed_at: null },
      { id: '3', name: 'Student C', stages_completed: 5, quiz_score: 100, completed_at: new Date().toISOString() },
    ]
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">NGO Coordinator Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Batch Code: <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{displayData.batch_code}</span></p>
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
            Warning: Could not connect to live backend API. Showing offline preview data.
          </div>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-5 h-5 text-blue-400" /></div>
              <p className="text-slate-400 text-sm">Enrolled</p>
            </div>
            <p className="text-3xl font-semibold text-white">{displayData.enrolled}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg"><Activity className="w-5 h-5 text-amber-400" /></div>
              <p className="text-slate-400 text-sm">Active</p>
            </div>
            <p className="text-3xl font-semibold text-white">{displayData.active}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>
              <p className="text-slate-400 text-sm">Completed</p>
            </div>
            <p className="text-3xl font-semibold text-white">{displayData.completed}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg"><div className="w-5 h-5 flex items-center justify-center font-bold text-purple-400">%</div></div>
              <p className="text-slate-400 text-sm">Avg Score</p>
            </div>
            <p className="text-3xl font-semibold text-white">{displayData.average_score}%</p>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-medium text-white">Student Progress</h3>
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
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
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            In Progress
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
