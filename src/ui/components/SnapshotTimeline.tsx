import { useCallback } from 'react'
import clsx from 'clsx'
import type { Snapshot } from '../../core/template/types'

interface SnapshotTimelineProps {
  snapshots: Snapshot[]
  activeSnapshotDate: string | null
  onSelectSnapshot: (date: string | null) => void
}

/**
 * Renders a horizontal list of snapshot dates at the bottom of the canvas.
 * Clicking a date activates read-only snapshot overlay mode.
 * Clicking "Live" returns to the current data.
 */
export function SnapshotTimeline({
  snapshots,
  activeSnapshotDate,
  onSelectSnapshot,
}: SnapshotTimelineProps) {
  const handleLive = useCallback(() => {
    onSelectSnapshot(null)
  }, [onSelectSnapshot])

  const handleDate = useCallback(
    (date: string) => {
      onSelectSnapshot(date)
    },
    [onSelectSnapshot],
  )

  if (snapshots.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface-raised border-t border-gray-700 overflow-x-auto">
      <span className="text-xs text-gray-400 shrink-0 mr-1">Snapshots:</span>

      <button
        type="button"
        onClick={handleLive}
        className={clsx(
          'px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors',
          activeSnapshotDate === null
            ? 'bg-accent-DEFAULT text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        )}
      >
        Live
      </button>

      {snapshots
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((snapshot) => (
          <button
            key={snapshot.date}
            type="button"
            onClick={() => handleDate(snapshot.date)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium shrink-0 transition-colors',
              activeSnapshotDate === snapshot.date
                ? 'bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
            )}
          >
            {snapshot.date}
          </button>
        ))}

      {activeSnapshotDate && (
        <span className="text-xs text-amber-400 shrink-0 ml-2">
          Read-only — viewing {activeSnapshotDate}
        </span>
      )}
    </div>
  )
}
