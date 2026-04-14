import { describe, it, expect } from 'vitest'
import { freeformToPixel, pixelToFreeform } from './canvasUtils'

describe('freeformToPixel', () => {
  it('converts freeform {x, y} to pixel CSS values', () => {
    const result = freeformToPixel({ x: 50, y: 100 })
    expect(result.left).toBe('50px')
    expect(result.top).toBe('100px')
  })
})

describe('pixelToFreeform', () => {
  it('converts pixel coordinates to freeform {x, y}', () => {
    const result = pixelToFreeform(50, 100)
    expect(result.x).toBe(50)
    expect(result.y).toBe(100)
  })
})
