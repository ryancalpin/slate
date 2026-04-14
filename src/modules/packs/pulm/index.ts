import type { ModulePlugin } from '../../../core/plugin/types'
import ventSettingsPlugin from './vent-settings/index'
import abgInterpreterPlugin from './abg-interpreter/index'
import respiratoryScoresPlugin from './respiratory-scores/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
  abgInterpreterPlugin,
  respiratoryScoresPlugin,
]

export default pulmPack
