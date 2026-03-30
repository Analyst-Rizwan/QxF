// T2 + T6: Module page — stage state machine + progress wiring + XP
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
  const m = module

  function handleStageComplete(extras?: { quizScore?: number; challengesCompleted?: number }) {
    const nextIndex = currentStageIndex + 1
    completeStage(currentStageKey, nextIndex, extras)

    if (nextIndex >= ALL_STAGES.length) {
      navigate(`/complete/${slug}`)
    }
  }

  function renderStage() {
    switch (currentStageKey) {
      case 'hook':
        return (
          <HookStage
            hookConfig={m.hookConfig}
            moduleTitle={m.title}
            onComplete={() => handleStageComplete()}
          />
        )
      case 'visualizer':
        return (
          <VisualizerStage
            codeLines={m.codeLines}
            steps={m.visualizerSteps}
            onComplete={() => handleStageComplete()}
          />
        )
      case 'sandbox':
        return (
          <SandboxStage
            starterCode={m.sandboxConfig.starterCode}
            challenge={m.sandboxConfig.challenge}
            successHint={m.sandboxConfig.successHint}
            challenges={m.sandboxConfig.challenges}
            onComplete={(challengesCompleted) => handleStageComplete({ challengesCompleted })}
          />
        )
      case 'tutor':
        return (
          <TutorStage
            moduleTitle={m.title}
            presetQuestions={m.tutorPresetQuestions}
            onComplete={() => handleStageComplete()}
          />
        )
      case 'quiz':
        return (
          <QuizStage
            questions={m.quizQuestions}
            onComplete={(score) => handleStageComplete({ quizScore: score })}
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
      moduleSlug={slug ?? ''}
    >
      {renderStage()}
    </SchoolLayout>
  )
}
