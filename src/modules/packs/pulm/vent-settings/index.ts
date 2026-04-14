import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const CITATION = 'ARDSNet: Ventilation with lower tidal volumes. NEJM. 2000;342(18):1301-1308'

export function calcDrivingPressure(pPlat: number, peep: number): number {
  return pPlat - peep
}

export function calcPFRatio(pao2: number, fio2Fraction: number): number {
  return pao2 / fio2Fraction
}

export function calcTVperIBW(tvMl: number, ibwKg: number): number {
  return tvMl / ibwKg
}

export { CITATION }

const ventSettingsPlugin: ModulePlugin = {
  meta: {
    id: 'vent-settings',
    name: 'Ventilator Settings',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Ventilator settings entry with ARDSnet calculations and auto-derived P/F ratio and driving pressure.',
    tags: ['critical-care', 'pulmonology', 'ventilator', 'ards'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      mode: { type: 'string' },
      fio2: { type: 'number' },
      peep: { type: 'number' },
      tv: { type: 'number' },
      rr: { type: 'number' },
      ie: { type: 'string' },
      pPlat: { type: 'number' },
      pao2: { type: 'number' },
      ibwKg: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default ventSettingsPlugin
