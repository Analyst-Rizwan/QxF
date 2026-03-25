import type { QuizQuestion } from '@/components/stages/QuizStage'

export type { QuizQuestion }

export interface VisualizerStep {
  line: number // 0-indexed
  vars: Record<string, string>
  output: string
  explanation: string
}

export interface SandboxConfig {
  starterCode: string
  challenge: string
  successHint: string
}

export interface Module {
  slug: string
  title: string
  gradeBand: string
  stages: string[]
  visualizerSteps: VisualizerStep[]
  codeLines: string[]
  sandboxConfig: SandboxConfig
  quizQuestions: QuizQuestion[]
}

export const MODULES: Record<string, Module> = {
  m1: {
    slug: 'm1',
    title: 'What is a Program?',
    gradeBand: '9–12',
    stages: ['hook', 'visualizer', 'sandbox', 'tutor', 'quiz'],
    codeLines: [
      'name = "Priya"          # step 1',
      'age = 17                # step 2',
      'city = "Coimbatore"     # step 3',
      'message = "Hello " + name  # step 4',
      'print(message)          # step 5',
    ],
    visualizerSteps: [
      {
        line: 0,
        vars: { name: '"Priya"' },
        output: '',
        explanation: 'We store the text "Priya" in a box called name.',
      },
      {
        line: 1,
        vars: { name: '"Priya"', age: '17' },
        output: '',
        explanation: 'We store the number 17 in a box called age.',
      },
      {
        line: 2,
        vars: { name: '"Priya"', age: '17', city: '"Coimbatore"' },
        output: '',
        explanation: 'We store the city name in a box called city.',
      },
      {
        line: 3,
        vars: {
          name: '"Priya"',
          age: '17',
          city: '"Coimbatore"',
          message: '"Hello Priya"',
        },
        output: '',
        explanation: 'We join "Hello " and name together to make a greeting.',
      },
      {
        line: 4,
        vars: {
          name: '"Priya"',
          age: '17',
          city: '"Coimbatore"',
          message: '"Hello Priya"',
        },
        output: 'Hello Priya',
        explanation: 'print() shows the message on the screen. This is the output!',
      },
    ],
    sandboxConfig: {
      starterCode: `name = "Priya"\nage = 17\ncity = "Coimbatore"\nmessage = "Hello " + name\nprint(message)`,
      challenge: 'Change the name, age, or city to yours — then click Run to see your own output!',
      successHint: '🎉 You just ran real Python code! Try changing the name to yours and run it again.',
    },
    quizQuestions: [
      {
        question: 'What is a program?',
        options: [
          'A TV show',
          'A list of instructions a computer follows',
          'A type of computer virus',
          'A calculator app',
        ],
        correctIndex: 1,
        explanation: 'A program is a sequence of instructions that tells a computer what to do, step by step.',
      },
      {
        question: 'In Python, what does a variable do?',
        options: [
          'It deletes data',
          'It runs the program faster',
          'It stores a piece of information with a name',
          'It prints text on screen',
        ],
        correctIndex: 2,
        explanation: 'A variable is like a labelled box. You give it a name and store data in it — like name = "Priya".',
      },
      {
        question: 'What does print(message) do?',
        options: [
          'Saves the file to disk',
          'Creates a new variable called message',
          'Deletes the variable',
          'Shows the value of message on the screen',
        ],
        correctIndex: 3,
        explanation: 'print() is a built-in Python function that displays whatever you pass to it as output.',
      },
      {
        question: 'In the program we studied, what is the value of message?',
        options: [
          '"Hello Coimbatore"',
          '"Hello Priya"',
          '"Hello 17"',
          'Priya',
        ],
        correctIndex: 1,
        explanation: 'message = "Hello " + name — and name is "Priya", so message becomes "Hello Priya".',
      },
      {
        question: 'Which line runs LAST in our 5-line program?',
        options: [
          'name = "Priya"',
          'age = 17',
          'message = "Hello " + name',
          'print(message)',
        ],
        correctIndex: 3,
        explanation: 'Python runs code top to bottom, one line at a time. print(message) is line 5 — the last to run.',
      },
    ],
  },
}

export const VALID_BATCH_CODES: Record<string, string> = {
  PILOT1: 'EduAI NGO Pilot — Batch 1',
  PILOT2: 'EduAI NGO Pilot — Batch 2',
  DEMO01: 'EduAI Demo Batch',
}

export const STAGES_INFO = [
  { key: 'hook', label: 'Concept', icon: '💡' },
  { key: 'visualizer', label: 'Visualizer', icon: '🔍' },
  { key: 'sandbox', label: 'Try it', icon: '⌨️' },
  { key: 'tutor', label: 'AI Tutor', icon: '🤖' },
  { key: 'quiz', label: 'Quiz', icon: '✅' },
]
