/**
 * Python Reference Drawer — Quick syntax reference for students
 */
import { useState } from 'react'
import { X, ChevronRight, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RefItem {
  title: string
  syntax: string
  example: string
  output?: string
}

const REFERENCE_SECTIONS: { category: string; items: RefItem[] }[] = [
  {
    category: 'Basics',
    items: [
      { title: 'Print', syntax: 'print(value)', example: 'print("Hello!")\nprint(3 + 4)', output: 'Hello!\n7' },
      { title: 'Variables', syntax: 'name = value', example: 'name = "Priya"\nage = 15\nprint(name, age)', output: 'Priya 15' },
      { title: 'Input', syntax: 'input(prompt)', example: 'name = input("Name? ")\nprint("Hi", name)', output: 'Name? Priya\nHi Priya' },
      { title: 'Comments', syntax: '# comment', example: '# This is a comment\nx = 5  # inline comment', },
      { title: 'Data Types', syntax: 'int, float, str, bool', example: 'x = 42        # int\ny = 3.14      # float\nz = "hello"   # str\nw = True      # bool', },
    ],
  },
  {
    category: 'Conditions',
    items: [
      { title: 'If / Elif / Else', syntax: 'if condition:\n    code\nelif condition:\n    code\nelse:\n    code', example: 'score = 85\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")', output: 'B' },
      { title: 'Comparisons', syntax: '==  !=  >  <  >=  <=', example: 'print(5 == 5)   # True\nprint(3 > 7)    # False', output: 'True\nFalse' },
      { title: 'Logical', syntax: 'and  or  not', example: 'x = 5\nprint(x > 0 and x < 10)', output: 'True' },
    ],
  },
  {
    category: 'Loops',
    items: [
      { title: 'For Loop', syntax: 'for var in iterable:\n    code', example: 'for i in range(3):\n    print("Step", i+1)', output: 'Step 1\nStep 2\nStep 3' },
      { title: 'While Loop', syntax: 'while condition:\n    code', example: 'count = 0\nwhile count < 3:\n    print(count)\n    count += 1', output: '0\n1\n2' },
      { title: 'Range', syntax: 'range(stop)\nrange(start, stop)\nrange(start, stop, step)', example: 'print(list(range(5)))\nprint(list(range(2, 8, 2)))', output: '[0, 1, 2, 3, 4]\n[2, 4, 6]' },
      { title: 'Break / Continue', syntax: 'break    # exit loop\ncontinue # skip iteration', example: 'for i in range(5):\n    if i == 3:\n        break\n    print(i)', output: '0\n1\n2' },
    ],
  },
  {
    category: 'Functions',
    items: [
      { title: 'Define', syntax: 'def name(params):\n    code\n    return value', example: 'def greet(name):\n    return "Hi " + name\n\nprint(greet("Priya"))', output: 'Hi Priya' },
      { title: 'Default Values', syntax: 'def f(x, y=10):', example: 'def add(a, b=0):\n    return a + b\n\nprint(add(5))\nprint(add(5, 3))', output: '5\n8' },
      { title: 'Multiple Returns', syntax: 'return a, b', example: 'def minmax(lst):\n    return min(lst), max(lst)\n\nlo, hi = minmax([3,1,5])\nprint(lo, hi)', output: '1 5' },
    ],
  },
  {
    category: 'Lists',
    items: [
      { title: 'Create', syntax: 'lst = [1, 2, 3]', example: 'fruits = ["apple", "mango"]\nprint(fruits[0])\nprint(len(fruits))', output: 'apple\n2' },
      { title: 'Add/Remove', syntax: 'lst.append(x)\nlst.remove(x)\nlst.pop()', example: 'nums = [1, 2, 3]\nnums.append(4)\nnums.remove(2)\nprint(nums)', output: '[1, 3, 4]' },
      { title: 'Slicing', syntax: 'lst[start:end]', example: 'x = [10,20,30,40,50]\nprint(x[1:4])\nprint(x[:2])', output: '[20, 30, 40]\n[10, 20]' },
      { title: 'List Comprehension', syntax: '[expr for x in iterable]', example: 'squares = [x**2 for x in range(5)]\nprint(squares)', output: '[0, 1, 4, 9, 16]' },
    ],
  },
  {
    category: 'Strings',
    items: [
      { title: 'Methods', syntax: '.upper() .lower() .strip()\n.split() .replace() .find()', example: 's = "Hello World"\nprint(s.upper())\nprint(s.split())', output: 'HELLO WORLD\n[\'Hello\', \'World\']' },
      { title: 'f-strings', syntax: 'f"text {variable}"', example: 'name = "Priya"\nage = 15\nprint(f"{name} is {age}")', output: 'Priya is 15' },
    ],
  },
]

interface PythonReferenceProps {
  isOpen: boolean
  onClose: () => void
  onInsertCode?: (code: string) => void
}

export default function PythonReference({ isOpen, onClose, onInsertCode }: PythonReferenceProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Basics')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f0f1a] border-l border-slate-700 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold text-white">Python Quick Reference</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {REFERENCE_SECTIONS.map((section) => (
                <div key={section.category}>
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === section.category ? null : section.category)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-sm font-medium text-slate-200 transition-colors"
                  >
                    {section.category}
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedCategory === section.category ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {expandedCategory === section.category && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-2 pt-1 space-y-1">
                          {section.items.map((item) => (
                            <div key={item.title}>
                              <button
                                onClick={() => setExpandedItem(expandedItem === item.title ? null : item.title)}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800/40 text-xs text-slate-300 font-medium transition-colors"
                              >
                                {item.title}
                              </button>

                              <AnimatePresence>
                                {expandedItem === item.title && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden ml-3"
                                  >
                                    <div className="bg-[#1a1a2e] border border-slate-700/50 rounded-xl p-3 mb-2 space-y-2">
                                      {/* Syntax */}
                                      <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Syntax</p>
                                        <pre className="text-xs font-mono text-purple-300 whitespace-pre-wrap">{item.syntax}</pre>
                                      </div>

                                      {/* Example */}
                                      <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Example</p>
                                        <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap bg-[#0f0f1a] rounded-lg p-2">{item.example}</pre>
                                      </div>

                                      {/* Output */}
                                      {item.output && (
                                        <div>
                                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Output</p>
                                          <pre className="text-xs font-mono text-teal-300 whitespace-pre-wrap">{item.output}</pre>
                                        </div>
                                      )}

                                      {/* Insert button */}
                                      {onInsertCode && (
                                        <button
                                          onClick={() => onInsertCode(item.example)}
                                          className="w-full text-xs bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg py-1.5 hover:bg-purple-600/30 transition-colors"
                                        >
                                          Insert into editor
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-slate-800">
              <p className="text-[10px] text-slate-600 text-center">EduAI School · Python 3.x Reference</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
