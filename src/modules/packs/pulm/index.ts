import type { ModulePlugin } from '../../../core/plugin/types'
import ventSettingsPlugin from './vent-settings/index'
import abgInterpreterPlugin from './abg-interpreter/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
  abgInterpreterPlugin,
]

export default pulmPack
