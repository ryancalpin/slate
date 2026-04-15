import type { FC } from 'react'
import type { ModulePlugin, ModuleRenderProps, ModulePrintProps } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const icpMonitorPlugin: ModulePlugin = {
  meta: {
    id: 'icp-monitor',
    name: 'ICP Monitor',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'ICP/MAP/CPP tracking, pupil assessment, and EVD management',
    tags: ['neuro', 'icp', 'critical care', 'tbi', 'neurocritical'],
    pack: 'neuro',
  },
  schema: {
    config: {
      cppTarget: { type: 'number' },
    },
    data: {
      icp: { type: 'number' },
      map: { type: 'number' },
      cppTarget: { type: 'number' },
      pupilL: { type: 'object' },
      pupilR: { type: 'object' },
      evdEnabled: { type: 'boolean' },
      evd: { type: 'object' },
    },
  },
  defaultConfig: { cppTarget: 60 },
  minSize: { w: 3, h: 7 },
  Renderer: Renderer as FC<ModuleRenderProps>,
  Editor,
  PrintView: PrintView as FC<ModulePrintProps>,
}
