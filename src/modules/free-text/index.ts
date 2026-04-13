// src/modules/free-text/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const freeTextPlugin: ModulePlugin = {
  meta: {
    id: 'free-text',
    name: 'Free Text / Notes',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'A resizable text area with configurable label and font size.',
    tags: ['notes', 'text', 'documentation'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    label: 'Notes',
    fontSize: 'base',
    placeholder: 'Enter notes here...',
  },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

export default freeTextPlugin
