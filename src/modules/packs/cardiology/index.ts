import { registry } from '../../../core/plugin/registry'
import GdmtTrackerPlugin from './gdmt-tracker'
import EchoEFPlugin from './echo-ef'
import HemodynamicsPlugin from './hemodynamics'
import RhythmPacerPlugin from './rhythm-pacer'
import CardiacScoresPlugin from './cardiac-scores'

registry.register(GdmtTrackerPlugin)
registry.register(EchoEFPlugin)
registry.register(HemodynamicsPlugin)
registry.register(RhythmPacerPlugin)
registry.register(CardiacScoresPlugin)
