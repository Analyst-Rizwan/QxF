/**
 * MonacoEditor — Enhanced Python code editor with EduAI dark theme
 * Features: Ctrl+Enter to run, Python autocomplete, bracket colorization
 */
import Editor, { OnMount } from '@monaco-editor/react'
import { useRef, useEffect } from 'react'

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  onRun?: () => void
  height?: string
  readOnly?: boolean
  filename?: string
  language?: string
}

const LANG_EXTENSION: Record<string, string> = {
  python: 'py', javascript: 'js', typescript: 'ts', cpp: 'cpp', c: 'c',
  java: 'java', go: 'go', rust: 'rs', csharp: 'cs', kotlin: 'kt',
  ruby: 'rb', swift: 'swift', php: 'php', dart: 'dart', scala: 'scala',
  r: 'r', shell: 'sh', sql: 'sql',
}

export default function MonacoEditor({ value, onChange, onRun, height = '220px', readOnly = false, filename, language = 'python' }: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const onRunRef = useRef(onRun)

  useEffect(() => {
    onRunRef.current = onRun
  }, [onRun])

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Define EduAI dark theme
    monaco.editor.defineTheme('eduai-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C792EA', fontStyle: 'bold' },
        { token: 'string', foreground: 'C3E88D' },
        { token: 'number', foreground: 'F78C6C' },
        { token: 'type', foreground: 'FFCB6B' },
        { token: 'function', foreground: '82AAFF' },
        { token: 'variable', foreground: 'EEFFFF' },
        { token: 'operator', foreground: '89DDFF' },
        { token: 'delimiter', foreground: '89DDFF' },
      ],
      colors: {
        'editor.background': '#0f0f1a',
        'editor.foreground': '#E0E0E0',
        'editor.lineHighlightBackground': '#1a1a2e',
        'editor.selectionBackground': '#3d3d5c55',
        'editorCursor.foreground': '#f59e0b',
        'editorLineNumber.foreground': '#3d3d5c',
        'editorLineNumber.activeForeground': '#f59e0b',
        'editor.selectionHighlightBackground': '#3d3d5c33',
        'editorWidget.background': '#1a1a2e',
        'editorWidget.border': '#334155',
        'editorSuggestWidget.background': '#1a1a2e',
        'editorSuggestWidget.selectedBackground': '#2d2d44',
        'editorSuggestWidget.highlightForeground': '#f59e0b',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#334155',
        'scrollbarSlider.hoverBackground': '#475569',
        'scrollbarSlider.activeBackground': '#64748b',
        'minimap.background': '#0f0f1a',
      },
    })

    monaco.editor.setTheme('eduai-dark')

    // Register Ctrl+Enter / Cmd+Enter to run
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      run: () => {
        onRunRef.current?.()
      },
    })

    // Register Python snippets
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        return {
          suggestions: [
            {
              label: 'print',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'print(${1})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Print output to the screen',
              range,
            },
            {
              label: 'input',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'input("${1:Enter value: }")',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Get input from the user',
              range,
            },
            {
              label: 'if-else',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'if ${1:condition}:\n    ${2:pass}\nelse:\n    ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'If-else statement',
              range,
            },
            {
              label: 'for-range',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for ${1:i} in range(${2:10}):\n    ${3:print(i)}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop with range',
              range,
            },
            {
              label: 'for-list',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'for ${1:item} in ${2:my_list}:\n    ${3:print(item)}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'For loop over a list',
              range,
            },
            {
              label: 'while',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'while ${1:condition}:\n    ${2:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'While loop',
              range,
            },
            {
              label: 'def',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'def ${1:function_name}(${2:params}):\n    ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Define a function',
              range,
            },
            {
              label: 'class',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Define a class',
              range,
            },
            {
              label: 'try-except',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:print(e)}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Try-except error handling',
              range,
            },
            {
              label: 'list-comp',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '[${1:x} for ${2:x} in ${3:range(10)}]',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'List comprehension',
              range,
            },
          ],
        }
      },
    })

    editor.focus()
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-[#0f0f1a]">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="text-xs text-slate-500 font-mono">{filename ?? `program.${LANG_EXTENSION[language] ?? 'py'}`}</span>
        </div>
        <div className="flex items-center gap-2">
          {onRun && (
            <span className="text-[10px] text-slate-600 hidden sm:inline">Ctrl+Enter to run</span>
          )}
          <span className="text-[10px] text-slate-600">Monaco</span>
        </div>
      </div>

      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        theme="eduai-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'gutter',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          readOnly,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showFunctions: true,
            showVariables: true,
          },
          quickSuggestions: {
            other: true,
            strings: false,
            comments: false,
          },
        }}
        loading={
          <div className="h-full bg-[#0f0f1a] flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-sm text-slate-400">Loading editor...</span>
            </div>
          </div>
        }
      />
    </div>
  )
}
