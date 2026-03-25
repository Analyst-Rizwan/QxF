import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { streamMessageFromSchoolAI } from '@/lib/ai'
import { Send, Bot, User, ArrowRight, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'tutor' | 'student'
  content: string
}

interface TutorStageProps {
  onComplete: () => void
}

const PRESET_QUESTIONS = [
  "Why do we need variables?",
  "What happens if I type print without quotes?",
  "Can Python do math?",
]

export default function TutorStage({ onComplete }: TutorStageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'tutor',
      content: "Great job in the sandbox! I'm your AI Tutor. Do you have any questions about what a program is, or how variables work? You can ask me anything, or try one of these questions below.",
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Keep track of conv id for persistence during this stage
  const conversationIdRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  async function handleSend(text: string) {
    if (!text.trim() || isTyping) return

    setInputValue('')
    setHasInteracted(true)
    
    const userMsgId = Date.now().toString()
    setMessages(prev => [...prev, { id: userMsgId, role: 'student', content: text }])
    
    setIsTyping(true)

    const tutorMsgId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, { id: tutorMsgId, role: 'tutor', content: '' }])

    await streamMessageFromSchoolAI(
      text,
      (chunk) => {
        setMessages(prev => {
          const newMsgs = [...prev]
          const lastIndex = newMsgs.length - 1
          if (newMsgs[lastIndex].role === 'tutor') {
            newMsgs[lastIndex].content += chunk
          }
          return newMsgs
        })
      },
      (fullText, convId) => {
        setIsTyping(false)
        if (convId) conversationIdRef.current = convId
      },
      { conversation_id: conversationIdRef.current }
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#0f0f1a] rounded-xl border border-slate-800/50 overflow-hidden relative shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-200">AI Tutor</h2>
            <p className="text-xs text-slate-400">Ask unlimited questions</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'student' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'tutor' 
                  ? 'bg-purple-500/20 border border-purple-500/30' 
                  : 'bg-emerald-500/20 border border-emerald-500/30'
              }`}>
                {msg.role === 'tutor' 
                  ? <Bot className="w-4 h-4 text-purple-400" /> 
                  : <User className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'tutor'
                  ? 'bg-slate-800/60 text-slate-300 rounded-tl-sm'
                  : 'bg-emerald-600/20 text-emerald-100 rounded-tr-sm border border-emerald-500/20'
              }`}>
                {msg.content}
                {isTyping && msg.role === 'tutor' && msg.content === '' && (
                  <span className="inline-flex gap-1 ml-1 items-center h-4">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Preset Questions - Only show if student hasn't interacted yet */}
        {!hasInteracted && !isTyping && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2 pl-11 pt-2 w-full max-w-[85%]"
          >
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-left px-4 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 hover:border-slate-600 hover:text-white transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex flex-col gap-3 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            placeholder="Ask a question..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50 transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="w-12 h-[46px] flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-colors"
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>

        {/* Continue Button Appears After Interaction */}
        <AnimatePresence>
          {hasInteracted && !isTyping && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex justify-end pt-2 border-t border-slate-800/50"
            >
              <button
                onClick={onComplete}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
              >
                Continue to Quiz
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Optional Skip Button if they don't want to ask anything */}
        {!hasInteracted && !isTyping && (
          <div className="flex justify-end">
            <button
              onClick={onComplete}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Skip AI Tutor &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
