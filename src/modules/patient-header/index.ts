import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const patientHeaderPlugin: ModulePlugin = {
  meta: {
    id: 'patient-header',
    name: 'Patient Header',
    version: '1.0.0',
    author: 'core',
    description: 'Compact patient identification header with configurable fields.',
    tags: ['header', 'patient', 'identification'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    showRoom: true,
    showPatient: true,
    showAge: true,
    showSex: true,
    showAdmitDate: true,
    showAttending: true,
    showService: true,
    showDiagnosis: true,
    showCodeStatus: true,
    showIsolation: true,
    customLabels: [{ name: '' }, { name: '' }, { name: '' }],
  },
  minSize: { w: 6, h: 3 },
  Renderer,
  Editor,
  PrintView,
}
