// src/modules/lines-tubes/index.ts
import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const linesTubesPlugin: ModulePlugin = {
  meta: {
    id: 'lines-tubes',
    name: 'Lines / Tubes / Drains',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track IV lines, tubes, and drains with insertion dates and duration alerts.',
    tags: ['lines', 'nursing', 'procedures'],
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {
    lineTypes: [
      'PIV',
      'CVC (triple lumen)',
      'CVC (PICC)',
      'Arterial Line',
      'Foley Catheter',
      'NGT/OGT',
      'Chest Tube',
      'Surgical Drain',
      'Endotracheal Tube',
      'Other',
    ],
    alertDays: 5,
  },
  minSize: { w: 5, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default linesTubesPlugin
