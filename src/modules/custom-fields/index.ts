// src/modules/custom-fields/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const customFieldsPlugin: ModulePlugin = {
  meta: {
    id: 'custom-fields',
    name: 'Custom Fields',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'User-defined fields: text, number, checkbox, dropdown, and date inputs.',
    tags: ['custom', 'fields', 'data-entry'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    fields: [],
  },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

export default customFieldsPlugin
