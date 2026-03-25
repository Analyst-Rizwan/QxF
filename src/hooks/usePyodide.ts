// Pyodide hook — loads Python WASM runtime once, caches it, exposes runPython()
import { useState, useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInstance>
  }
}

interface PyodideInstance {
  runPython: (code: string) => unknown
  runPythonAsync: (code: string) => Promise<unknown>
  setStdout: (opts: { batched: (s: string) => void }) => void
  setStderr: (opts: { batched: (s: string) => void }) => void
}

interface RunResult {
  output: string
  error: string | null
}

// Global singleton — only load once across the app lifetime
let pyodideInstance: PyodideInstance | null = null
let pyodideLoading: Promise<PyodideInstance> | null = null

async function getPyodide(): Promise<PyodideInstance> {
  if (pyodideInstance) return pyodideInstance
  if (pyodideLoading) return pyodideLoading

  pyodideLoading = window.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
  }).then((py) => {
    pyodideInstance = py
    return py
  })

  return pyodideLoading
}

export function usePyodide() {
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(!!pyodideInstance)
  const [loadError, setLoadError] = useState<string | null>(null)
  const pyRef = useRef<PyodideInstance | null>(pyodideInstance)

  useEffect(() => {
    if (pyRef.current) return
    setIsLoading(true)
    getPyodide()
      .then((py) => {
        pyRef.current = py
        setIsReady(true)
        setIsLoading(false)
      })
      .catch((err) => {
        setLoadError(String(err))
        setIsLoading(false)
      })
  }, [])

  const runPython = useCallback(async (code: string): Promise<RunResult> => {
    const py = pyRef.current
    if (!py) return { output: '', error: 'Pyodide not loaded yet' }

    const outputLines: string[] = []
    const errorLines: string[] = []

    py.setStdout({ batched: (s) => outputLines.push(s) })
    py.setStderr({ batched: (s) => errorLines.push(s) })

    try {
      await py.runPythonAsync(code)
      return {
        output: outputLines.join('\n'),
        error: errorLines.length > 0 ? errorLines.join('\n') : null,
      }
    } catch (err: unknown) {
      // Extract just the last line of the Python traceback for students
      const msg = String(err)
      const lines = msg.split('\n').filter(Boolean)
      const friendly = lines[lines.length - 1] ?? msg
      return { output: outputLines.join('\n'), error: friendly }
    }
  }, [])

  return { isLoading, isReady, loadError, runPython }
}
