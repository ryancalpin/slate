import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { useParams } from 'react-router-dom'
import { useTemplate } from '../../hooks/useTemplate'
import { pluginRegistry } from '../../core/plugin/registry'

export function PrintPreview() {
  const { id } = useParams<{ id: string }>()
  const { template } = useTemplate(id ?? null)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: template?.name ?? 'Patient Template',
  })

  if (!template) return null

  const page = template.pages[0]
  const data = template.singleData

  return (
    <div>
      <div className="no-print p-4 flex justify-between items-center border-b border-gray-800">
        <span className="text-sm text-gray-400">Print Preview — {template.name}</span>
        <button
          onClick={() => handlePrint()}
          className="px-4 py-2 bg-accent text-gray-900 rounded text-sm font-semibold"
        >
          Print / Save PDF
        </button>
      </div>

      <div ref={printRef} className="print-container bg-white text-gray-900 p-8">
        <h1 className="text-lg font-bold mb-4">{template.name}</h1>
        {page.layout.map(instance => {
          const plugin = pluginRegistry.get(instance.moduleId)
          if (!plugin) return null
          const { PrintView } = plugin
          return (
            <div key={instance.instanceId} className="mb-4 break-inside-avoid">
              <div className="text-xs font-bold uppercase text-gray-500 mb-1">{plugin.meta.name}</div>
              <PrintView config={instance.config} data={data[instance.instanceId] ?? {}} />
            </div>
          )
        })}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { padding: 0; }
        }
      `}</style>
    </div>
  )
}
