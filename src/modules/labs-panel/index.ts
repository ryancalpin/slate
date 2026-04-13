import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const labsPanelPlugin: ModulePlugin = {
  meta: {
    id: 'labs-panel',
    name: 'Labs Panel',
    version: '1.0.0',
    author: 'core',
    description: 'BMP, CBC, LFTs, and Coags panels with out-of-range highlighting.',
    tags: ['labs', 'bmp', 'cbc', 'critical-care'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showBmp: true,
    showCbc: true,
    showLfts: false,
    showCoags: false,
    showTrend: true,
    normalRanges: {
      na: { min: 136, max: 145 }, k: { min: 3.5, max: 5.0 },
      cl: { min: 98, max: 106 }, co2: { min: 22, max: 29 },
      bun: { min: 7, max: 20 }, cr: { min: 0.6, max: 1.2 },
      glucose: { min: 70, max: 100 }, wbc: { min: 4.5, max: 11.0 },
      hgb: { min: 12, max: 17.5 }, hct: { min: 36, max: 50 },
      plt: { min: 150, max: 400 },
    },
  },
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
