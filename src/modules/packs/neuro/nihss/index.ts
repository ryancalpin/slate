import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const nihssPlugin: ModulePlugin = {
  meta: {
    id: 'nihss',
    name: 'NIHSS',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'NIH Stroke Scale — 15-item neurological deficit scoring',
    tags: ['neuro', 'stroke', 'score'],
    pack: 'neuro',
  },
  schema: {
    config: {},
    data: {
      items: { type: 'array', items: { type: 'number' }, minItems: 15, maxItems: 15 },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 8 },
  Renderer,
  Editor,
  PrintView,
}
