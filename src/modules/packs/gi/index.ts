import { pluginRegistry } from '../../../core/plugin/registry'
import { meldNaPlugin } from './meld-na'
import { ascitesTrackerPlugin } from './ascites-tracker'
import { encephalopathyPlugin } from './encephalopathy'
import { giBleedPlugin } from './gi-bleed'
import type { ModulePlugin } from '../../../core/plugin/types'

export { meldNaPlugin } from './meld-na'
export { ascitesTrackerPlugin } from './ascites-tracker'
export { encephalopathyPlugin } from './encephalopathy'
export { giBleedPlugin } from './gi-bleed'
export type { ModulePlugin } from '../../../core/plugin/types'

pluginRegistry.register(meldNaPlugin)
pluginRegistry.register(ascitesTrackerPlugin)
pluginRegistry.register(encephalopathyPlugin)
pluginRegistry.register(giBleedPlugin)

export const giPack: ModulePlugin[] = [
  meldNaPlugin,
  ascitesTrackerPlugin,
  encephalopathyPlugin,
  giBleedPlugin,
]
