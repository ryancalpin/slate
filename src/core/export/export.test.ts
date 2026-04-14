import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: vi.fn().mockReturnValue('data:image/png;base64,AAAA'),
    width: 800,
    height: 600,
  }),
}))

// Mock jsPDF — must use a regular function (not arrow) so 'new' works
const mockAddImage = vi.fn()
const mockSave = vi.fn()
const mockOutput = vi.fn().mockReturnValue(new ArrayBuffer(3))
vi.mock('jspdf', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsPDF: vi.fn(function (this: any) {
    this.addImage = mockAddImage
    this.save = mockSave
    this.output = mockOutput
    this.internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } }
  }),
}))

import { exportPixelPerfectPdf } from './pdfPixel'

describe('exportPixelPerfectPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = '<div id="canvas-root" class="dark">content</div>'
  })

  it('returns a Blob', async () => {
    const el = document.getElementById('canvas-root') as HTMLElement
    const blob = await exportPixelPerfectPdf(el)
    expect(blob).toBeInstanceOf(Blob)
  })

  it('temporarily removes dark class before capture and restores it', async () => {
    const el = document.getElementById('canvas-root') as HTMLElement
    expect(el.classList.contains('dark')).toBe(true)

    const html2canvas = (await import('html2canvas')).default as ReturnType<typeof vi.fn>
    html2canvas.mockImplementationOnce(async (target: HTMLElement) => {
      // During capture, dark class should be removed
      expect(target.classList.contains('dark')).toBe(false)
      return { toDataURL: () => 'data:image/png;base64,AAAA', width: 800, height: 600 }
    })

    await exportPixelPerfectPdf(el)
    // After capture, dark class is restored
    expect(el.classList.contains('dark')).toBe(true)
  })
})

import { exportCleanDocPdf } from './pdfClean'
import type { Template } from '../template/types'
import type { PluginRegistry } from '../plugin/registry'

describe('exportCleanDocPdf', () => {
  it('returns a Blob given a template and a container element', async () => {
    const mockTemplate = {
      id: 't1',
      name: 'Test',
      pages: [{ id: 'p1', name: 'Page 1', layout: [] }],
    } as unknown as Template

    const mockRegistry = {
      get: vi.fn().mockReturnValue(undefined),
    } as unknown as PluginRegistry

    const container = document.createElement('div')
    document.body.appendChild(container)

    const blob = await exportCleanDocPdf(mockTemplate, mockRegistry, container)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('application/pdf')

    document.body.removeChild(container)
  })
})
