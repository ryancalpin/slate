import type { FC } from 'react'
import type { ModulePlugin, ModuleRenderProps, ModulePrintProps } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const strokeTimelinePlugin: ModulePlugin = {
  meta: {
    id: 'stroke-timeline',
    name: 'Stroke Timeline',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Acute stroke workflow timestamps with auto-calculated door-to-needle intervals',
    tags: ['neuro', 'stroke', 'timeline', 'tpa', 'thrombectomy'],
    pack: 'neuro',
  },
  schema: {
    config: {},
    data: {
      lkw: { type: 'string' },
      doorTime: { type: 'string' },
      ctTime: { type: 'string' },
      tpaDecision: { type: 'string' },
      tpaAdmin: { type: 'string' },
      groinTime: { type: 'string' },
      recanalTime: { type: 'string' },
      ticiGrade: { type: 'string' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 9 },
  Renderer: Renderer as FC<ModuleRenderProps>,
  Editor,
  PrintView: PrintView as FC<ModulePrintProps>,
}
