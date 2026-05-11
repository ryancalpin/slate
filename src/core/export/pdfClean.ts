import { createRoot } from 'react-dom/client'
import React from 'react'
import type { Template, TemplatePage } from '../template/types'
import type { PluginRegistry } from '../plugin/registry'

interface PrintProps {
  data: Record<string, unknown>
  config: Record<string, unknown>
}

/**
 * Renders each module's PrintView component into an off-screen div,
 * captures each as a canvas, and assembles them into a multi-page PDF.
 * Each module snapshot occupies its own segment with proper page breaks.
 */
export async function exportCleanDocPdf(
  template: Template,
  registry: PluginRegistry,
  _container: HTMLElement,
  activeSlotId?: string,
): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfWidth = 210
  const pdfHeight = 297
  const margin = 10
  let currentY = margin
  let isFirstPage = true

  for (const page of template.pages as TemplatePage[]) {
    for (const instance of page.layout) {
      const plugin = registry.get(instance.moduleId)
      if (!plugin?.PrintView) continue

      // Resolve data for this module instance
      const data: Record<string, unknown> =
        template.patientMode === 'roster' && activeSlotId
          ? ((template.patientSlots?.find((s: { id: string }) => s.id === activeSlotId)
              ?.data?.[instance.instanceId] as Record<string, unknown>) ?? {})
          : ((template.singleData?.[instance.instanceId] as Record<string, unknown>) ?? {})

      const config = (instance.config as Record<string, unknown>) ?? {}

      // Mount PrintView into a hidden off-screen element
      const wrapper = document.createElement('div')
      wrapper.style.cssText =
        'position:absolute;left:-9999px;top:0;width:794px;background:white;color:black;'
      document.body.appendChild(wrapper)

      const root = createRoot(wrapper)
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(plugin.PrintView as React.FC<PrintProps>, { data, config }),
        )
        // Allow React to flush
        setTimeout(resolve, 50)
      })

      const canvas = await html2canvas(wrapper, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
      })

      root.unmount()
      document.body.removeChild(wrapper)

      const imgData = canvas.toDataURL('image/png')
      const availWidth = pdfWidth - margin * 2
      const ratio = availWidth / canvas.width
      const imgHeight = canvas.height * ratio

      if (!isFirstPage && currentY + imgHeight > pdfHeight - margin) {
        doc.addPage()
        currentY = margin
      }

      doc.addImage(imgData, 'PNG', margin, currentY, availWidth, imgHeight)
      currentY += imgHeight + 6
      isFirstPage = false
    }
  }

  const arrayBuffer = doc.output('arraybuffer')
  return new Blob([arrayBuffer], { type: 'application/pdf' })
}
