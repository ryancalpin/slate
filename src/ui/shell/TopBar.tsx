import { Link } from 'react-router-dom'
import { ModeToggle } from '../components/ModeToggle'
import { ThemeToggle } from '../components/ThemeToggle'
import type { AppMode } from '../../core/template/types'

interface Props {
  mode: AppMode
  onModeToggle: () => void
  templateId?: string
}

export function TopBar({ mode, onModeToggle, templateId }: Props) {
  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-gray-800 bg-[rgb(var(--color-surface-raised))] shrink-0">
      <Link to="/" className="text-accent-DEFAULT font-bold text-sm tracking-wide select-none">
        PatientTemplates
      </Link>
      <div className="flex items-center gap-3">
        {templateId && (
          <Link to={`/template/${templateId}/print`} className="text-gray-400 hover:text-gray-200 text-xs px-2 py-1 border border-gray-700 rounded">
            Print
          </Link>
        )}
        <ModeToggle mode={mode} onToggle={onModeToggle} />
        <ThemeToggle />
      </div>
    </header>
  )
}
