/**
 * Captures the given element as a pixel-perfect screenshot and embeds it
 * into a jsPDF document. Always renders in light mode regardless of the
 * current theme by temporarily removing the 'dark' class.
 *
 * @param element - The DOM element to capture (typically the canvas root div)
 * @returns A Blob containing the PDF file
 */
export async function exportPixelPerfectPdf(element: HTMLElement): Promise<Blob> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const hadDark = element.classList.contains('dark')
  if (hadDark) {
    element.classList.remove('dark')
  }

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 2, // retina quality
      logging: false,
    })
  } finally {
    if (hadDark) {
      element.classList.add('dark')
    }
  }

  const imgData = canvas.toDataURL('image/png')
  const imgWidth = canvas.width
  const imgHeight = canvas.height

  // A4 dimensions in mm
  const pdfWidth = 210
  const pdfHeight = 297
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
  const scaledWidth = imgWidth * ratio
  const scaledHeight = imgHeight * ratio
  const xOffset = (pdfWidth - scaledWidth) / 2

  const doc = new jsPDF({
    orientation: scaledHeight > scaledWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  doc.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight)

  const arrayBuffer = doc.output('arraybuffer')
  return new Blob([arrayBuffer], { type: 'application/pdf' })
}

/**
 * Triggers a browser download of a Blob as a named file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
