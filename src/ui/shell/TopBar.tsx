import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ModeToggle } from '../components/ModeToggle'
import { ThemeToggle } from '../components/ThemeToggle'
import { CommandPalette } from '../components/CommandPalette'
import { exportPixelPerfectPdf, downloadBlob } from '../../core/export/pdfPixel'
import type { AppMode } from '../../core/template/types'

interface Props {
  mode: AppMode
  onModeToggle: () => void
  templateId?: string
  onAddModule?: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
}

export function TopBar({ mode, onModeToggle, templateId, onAddModule }: Props) {
  const navigate = useNavigate()
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  const handlePixelPerfectExport = useCallback(async () => {
    const canvasEl = document.getElementById('canvas-root')
    if (!canvasEl) return
    const blob = await exportPixelPerfectPdf(canvasEl as HTMLElement)
    downloadBlob(blob, `template-${Date.now()}.pdf`)
  }, [])

  const handleCensus = useCallback(() => navigate('/census'), [navigate])

  // Cmd+K / Ctrl+K to open command palette (only in build mode with a template open)
  useEffect(() => {
    if (!onAddModule || !templateId) return
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (mode === 'build') {
          setShowCommandPalette(v => !v)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mode, onAddModule, templateId])

  return (
    <>
      <header className="flex items-center justify-between px-4 h-12 border-b border-gray-800 bg-[rgb(var(--color-surface-raised))] shrink-0">
        <Link to="/" className="text-accent font-bold text-sm tracking-wide select-none">
          Slate
        </Link>
        <div className="flex items-center gap-3">
          {templateId && (
            <>
              <Link to={`/template/${templateId}/print`} className="text-gray-400 hover:text-gray-200 text-xs px-2 py-1 border border-gray-700 rounded">
                Print
              </Link>
              <button
                type="button"
                onClick={handlePixelPerfectExport}
                className="px-3 py-1.5 text-sm rounded bg-accent text-white hover:opacity-90 transition-opacity"
                title="Export PDF — exact screen replica"
              >
                Export PDF (Pixel Perfect)
              </button>
            </>
          )}
          {/* Census view button */}
          <button
            type="button"
            onClick={handleCensus}
            title="Census view"
            className="p-3 md:p-2 rounded hover:bg-gray-700 transition-colors"
            aria-label="Open census"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          {/* Plugin Manager button */}
          <button
            type="button"
            onClick={() => navigate('/plugins')}
            title="Plugin Manager"
            className="p-3 md:p-2 rounded hover:bg-gray-700 transition-colors"
            aria-label="Open plugin manager"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          <ModeToggle mode={mode} onToggle={onModeToggle} />
          <ThemeToggle />
        </div>
      </header>

      {showCommandPalette && onAddModule && (
        <CommandPalette
          onAddModule={(moduleId, version, defaultConfig) => {
            onAddModule(moduleId, version, defaultConfig)
            setShowCommandPalette(false)
          }}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
    </>
  )
}
