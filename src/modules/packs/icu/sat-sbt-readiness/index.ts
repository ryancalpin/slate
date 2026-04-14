import type { ModulePlugin } from '../../../../core/plugin/types'
import { SatSbtRenderer } from './Renderer'
import { SatSbtEditor } from './Editor'
import { SatSbtPrintView } from './PrintView'

export const satSbtReadinessPlugin: ModulePlugin = {
  meta: {
    id: 'sat-sbt-readiness',
    name: 'SAT / SBT Readiness',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'SAT and SBT safety screening checklists per the ABC protocol with PASS/FAIL auto-assessment.',
    tags: ['icu', 'critical-care', 'ventilator', 'weaning', 'sat', 'sbt'],
    pack: 'icu',
  },
  schema: {
    config: { type: 'object', properties: {} },
    data: {
      type: 'object',
      properties: {
        satScreen: { type: 'object' },
        sbtScreen: { type: 'object' },
        lastSatDate: { type: 'string' },
        lastSbtDate: { type: 'string' },
        lastSbtPassed: { type: 'boolean' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer: SatSbtRenderer,
  Editor: SatSbtEditor,
  PrintView: SatSbtPrintView,
}
