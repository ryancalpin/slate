import Dexie, { type Table } from 'dexie'
import type { Template } from '../template/types'

export class PatientTemplateDB extends Dexie {
  templates!: Table<Template, string>

  constructor() {
    super('PatientTemplateDB')
    this.version(1).stores({
      templates: 'id, name, updatedAt, patientMode',
    })
  }
}

export const db = new PatientTemplateDB()
