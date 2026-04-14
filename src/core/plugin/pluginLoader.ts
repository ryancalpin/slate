import type { ModulePlugin } from './types'

/**
 * Validates that an unknown value matches the required ModulePlugin shape.
 * Checks for required top-level keys and non-empty meta.id.
 */
export function validatePluginShape(value: unknown): value is ModulePlugin {
  if (!value || typeof value !== 'object') return false
  const obj = value as Record<string, unknown>

  if (!obj['meta'] || typeof obj['meta'] !== 'object') return false
  const meta = obj['meta'] as Record<string, unknown>
  if (!meta['id'] || typeof meta['id'] !== 'string' || meta['id'].trim() === '') return false
  if (!meta['name'] || !meta['version'] || !meta['author']) return false

  if (typeof obj['Renderer'] !== 'function') return false
  if (typeof obj['Editor'] !== 'function') return false
  if (typeof obj['PrintView'] !== 'function') return false

  if (!obj['schema'] || typeof obj['schema'] !== 'object') return false
  if (!obj['minSize'] || typeof obj['minSize'] !== 'object') return false

  return true
}

/**
 * Dynamically imports a plugin from a remote URL.
 *
 * The URL must point to an ES module that exports a valid ModulePlugin as its
 * default export. Throws with a descriptive message if the module cannot be
 * loaded or fails shape validation.
 *
 * @param url - Raw URL to the `.ptplugin` ES module bundle
 */
export async function loadPluginFromUrl(url: string): Promise<ModulePlugin> {
  let mod: Record<string, unknown>
  try {
    // Dynamic import — works in modern browsers and Vite
    mod = (await import(/* @vite-ignore */ url)) as Record<string, unknown>
  } catch (err) {
    throw new Error(
      `Failed to load plugin from "${url}": ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  const plugin = mod['default'] ?? mod
  if (!validatePluginShape(plugin)) {
    throw new Error(
      `Plugin at "${url}" does not export a valid ModulePlugin. ` +
        `Ensure the module has a default export with meta.id, Renderer, Editor, and PrintView.`,
    )
  }

  return plugin
}
