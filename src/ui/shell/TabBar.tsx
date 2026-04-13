import { useNavigate, useLocation } from 'react-router-dom'

interface Tab {
  id: string
  name: string
}

interface Props {
  tabs: Tab[]
  onClose: (id: string) => void
}

export function TabBar({ tabs, onClose }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  if (tabs.length === 0) return null

  return (
    <div className="flex items-end gap-0.5 px-4 bg-[rgb(var(--color-surface))] overflow-x-auto shrink-0">
      {tabs.map(tab => {
        const isActive = location.pathname === `/template/${tab.id}`
        return (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-t cursor-pointer border-t border-l border-r select-none max-w-[160px] ${
              isActive
                ? 'bg-[rgb(var(--color-surface-raised))] border-gray-700 text-gray-100'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
            onClick={() => navigate(`/template/${tab.id}`)}
          >
            <span className="truncate">{tab.name}</span>
            <button
              onClick={e => { e.stopPropagation(); onClose(tab.id) }}
              className="shrink-0 text-gray-500 hover:text-gray-300"
            >
              ×
            </button>
          </div>
        )
      })}
    </div>
  )
}
