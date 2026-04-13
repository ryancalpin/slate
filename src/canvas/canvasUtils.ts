import type { CSSProperties } from 'react'
import type { ModulePosition } from '../core/template/types'

export const GRID_COL_WIDTH = 80   // pixels per grid column
export const GRID_ROW_HEIGHT = 60  // pixels per grid row
export const GRID_COLS = 12
export const GRID_GAP = 8

export function gridToPixel(pos: ModulePosition): CSSProperties {
  return {
    position: 'absolute',
    left: pos.x * (GRID_COL_WIDTH + GRID_GAP),
    top: pos.y * (GRID_ROW_HEIGHT + GRID_GAP),
    width: pos.w * GRID_COL_WIDTH + (pos.w - 1) * GRID_GAP,
    height: pos.h * GRID_ROW_HEIGHT + (pos.h - 1) * GRID_GAP,
  }
}

export function pixelToGrid(
  pixelX: number,
  pixelY: number,
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.round(pixelX / (GRID_COL_WIDTH + GRID_GAP))),
    y: Math.max(0, Math.round(pixelY / (GRID_ROW_HEIGHT + GRID_GAP))),
  }
}

export function clampToGrid(pos: ModulePosition): ModulePosition {
  return {
    ...pos,
    x: Math.max(0, Math.min(pos.x, GRID_COLS - pos.w)),
    y: Math.max(0, pos.y),
  }
}
