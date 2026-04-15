import type { FC } from 'react'
import type { ModulePlugin, ModuleRenderProps, ModulePrintProps } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const neuroScoresPlugin: ModulePlugin = {
  meta: {
    id: 'neuro-scores',
    name: 'Neuro Scores',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'mRS, GCS, Hunt-Hess Grade, and Fisher Grade on one panel',
    tags: ['neuro', 'score', 'gcs', 'sah', 'stroke'],
    pack: 'neuro',
  },
  schema: {
    config: {},
    data: {
      mrs: { type: 'number' },
      gcsE: { type: 'number' },
      gcsV: { type: 'number' },
      gcsM: { type: 'number' },
      huntHess: { type: 'number' },
      fisherGrade: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 6 },
  Renderer: Renderer as FC<ModuleRenderProps>,
  Editor,
  PrintView: PrintView as FC<ModulePrintProps>,
}
