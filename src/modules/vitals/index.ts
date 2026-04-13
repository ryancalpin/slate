import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const vitalsPlugin: ModulePlugin = {
  meta: {
    id: 'vitals',
    name: 'Vitals',
    version: '1.0.0',
    author: 'core',
    description: 'Vital signs grid with configurable normal ranges and trend indicators.',
    tags: ['vitals', 'nursing', 'critical-care'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showHr: true,
    showBp: true,
    showRr: true,
    showTemp: true,
    showSpo2: true,
    showWeight: true,
    showTrends: true,
    tempUnit: 'F',
    weightUnit: 'kg',
    normalRanges: {
      hr: { min: 60, max: 100 },
      sbp: { min: 90, max: 140 },
      dbp: { min: 60, max: 90 },
      rr: { min: 12, max: 20 },
      temp: { min: 97, max: 99 },
      spo2: { min: 95 },
    },
  },
  minSize: { w: 4, h: 3 },
  Renderer,
  Editor,
  PrintView,
}
