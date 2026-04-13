import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const intakeOutputPlugin: ModulePlugin = {
  meta: {
    id: 'intake-output',
    name: 'Intake & Output',
    version: '1.0.0',
    author: 'core',
    description: '24-hour I/O tracker with UOP auto-calculation and net balance.',
    tags: ['nursing', 'i/o', 'fluids', 'critical-care'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showUOP: true,
    windowLabel: '24h I/O',
  },
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
