import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const Editor: FC<Props> = ({ config, onConfigChange }) => {
  return (
    <div className="p-3 flex flex-col gap-3 text-sm">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Module Title</label>
        <input
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
          value={(config.title as string) ?? 'GDMT Tracker'}
          onChange={e => onConfigChange({ ...config, title: e.target.value })}
        />
      </div>
    </div>
  )
}

export default Editor
