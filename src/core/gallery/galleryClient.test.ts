import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGalleryIndex, importGalleryTemplate } from './galleryClient'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockIndexJson = {
  templates: [
    {
      id: 'community-icu',
      name: 'ICU Rounding Card',
      description: 'Complete ICU rounding template with vitals, vents, and pressors',
      tags: ['icu', 'critical-care'],
      author: 'drsmith',
      version: '1.0.0',
      ptjsonUrl: 'https://raw.githubusercontent.com/patient-templates/community/main/templates/icu.ptjson',
    },
  ],
}

describe('fetchGalleryIndex', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns parsed template list on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockIndexJson,
    })
    const result = await fetchGalleryIndex()
    expect(result.templates).toHaveLength(1)
    expect(result.templates[0].name).toBe('ICU Rounding Card')
  })

  it('returns empty templates array on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const result = await fetchGalleryIndex()
    expect(result.templates).toEqual([])
    expect(result.error).toBeTruthy()
  })

  it('returns empty templates array on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    const result = await fetchGalleryIndex()
    expect(result.templates).toEqual([])
    expect(result.error).toBeTruthy()
  })
})

describe('importGalleryTemplate', () => {
  it('fetches a ptjson URL and returns parsed template object', async () => {
    const mockTemplate = { id: 'imported', name: 'ICU Rounding Card', pages: [] }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplate,
    })
    const result = await importGalleryTemplate(
      'https://raw.githubusercontent.com/example/template.ptjson',
    )
    expect(result.id).toBe('imported')
    expect(result.name).toBe('ICU Rounding Card')
  })

  it('throws an error when fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 })
    await expect(
      importGalleryTemplate('https://example.com/missing.ptjson'),
    ).rejects.toThrow('Failed to fetch template')
  })
})
