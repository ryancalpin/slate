// src/modules/calculated/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const calculatedPlugin: ModulePlugin = {
  meta: {
    id: 'calculated',
    name: 'Clinical Calculators',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Evidence-based clinical calculators with mandatory citations. Custom formula editor included.',
    tags: ['calculators', 'clinical', 'evidence-based'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    enabledCalculators: ['anion-gap', 'map', 'bmi'],
    customFormulas: [],
  },
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default calculatedPlugin
