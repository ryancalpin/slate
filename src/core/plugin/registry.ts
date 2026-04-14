import type { ModulePlugin } from './types'

export class PluginRegistry {
  private plugins = new Map<string, ModulePlugin>()

  register(plugin: ModulePlugin): void {
    if (this.plugins.has(plugin.meta.id)) {
      throw new Error(`Plugin "${plugin.meta.id}" already registered`)
    }
    this.plugins.set(plugin.meta.id, plugin)
  }

  get(id: string): ModulePlugin | undefined {
    return this.plugins.get(id)
  }

  list(): ModulePlugin[] {
    return Array.from(this.plugins.values())
  }

  listByTag(tag: string): ModulePlugin[] {
    return this.list().filter(p => p.meta.tags.includes(tag))
  }

  listByPack(packId: string): ModulePlugin[] {
    return this.list().filter(p => p.meta.pack === packId)
  }

  /** Returns all registered plugins as an array. */
  getAll(): ModulePlugin[] {
    return Array.from(this.plugins.values())
  }

  /** Removes a plugin by ID. Built-in protection should be enforced in the UI, not here. */
  unregister(id: string): void {
    this.plugins.delete(id)
  }
}

// Global singleton — imported by Canvas and ModulePalette
export const pluginRegistry = new PluginRegistry()
// Alias used by module registration files
export const registry = pluginRegistry
