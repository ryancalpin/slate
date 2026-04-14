export { nihssPlugin } from './nihss'
export { neuroScoresPlugin } from './neuro-scores'
export { icpMonitorPlugin } from './icp-monitor'
export { strokeTimelinePlugin } from './stroke-timeline'

import { nihssPlugin } from './nihss'
import { neuroScoresPlugin } from './neuro-scores'
import { icpMonitorPlugin } from './icp-monitor'
import { strokeTimelinePlugin } from './stroke-timeline'
import type { ModulePlugin } from '../../../core/plugin/types'
import { pluginRegistry } from '../../../core/plugin/registry'

export const neuroPack: ModulePlugin[] = [
  nihssPlugin,
  neuroScoresPlugin,
  icpMonitorPlugin,
  strokeTimelinePlugin,
]

// Register all neuro pack modules into the global plugin registry
neuroPack.forEach((plugin) => pluginRegistry.register(plugin))
