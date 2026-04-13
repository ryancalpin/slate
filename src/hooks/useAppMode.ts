import { useState, useEffect } from 'react'
import type { AppMode } from '../core/template/types'

export function useAppMode(initial: AppMode = 'build') {
  const [mode, setMode] = useState<AppMode>(initial)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle Build/Live with 'b' key when no input is focused
      if (e.key === 'b' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setMode(m => m === 'build' ? 'live' : 'build')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { mode, setMode }
}
