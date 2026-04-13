import { useRef } from 'react'
import { GRID_COL_WIDTH, GRID_ROW_HEIGHT, GRID_GAP } from './canvasUtils'
import type { ModulePosition } from '../core/template/types'

interface Props {
  position: ModulePosition
  minW?: number
  minH?: number
  onResize: (pos: ModulePosition) => void
}

export function ResizeHandle({ position, minW = 2, minH = 2, onResize }: Props) {
  const startRef = useRef<{ mouseX: number; mouseY: number; pos: ModulePosition } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startRef.current = { mouseX: e.clientX, mouseY: e.clientY, pos: { ...position } }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!startRef.current) return
      const { mouseX, mouseY, pos } = startRef.current
      const dx = moveEvent.clientX - mouseX
      const dy = moveEvent.clientY - mouseY
      const newW = Math.max(minW, pos.w + Math.round(dx / (GRID_COL_WIDTH + GRID_GAP)))
      const newH = Math.max(minH, pos.h + Math.round(dy / (GRID_ROW_HEIGHT + GRID_GAP)))
      if (newW !== pos.w || newH !== pos.h) {
        onResize({ ...pos, w: newW, h: newH })
      }
    }

    const handleMouseUp = () => {
      startRef.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 group-hover:opacity-50 transition-opacity"
      title="Drag to resize"
    >
      <svg viewBox="0 0 16 16" className="w-full h-full text-gray-500">
        <path d="M12 12L4 12M12 12L12 4M8 12L12 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
