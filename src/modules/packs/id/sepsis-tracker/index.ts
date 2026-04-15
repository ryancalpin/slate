import type { ModulePlugin } from '../../../../core/plugin/types'
import { SepsisRenderer } from './Renderer'
import { SepsisEditor } from './Editor'
import { SepsisPrintView } from './PrintView'

export const sepsisTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'sepsis-tracker',
    name: 'Sepsis Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'qSOFA score (0-3) and Sepsis-3 criteria tracker. Alerts when qSOFA ≥2.',
    tags: ['infectious-disease', 'sepsis', 'critical-care'],
    pack: 'id',
  },
  schema: {
    config: {},
    data: {
      rrHigh: { type: 'boolean' },
      ams: { type: 'boolean' },
      sbpLow: { type: 'boolean' },
      suspectedInfection: { type: 'boolean' },
      sofaDelta: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer: SepsisRenderer,
  Editor: SepsisEditor,
  PrintView: SepsisPrintView,
}
