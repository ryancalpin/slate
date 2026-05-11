import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcGA } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

describe('calcGA', () => {
  it('returns correct weeks and days', () => {
    // LMP 2026-01-01, today 2026-04-13 => 102 days => 14 weeks 4 days
    const result = calcGA('2026-01-01', '2026-04-13')
    expect(result.weeks).toBe(14)
    expect(result.days).toBe(4)
  })

  it('returns 0 weeks 0 days for same day', () => {
    const result = calcGA('2026-04-13', '2026-04-13')
    expect(result.weeks).toBe(0)
    expect(result.days).toBe(0)
  })
})

describe('Renderer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-13'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders GA and FHR fields', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={{}}
        data={{ lmpDate: '2026-01-01', fhr: 145, contractionFreq: 5, contractionDuration: 40, contractionRegularity: 'regular', presentation: 'cephalic', gbsStatus: 'negative', gbsProphylaxis: false }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/14 weeks/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('145')).toBeInTheDocument()
  })
})

describe('PrintView', () => {
  it('renders citation', () => {
    render(
      <PrintView
        config={{}}
        data={{ lmpDate: '2026-01-01', fhr: 140, contractionFreq: 5, contractionDuration: 40, contractionRegularity: 'regular', presentation: 'cephalic', gbsStatus: 'negative', gbsProphylaxis: false }}
      />
    )
    expect(screen.getByText(/ACOG/i)).toBeInTheDocument()
  })
})
