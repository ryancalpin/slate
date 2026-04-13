import { v4 as uuid } from 'uuid'
import { db } from './db'
import type { Template } from '../template/types'

export const templateStore = {
  async save(template: Template): Promise<void> {
    await db.templates.put(template)
  },

  async get(id: string): Promise<Template | undefined> {
    return db.templates.get(id)
  },

  async list(): Promise<Template[]> {
    return db.templates.orderBy('updatedAt').reverse().toArray()
  },

  async delete(id: string): Promise<void> {
    await db.templates.delete(id)
  },

  async duplicate(id: string): Promise<Template> {
    const original = await db.templates.get(id)
    if (!original) throw new Error(`Template ${id} not found`)
    const now = new Date().toISOString()
    const copy: Template = {
      ...original,
      id: uuid(),
      name: `${original.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    }
    await db.templates.put(copy)
    return copy
  },

  async clear(): Promise<void> {
    await db.templates.clear()
  },
}
