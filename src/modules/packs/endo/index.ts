import insulinInfusion from './insulin-infusion'
import glucoseLog from './glucose-log'
import dkaTracker from './dka-tracker'
import steroidTaper from './steroid-taper'
import type { ModulePlugin } from '../../../core/plugin/types'

export const endoPack: ModulePlugin[] = [
  insulinInfusion,
  glucoseLog,
  dkaTracker,
  steroidTaper,
]

export default endoPack
