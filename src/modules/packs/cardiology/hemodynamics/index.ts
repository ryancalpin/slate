import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export type HemoParam = {
  key: string
  label: string
  unit: string
  low: number
  high: number
  rangeDisplay?: string
}

export const HEMO_PARAMS: HemoParam[] = [
  { key: 'ci',     label: 'Cardiac Index',  unit: 'L/min/m²',         low: 2.2, high: 4.0, rangeDisplay: '2.2–4.0' },
  { key: 'pcwp',   label: 'PCWP',           unit: 'mmHg',              low: 0,   high: 12   },
  { key: 'svr',    label: 'SVR',            unit: 'dynes·s/cm⁵',      low: 800, high: 1200 },
  { key: 'map',    label: 'MAP',            unit: 'mmHg',              low: 70,  high: 100  },
  { key: 'cvp',    label: 'CVP',            unit: 'mmHg',              low: 2,   high: 8    },
  { key: 'paSys',  label: 'PA Systolic',    unit: 'mmHg',              low: 15,  high: 25   },
  { key: 'paDias', label: 'PA Diastolic',   unit: 'mmHg',              low: 8,   high: 15   },
  { key: 'paMean', label: 'PA Mean',        unit: 'mmHg',              low: 10,  high: 20   },
]

const HemodynamicsPlugin: ModulePlugin = {
  meta: {
    id: 'hemodynamics',
    name: 'Hemodynamics',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Hemodynamic parameters with values and normal ranges side by side. Out-of-range highlighting.',
    tags: ['cardiology', 'hemodynamics', 'critical-care', 'icu'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        ci: { type: 'number' }, pcwp: { type: 'number' }, svr: { type: 'number' },
        map: { type: 'number' }, cvp: { type: 'number' }, paSys: { type: 'number' },
        paDias: { type: 'number' }, paMean: { type: 'number' },
      },
    },
  },
  defaultConfig: { title: 'Hemodynamics' },
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default HemodynamicsPlugin
