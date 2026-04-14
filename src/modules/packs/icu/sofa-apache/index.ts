import type { ModulePlugin } from '../../../../core/plugin/types'
import { SofaApacheRenderer } from './Renderer'
import { SofaApacheEditor } from './Editor'
import { SofaApachePrintView } from './PrintView'

export const sofaApachePlugin: ModulePlugin = {
  meta: {
    id: 'sofa-apache',
    name: 'SOFA / APACHE II',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'SOFA score (6 organ systems, 0-24) and APACHE II score (APS + age + chronic health) with published citations.',
    tags: ['icu', 'critical-care', 'severity', 'sofa', 'apache', 'prognosis'],
    pack: 'icu',
  },
  schema: {
    config: { type: 'object', properties: {} },
    data: {
      type: 'object',
      properties: {
        sofa: { type: 'object' },
        apache: { type: 'object' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 6 },
  Renderer: SofaApacheRenderer,
  Editor: SofaApacheEditor,
  PrintView: SofaApachePrintView,
}
