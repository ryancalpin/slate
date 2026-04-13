import type { AppMode } from '../../core/template/types'

interface Props {
  mode: AppMode
  onToggle: () => void
}

export function ModeToggle({ mode, onToggle }: Props) {
  const isBuild = mode === 'build'
  return (
    <button
      onClick={onToggle}
      title="Toggle Build/Live mode (B)"
      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
        isBuild
          ? 'bg-violet-800 text-violet-200 hover:bg-violet-700'
          : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'
      }`}
    >
      {isBuild ? '🔧 Build' : '🟢 Live'}
    </button>
  )
}
