import type { Template } from '../template/types'

// Configurable community index URL — change this to point to your fork
export const COMMUNITY_INDEX_URL =
  'https://raw.githubusercontent.com/patient-templates/community/main/index.json'

export interface GalleryTemplateEntry {
  id: string
  name: string
  description: string
  tags: string[]
  author: string
  version: string
  ptjsonUrl: string
}

export interface GalleryIndex {
  templates: GalleryTemplateEntry[]
  error?: string
}

/**
 * Fetches the community template index JSON.
 * Returns an empty list with an error message if the fetch fails,
 * so callers can show an "offline" notice without throwing.
 */
export async function fetchGalleryIndex(): Promise<GalleryIndex> {
  try {
    const response = await fetch(COMMUNITY_INDEX_URL)
    if (!response.ok) {
      return {
        templates: [],
        error: `Community gallery unavailable (HTTP ${response.status})`,
      }
    }
    const data = (await response.json()) as GalleryIndex
    return { templates: data.templates ?? [] }
  } catch {
    return {
      templates: [],
      error: 'Community gallery unavailable offline',
    }
  }
}

/**
 * Fetches and parses a `.ptjson` template from a given URL.
 * Throws with a descriptive message on failure.
 *
 * @param url - Raw URL to a `.ptjson` file
 * @returns Parsed Template object (caller is responsible for saving to IndexedDB)
 */
export async function importGalleryTemplate(url: string): Promise<Template> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch template from ${url} (HTTP ${response.status})`)
  }
  const template = (await response.json()) as Template
  return {
    ...template,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
