import type { FC } from 'react'
import { SteroidTaperRenderer } from './Renderer'
import { SteroidTaperEditor } from './Editor'
import { SteroidTaperPrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'
import { pluginRegistry } from '../../../../core/plugin/registry'

const steroidTaper: ModulePlugin = {
  meta: {
    id: 'steroid-taper',
    name: 'Steroid Taper',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'Steroid taper schedule with today-highlight and adrenal insufficiency advisory.',
    tags: ['steroid', 'prednisone', 'taper', 'endocrinology', 'adrenal'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      drug: 'string',
      schedule: 'array',
      prolongedHighDose: 'boolean',
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer: SteroidTaperRenderer as FC<any>,
  Editor: SteroidTaperEditor as FC<any>,
  PrintView: SteroidTaperPrintView as FC<any>,
}

pluginRegistry.register(steroidTaper)

export default steroidTaper
