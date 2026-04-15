import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcDailyDrainTotal } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const baseData = {
  drains: [
    {
      name: 'JP #1',
      character: 'serosanguinous',
      entries: [
        { date: '2026-04-13', shift: 'day' as const, volumeMl: 120 },
        { date: '2026-04-13', shift: 'evening' as const, volumeMl: 80 },
        { date: '2026-04-12', shift: 'day' as const, volumeMl: 200 },
      ],
    },
  ],
  alertThresholdMl: 500,
}

describe('calcDailyDrainTotal', () => {
  it('sums entries for the given date only', () => {
    expect(calcDailyDrainTotal(baseData.drains[0].entries, '2026-04-13')).toBe(200)
  })

  it('returns 0 when no entries match the date', () => {
    expect(calcDailyDrainTotal(baseData.drains[0].entries, '2026-04-11')).toBe(0)
  })
})

describe('Renderer', () => {
  it('renders drain name and character', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={{ alertThresholdMl: 500 }}
        data={baseData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText('JP #1')).toBeTruthy()
    expect(screen.getByText(/serosanguinous/i)).toBeTruthy()
  })

  it('highlights entry that exceeds alert threshold', () => {
    const highData = {
      drains: [
        {
          name: 'Blake',
          character: 'hemorrhagic',
          entries: [{ date: '2026-04-13', shift: 'day' as const, volumeMl: 600 }],
        },
      ],
      alertThresholdMl: 500,
    }
    const { container } = render(
      <Renderer
        instanceId="test-2"
        config={{ alertThresholdMl: 500 }}
        data={highData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // amber highlight class should be present
    expect(container.innerHTML).toContain('amber')
  })

  it('shows Add Drain button in build mode', () => {
    render(
      <Renderer
        instanceId="test-3"
        config={{ alertThresholdMl: 500 }}
        data={{ drains: [], alertThresholdMl: 500 }}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByText(/add drain/i)).toBeTruthy()
  })
})

describe('PrintView', () => {
  it('renders drain name in print view', () => {
    render(<PrintView config={{ alertThresholdMl: 500 }} data={baseData} />)
    expect(screen.getByText('JP #1')).toBeTruthy()
  })
})
