import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcTimeAtGoal } from './index'
import Renderer from './Renderer'

describe('calcTimeAtGoal', () => {
  it('returns 100 when all entries are within range', () => {
    expect(calcTimeAtGoal([150, 160, 170], 140, 180)).toBe(100)
  })

  it('returns 0 when no entries are within range', () => {
    expect(calcTimeAtGoal([200, 210, 220], 140, 180)).toBe(0)
  })

  it('returns 50 when half the entries are within range', () => {
    expect(calcTimeAtGoal([150, 200], 140, 180)).toBe(50)
  })

  it('includes boundary values as in-range', () => {
    expect(calcTimeAtGoal([140, 180], 140, 180)).toBe(100)
  })

  it('returns 0 for empty entries array', () => {
    expect(calcTimeAtGoal([], 140, 180)).toBe(0)
  })
})

describe('Renderer — insulin-infusion', () => {
  const defaultData = {
    ratePerHour: 5,
    glucoseEntries: [
      { timestamp: '2024-01-01T08:00', glucose: 150 },
      { timestamp: '2024-01-01T10:00', glucose: 200 },
    ],
    targetLow: 140,
    targetHigh: 180,
    protocolName: 'Test Protocol',
  }
  const defaultConfig = {}
  const noop = () => {}

  it('renders the rate input with current value', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('5')).toBeTruthy()
  })

  it('renders the time-at-goal percentage', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    // 1 of 2 entries in range = 50%
    expect(screen.getByText(/50%/)).toBeTruthy()
  })

  it('renders the citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/ADA Standards of Diabetes Care 2024/)).toBeTruthy()
  })

  it('renders all glucose entries', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('150')).toBeTruthy()
    expect(screen.getByText('200')).toBeTruthy()
  })
})
