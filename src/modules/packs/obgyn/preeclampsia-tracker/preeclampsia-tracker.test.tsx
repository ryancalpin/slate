import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcMAP, hasSevereRange } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

describe('calcMAP', () => {
  it('calculates MAP correctly', () => {
    // MAP = (120 + 2*80) / 3 = 280/3 = 93.3
    expect(calcMAP(120, 80)).toBeCloseTo(93.3, 0)
  })

  it('calculates severe MAP', () => {
    expect(calcMAP(170, 115)).toBeCloseTo(133.3, 0)
  })
})

describe('hasSevereRange', () => {
  it('returns true for 2 severe readings ≥4h apart', () => {
    const log = [
      { sbp: 165, dbp: 112, timestamp: '2026-04-13T08:00:00Z' },
      { sbp: 162, dbp: 111, timestamp: '2026-04-13T12:30:00Z' },
    ]
    expect(hasSevereRange(log)).toBe(true)
  })

  it('returns false for 2 severe readings <4h apart', () => {
    const log = [
      { sbp: 165, dbp: 112, timestamp: '2026-04-13T08:00:00Z' },
      { sbp: 162, dbp: 111, timestamp: '2026-04-13T10:00:00Z' },
    ]
    expect(hasSevereRange(log)).toBe(false)
  })

  it('returns false when no severe readings', () => {
    const log = [
      { sbp: 140, dbp: 90, timestamp: '2026-04-13T08:00:00Z' },
    ]
    expect(hasSevereRange(log)).toBe(false)
  })
})

describe('Renderer', () => {
  it('renders preeclampsia tracker', () => {
    render(
      <Renderer
        instanceId="pe-1"
        config={{}}
        data={{ bpLog: [], proteinuria: false, severeFeatures: {}, magDrip: {} }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Preeclampsia Tracker/i)).toBeInTheDocument()
    expect(screen.getByText(/ACOG Practice Bulletin No. 222/i)).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders citation', () => {
    render(<PrintView config={{}} data={{ bpLog: [], proteinuria: false, severeFeatures: {}, magDrip: {} }} />)
    expect(screen.getByText(/ACOG Practice Bulletin No. 222/i)).toBeInTheDocument()
  })
})
