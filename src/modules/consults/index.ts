// src/modules/consults/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const consultsPlugin: ModulePlugin = {
  meta: {
    id: 'consults',
    name: 'Consults & Results',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track active consults by service and monitor pending imaging/lab results.',
    tags: ['consults', 'results', 'communication'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    consultLabel: 'Active Consults',
    resultsLabel: 'Pending Results',
  },
  minSize: { w: 5, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default consultsPlugin
