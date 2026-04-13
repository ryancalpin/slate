import { useState } from 'react'
import type { AppMode } from '../core/template/types'

export function useAppMode(initial: AppMode = 'build') {
  const [mode, setMode] = useState<AppMode>(initial)
  // Keyboard shortcut ('b') is registered in App.tsx via useKeyboardShortcuts
  return { mode, setMode }
}
