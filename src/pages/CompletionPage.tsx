import { useNavigate } from 'react-router-dom'
import { clearEnrollment } from '@/hooks/useProgress'

export default function CompletionPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-sm">
        {/* Trophy */}
        <div className="text-7xl mb-6 animate-bounce">🏆</div>

        <h1 className="text-3xl font-bold text-white mb-3">You did it!</h1>
        <p className="text-slate-400 text-base leading-relaxed mb-2">
          You just completed <span className="text-amber-400 font-semibold">Module 1: What is a Program?</span>
        </p>
        <p className="text-slate-500 text-sm mb-8">
          You learned how a computer follows instructions, saw variables in action, and watched code run step-by-step. That's real programming!
        </p>

        {/* What they covered */}
        <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-2xl p-5 mb-8 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">What you covered</p>
          <ul className="space-y-2.5">
            {[
              { icon: '💡', text: 'Programs are instructions a computer follows' },
              { icon: '📦', text: 'Variables store information in named boxes' },
              { icon: '🔍', text: 'Code runs one line at a time, top to bottom' },
              { icon: '🖨️', text: 'print() shows output on the screen' },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-500 text-sm mb-6">More modules are coming soon. Check back with your teacher!</p>

        <button
          onClick={() => {
            clearEnrollment()
            navigate('/')
          }}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors underline underline-offset-2"
        >
          Start over with a different code
        </button>
      </div>
    </div>
  )
}
