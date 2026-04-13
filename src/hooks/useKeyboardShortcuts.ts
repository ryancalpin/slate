import { useEffect } from 'react'

type ShortcutMap = Record<string, (e: KeyboardEvent) => void>

function isInputFocused() {
  const el = document.activeElement
  return el instanceof HTMLInputElement
    || el instanceof HTMLTextAreaElement
    || (el instanceof HTMLElement && el.isContentEditable)
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.metaKey || e.ctrlKey ? 'cmd' : '',
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase(),
      ].filter(Boolean).join('+')

      const action = shortcuts[key]
      if (!action) return

      // Allow cmd+shortcuts even in inputs; block bare keys when typing
      const isCmdShortcut = e.metaKey || e.ctrlKey
      if (!isCmdShortcut && isInputFocused()) return

      action(e)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}
