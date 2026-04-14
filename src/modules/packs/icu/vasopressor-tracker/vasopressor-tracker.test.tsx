import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VasopressorRenderer } from './Renderer'

const emptyData = { pressors: [], mapReadings: [] }

const sampleData = {
  pressors: [
    { agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 },
    { agent: 'vasopressin', dose: 0.04, unit: 'units/min', mapTarget: 65 },
  ],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 58 },
    { timestamp: '2026-04-13T09:00:00Z', map: 67 },
  ],
}

const risingData = {
  pressors: [{ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 55 },
    { timestamp: '2026-04-13T09:00:00Z', map: 70 },
  ],
}

const fallingData = {
  pressors: [{ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 70 },
    { timestamp: '2026-04-13T09:00:00Z', map: 55 },
  ],
}

const stableData = {
  pressors: [{ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }],
  mapReadings: [
    { timestamp: '2026-04-13T08:00:00Z', map: 66 },
    { timestamp: '2026-04-13T09:00:00Z', map: 66 },
  ],
}

describe('VasopressorRenderer', () => {
  it('renders with no pressors and shows add button', () => {
    render(
      <VasopressorRenderer
        instanceId="test-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Add Pressor/i)).toBeTruthy()
  })

  it('renders existing pressor rows', () => {
    render(
      <VasopressorRenderer
        instanceId="test-2"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('norepinephrine')).toBeTruthy()
    expect(screen.getByDisplayValue('vasopressin')).toBeTruthy()
  })

  it('calls onDataChange when Add Pressor is clicked', () => {
    const onDataChange = vi.fn()
    render(
      <VasopressorRenderer
        instanceId="test-3"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText(/Add Pressor/i))
    expect(onDataChange).toHaveBeenCalledOnce()
    const updated = onDataChange.mock.calls[0][0]
    expect(updated.pressors).toHaveLength(1)
  })

  it('disables Add Pressor when 4 pressors already exist', () => {
    const fourPressors = {
      pressors: Array(4).fill({ agent: 'norepinephrine', dose: 0.1, unit: 'mcg/kg/min', mapTarget: 65 }),
      mapReadings: [],
    }
    render(
      <VasopressorRenderer
        instanceId="test-4"
        config={{}}
        data={fourPressors}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    const btn = screen.getByText(/Add Pressor/i).closest('button')
    expect(btn?.disabled).toBe(true)
  })

  it('shows rising trend arrow ↑ when MAP increases', () => {
    render(
      <VasopressorRenderer
        instanceId="test-5"
        config={{}}
        data={risingData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('↑')).toBeTruthy()
  })

  it('shows falling trend arrow ↓ when MAP decreases', () => {
    render(
      <VasopressorRenderer
        instanceId="test-6"
        config={{}}
        data={fallingData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('↓')).toBeTruthy()
  })

  it('shows stable trend arrow → when MAP unchanged', () => {
    render(
      <VasopressorRenderer
        instanceId="test-7"
        config={{}}
        data={stableData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('→')).toBeTruthy()
  })

  it('renders in build mode without crashing', () => {
    render(
      <VasopressorRenderer
        instanceId="test-8"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="build"
      />
    )
    expect(screen.getByText(/norepinephrine/i)).toBeTruthy()
  })
})
