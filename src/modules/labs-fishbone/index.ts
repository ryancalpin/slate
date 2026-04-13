import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const labsFishbonePlugin: ModulePlugin = {
  meta: {
    id: 'labs-fishbone',
    name: 'Labs Fishbone',
    version: '1.0.0',
    author: 'core',
    description: 'Classic electrolyte fishbone (Tic-tac-toe) diagram for quick lab entry.',
    tags: ['labs', 'fishbone', 'electrolytes'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showGlucose: true,
    showMgPhos: false,
  },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}
