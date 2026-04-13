import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const PANELS = {
  bmp: { label: 'BMP', configKey: 'showBmp', labs: [
    { key: 'na', label: 'Na', unit: 'mEq/L' }, { key: 'k', label: 'K', unit: 'mEq/L' },
    { key: 'cl', label: 'Cl', unit: 'mEq/L' }, { key: 'co2', label: 'CO2', unit: 'mEq/L' },
    { key: 'bun', label: 'BUN', unit: 'mg/dL' }, { key: 'cr', label: 'Cr', unit: 'mg/dL' },
    { key: 'glucose', label: 'Glucose', unit: 'mg/dL' },
  ]},
  cbc: { label: 'CBC', configKey: 'showCbc', labs: [
    { key: 'wbc', label: 'WBC', unit: 'K/µL' }, { key: 'hgb', label: 'Hgb', unit: 'g/dL' },
    { key: 'hct', label: 'Hct', unit: '%' }, { key: 'plt', label: 'Plt', unit: 'K/µL' },
  ]},
  lfts: { label: 'LFTs', configKey: 'showLfts', labs: [
    { key: 'alt', label: 'ALT', unit: 'U/L' }, { key: 'ast', label: 'AST', unit: 'U/L' },
    { key: 'alp', label: 'ALP', unit: 'U/L' }, { key: 'tbili', label: 'TBili', unit: 'mg/dL' },
    { key: 'alb', label: 'Alb', unit: 'g/dL' },
  ]},
  coags: { label: 'Coags', configKey: 'showCoags', labs: [
    { key: 'pt', label: 'PT', unit: 'sec' }, { key: 'inr', label: 'INR', unit: '' },
    { key: 'ptt', label: 'PTT', unit: 'sec' },
  ]},
}

export const PrintView: FC<Props> = ({ config, data }) => (
  <div className="p-2 flex flex-wrap gap-6 text-sm">
    {Object.values(PANELS).map(panel =>
      config[panel.configKey] !== false ? (
        <div key={panel.label}>
          <h4 className="font-semibold border-b border-gray-300 mb-1">{panel.label}</h4>
          {panel.labs.map(lab => (
            <div key={lab.key} className="flex justify-between gap-4">
              <span>{lab.label}</span>
              <span>{data[lab.key] !== undefined ? `${data[lab.key]} ${lab.unit}` : '—'}</span>
            </div>
          ))}
        </div>
      ) : null
    )}
  </div>
)
