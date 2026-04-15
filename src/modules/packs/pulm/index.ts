import type { ModulePlugin } from '../../../core/plugin/types'
import { pluginRegistry } from '../../../core/plugin/registry'
import ventSettingsPlugin from './vent-settings/index'
import abgInterpreterPlugin from './abg-interpreter/index'
import respiratoryScoresPlugin from './respiratory-scores/index'
import weaningReadinessPlugin from './weaning-readiness/index'

const pulmPack: ModulePlugin[] = [
  ventSettingsPlugin,
  abgInterpreterPlugin,
  respiratoryScoresPlugin,
  weaningReadinessPlugin,
]

pulmPack.forEach(plugin => pluginRegistry.register(plugin))

export default pulmPack
