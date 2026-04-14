import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

// DKA Tracker has no user-configurable options — thresholds are fixed per guideline.
export function DKATrackerEditor(_props: Props) {
  return (
    <div className="p-3 text-sm text-gray-500 dark:text-gray-400 italic">
      No configuration options. Anion gap and DKA closure thresholds are fixed per Kitabchi 2009 guidelines.
    </div>
  )
}

export default DKATrackerEditor
