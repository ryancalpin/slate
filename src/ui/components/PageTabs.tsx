import { useCallback } from 'react'
import clsx from 'clsx'
import type { TemplatePage } from '../../core/template/types'

interface PageTabsProps {
  pages: TemplatePage[]
  activePageId: string
  onSelect: (pageId: string) => void
  onAdd: () => void
  onDelete: (pageId: string) => void
  canEdit: boolean
}

/**
 * Tab row shown below the main TabBar when a template has multiple pages.
 * Displays each page name as a tab with an active indicator.
 * In Build Mode (canEdit=true), shows × delete buttons and a + add button.
 */
export function PageTabs({
  pages,
  activePageId,
  onSelect,
  onAdd,
  onDelete,
  canEdit,
}: PageTabsProps) {
  const handleDelete = useCallback(
    (e: React.MouseEvent, pageId: string) => {
      e.stopPropagation()
      if (pages.length <= 1) return // Cannot delete last page
      onDelete(pageId)
    },
    [pages.length, onDelete],
  )

  return (
    <div className="flex items-center gap-0 border-b border-gray-700 bg-[rgb(var(--color-surface))] px-2 overflow-x-auto">
      {pages.map((page) => {
        const isActive = page.id === activePageId
        return (
          <div
            key={page.id}
            className={clsx(
              'flex items-center gap-1 px-3 py-2 text-sm cursor-pointer border-b-2 transition-colors shrink-0',
              isActive
                ? 'border-accent text-white font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500',
            )}
            onClick={() => onSelect(page.id)}
            role="tab"
            aria-selected={isActive}
          >
            <span>{page.name}</span>
            {canEdit && pages.length > 1 && (
              <button
                type="button"
                onClick={(e) => handleDelete(e, page.id)}
                aria-label={`Delete page ${page.name}`}
                className="ml-0.5 w-4 h-4 rounded flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        )
      })}

      {canEdit && (
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add page"
          className="ml-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors shrink-0"
        >
          + Page
        </button>
      )}
    </div>
  )
}
