import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as { showGlucose?: boolean; showMgPhos?: boolean }
  const v = (f: string) => (data[f] !== undefined ? String(data[f]) : '—')

  return (
    <div className="p-2 font-mono text-sm">
      <div className="inline-grid border border-gray-800" style={{ gridTemplateColumns: '60px 60px 60px 60px' }}>
        <div className="border-b border-r border-gray-800 text-center p-1">{v('na')}</div>
        <div className="border-b border-r border-gray-800 text-center p-1">{v('cl')}</div>
        <div className="border-b border-r border-gray-800 text-center p-1">{v('bun')}</div>
        <div className="border-b border-gray-800 text-center p-1">{cfg.showGlucose !== false ? v('glucose') : ''}</div>
        <div className="border-r border-gray-800 text-center p-1">{v('k')}</div>
        <div className="border-r border-gray-800 text-center p-1">{v('co2')}</div>
        <div className="border-r border-gray-800 text-center p-1">{v('cr')}</div>
        <div className="text-center p-1" />
      </div>
      {cfg.showMgPhos && (
        <div className="flex gap-4 mt-2 text-xs">
          <span>Mg: {v('mg')}</span>
          <span>Phos: {v('phos')}</span>
        </div>
      )}
    </div>
  )
}
