import type { ModulePlugin } from '../../../core/plugin/types'
import ventSettingsPlugin from './vent-settings/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
]

export default pulmPack
