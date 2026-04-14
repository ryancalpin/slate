import type { ModulePlugin } from '../../../../core/plugin/types'
import { NeutropenicFeverRenderer } from './Renderer'
import { NeutropenicFeverEditor } from './Editor'
import { NeutropenicFeverPrintView } from './PrintView'

export const neutropenicFeverPlugin: ModulePlugin = {
  meta: {
    id: 'neutropenic-fever',
    name: 'Neutropenic Fever',
    version: '1.0.0',
    author: 'HemOnc Pack',
    description: 'MASCC risk scoring and empiric coverage checklist for neutropenic fever.',
    tags: ['hemonc', 'neutropenic fever', 'MASCC', 'oncology'],
    pack: 'hemonc',
  },
  schema: {
    config: {},
    data: {
      ancValue: 'number',
      tempC: 'number',
      masccItems: 'object',
      coverageChecklist: 'object',
    },
  },
  defaultConfig: { showCoverage: true, showCitation: true },
  minSize: { w: 3, h: 5 },
  Renderer: NeutropenicFeverRenderer,
  Editor: NeutropenicFeverEditor,
  PrintView: NeutropenicFeverPrintView,
}
