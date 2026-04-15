import type { FC } from 'react'

type Modality = 'HD' | 'CRRT' | 'PD'

interface HDData {
  access: string
  bfr: number
  dfr: number
  ufGoal: number
  duration: number
  anticoag: string
}

interface CRRTData {
  mode: string
  effluentRate: number
  replacementRate: number
  anticoag: string
  filterAge: number
}

interface PDData {
  dwellVol: number
  dwellTime: number
  cyclesPerDay: number
  glucoseConc: string
  dailyUF: number
}

interface DialysisData {
  modality: Modality
  hd: HDData
  crrt: CRRTData
  pd: PDData
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const HD_ACCESS_OPTIONS = ['AV fistula', 'AV graft', 'Tunneled catheter', 'Temporary catheter']
const ANTICOAG_HD = ['Heparin', 'Citrate', 'None']
const ANTICOAG_CRRT = ['Citrate', 'Heparin', 'None']
const CRRT_MODES = ['CVVH', 'CVVHD', 'CVVHDF']
const GLUCOSE_CONC = ['1.5%', '2.5%', '4.25%']

function label(text: string, htmlFor: string) {
  return <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">{text}</label>
}

function numInput(id: string, value: number, unit: string, onChange: (v: number) => void, disabled: boolean) {
  return (
    <div>
      {label(`${id.replace(/-/g, ' ')} (${unit})`, id)}
      <input
        id={id}
        type="number"
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
      />
    </div>
  )
}

function selectInput(id: string, value: string, options: string[], onChange: (v: string) => void, disabled: boolean) {
  return (
    <div>
      {label(id.replace(/-/g, ' '), id)}
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as DialysisData
  const disabled = mode === 'build'

  function update(patch: Partial<DialysisData>) {
    onDataChange({ ...d, ...patch } as unknown as Record<string, unknown>)
  }

  function updateHD(patch: Partial<HDData>) {
    update({ hd: { ...d.hd, ...patch } })
  }

  function updateCRRT(patch: Partial<CRRTData>) {
    update({ crrt: { ...d.crrt, ...patch } })
  }

  function updatePD(patch: Partial<PDData>) {
    update({ pd: { ...d.pd, ...patch } })
  }

  return (
    <div className="p-3 space-y-3">
      {/* Modality selector */}
      <div className="flex gap-2">
        {(['HD', 'CRRT', 'PD'] as Modality[]).map(m => (
          <button
            key={m}
            onClick={() => !disabled && update({ modality: m })}
            className={`px-3 py-1 rounded text-sm font-semibold border transition-colors ${
              d.modality === m
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* HD fields */}
      {d.modality === 'HD' && (
        <div className="grid grid-cols-2 gap-2">
          {selectInput('access type', d.hd.access, HD_ACCESS_OPTIONS, v => updateHD({ access: v }), disabled)}
          {numInput('blood flow rate', d.hd.bfr, 'mL/min', v => updateHD({ bfr: v }), disabled)}
          {numInput('dialysate flow rate', d.hd.dfr, 'mL/min', v => updateHD({ dfr: v }), disabled)}
          {numInput('UF goal', d.hd.ufGoal, 'L', v => updateHD({ ufGoal: v }), disabled)}
          {numInput('session duration', d.hd.duration, 'hr', v => updateHD({ duration: v }), disabled)}
          {selectInput('anticoagulation', d.hd.anticoag, ANTICOAG_HD, v => updateHD({ anticoag: v }), disabled)}
        </div>
      )}

      {/* CRRT fields */}
      {d.modality === 'CRRT' && (
        <div className="grid grid-cols-2 gap-2">
          {selectInput('CRRT mode', d.crrt.mode, CRRT_MODES, v => updateCRRT({ mode: v }), disabled)}
          {numInput('effluent rate', d.crrt.effluentRate, 'mL/kg/hr', v => updateCRRT({ effluentRate: v }), disabled)}
          {numInput('replacement fluid rate', d.crrt.replacementRate, 'mL/hr', v => updateCRRT({ replacementRate: v }), disabled)}
          {selectInput('anticoagulation', d.crrt.anticoag, ANTICOAG_CRRT, v => updateCRRT({ anticoag: v }), disabled)}
          {numInput('filter age', d.crrt.filterAge, 'hr', v => updateCRRT({ filterAge: v }), disabled)}
        </div>
      )}

      {/* PD fields */}
      {d.modality === 'PD' && (
        <div className="grid grid-cols-2 gap-2">
          {numInput('dwell volume', d.pd.dwellVol, 'mL', v => updatePD({ dwellVol: v }), disabled)}
          {numInput('dwell time', d.pd.dwellTime, 'hr', v => updatePD({ dwellTime: v }), disabled)}
          {numInput('cycles per day', d.pd.cyclesPerDay, '', v => updatePD({ cyclesPerDay: v }), disabled)}
          {selectInput('glucose concentration', d.pd.glucoseConc, GLUCOSE_CONC, v => updatePD({ glucoseConc: v }), disabled)}
          {numInput('daily UF achieved', d.pd.dailyUF, 'mL', v => updatePD({ dailyUF: v }), disabled)}
        </div>
      )}
    </div>
  )
}
