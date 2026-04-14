import { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const electrolyteTracker: ModulePlugin = {
  meta: {
    id: 'electrolyte-tracker',
    name: 'Electrolyte Tracker',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'Daily electrolyte table with out-of-range highlighting and sparkline trends',
    tags: ['nephrology', 'electrolytes', 'labs'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: { entries: 'array' },
  },
  defaultConfig: {},
  minSize: { w: 6, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
