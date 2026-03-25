// T2 + T6: Module page — stage state machine + progress wiring
import { useParams, useNavigate } from 'react-router-dom'
import SchoolLayout from '@/components/SchoolLayout'
import HookStage from '@/components/stages/HookStage'
import VisualizerStage from '@/components/stages/VisualizerStage'
import SandboxStage from '@/components/stages/SandboxStage'
import QuizStage from '@/components/stages/QuizStage'
import TutorStage from '@/components/stages/TutorStage'
import { MODULES, STAGES_INFO } from '@/data/modules'
import { useProgress } from '@/hooks/useProgress'

export default function ModulePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const module = slug ? MODULES[slug] : null

  const { progress, completeStage } = useProgress(slug ?? '')

  if (!module) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-slate-400">
        Module not found.
      </div>
    )
  }

  const ALL_STAGES = STAGES_INFO
  const currentStageIndex = progress.currentStage
  const currentStageKey = ALL_STAGES[currentStageIndex]?.key ?? 'hook'
  const m = module // narrowed: not null past the guard above

  function handleStageComplete() {
    const nextIndex = currentStageIndex + 1
    completeStage(currentStageKey, nextIndex)

    if (nextIndex >= ALL_STAGES.length) {
      navigate('/complete')
    }
  }

  function renderStage() {
    switch (currentStageKey) {
      case 'hook':
        return <HookStage onComplete={handleStageComplete} />
      case 'visualizer':
        return (
          <VisualizerStage
            codeLines={m.codeLines}
            steps={m.visualizerSteps}
            onComplete={handleStageComplete}
          />
        )
      case 'sandbox':
        return (
          <SandboxStage
            starterCode={m.sandboxConfig.starterCode}
            challenge={m.sandboxConfig.challenge}
            successHint={m.sandboxConfig.successHint}
            onComplete={handleStageComplete}
          />
        )
      case 'tutor':
        return <TutorStage onComplete={handleStageComplete} />
      case 'quiz':
        return (
          <QuizStage
            questions={m.quizQuestions}
            onComplete={handleStageComplete}
          />
        )
      default:
        return null
    }
  }

  return (
    <SchoolLayout
      currentStageIndex={currentStageIndex}
      totalStages={ALL_STAGES.length}
      moduleTitle={m.title}
    >
      {renderStage()}
    </SchoolLayout>
  )
}
