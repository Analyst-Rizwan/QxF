// Coming Soon placeholder for sandbox, tutor, quiz stages
import { STAGES_INFO } from '@/data/modules'

interface Props {
  stageKey: string
  onContinue: () => void
}

export default function ComingSoonStage({ stageKey, onContinue }: Props) {
  const info = STAGES_INFO.find((s) => s.key === stageKey)

  return (
    <div className="animate-fade-in text-center py-12">
      <div className="text-6xl mb-4">{info?.icon ?? '🔒'}</div>
      <h3 className="text-xl font-bold text-white mb-2">{info?.label} — Coming Soon</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
        This stage is being built. Check back after the pilot session!
      </p>
      <button
        onClick={onContinue}
        className="bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl px-6 py-3 text-sm transition-colors"
      >
        Continue →
      </button>
    </div>
  )
}
