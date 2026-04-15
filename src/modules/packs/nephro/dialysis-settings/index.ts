import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const dialysisSettings: ModulePlugin = {
  meta: {
    id: 'dialysis-settings',
    name: 'Dialysis Settings',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'HD / CRRT / PD prescription fields with modality toggle',
    tags: ['nephrology', 'dialysis', 'HD', 'CRRT', 'PD'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: {
      modality: 'string',
      hd: 'object',
      crrt: 'object',
      pd: 'object',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
