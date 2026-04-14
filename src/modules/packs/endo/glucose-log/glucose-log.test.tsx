import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcTIR, calcEA1c } from './index'
import Renderer from './Renderer'

describe('calcTIR', () => {
  it('returns 100 when all entries are in range', () => {
    expect(calcTIR([80, 100, 150], 70, 180)).toBe(100)
  })

  it('returns 0 when no entries are in range', () => {
    expect(calcTIR([50, 200, 300], 70, 180)).toBe(0)
  })

  it('returns 50 for half in range', () => {
    expect(calcTIR([100, 250], 70, 180)).toBe(50)
  })

  it('includes boundary values', () => {
    expect(calcTIR([70, 180], 70, 180)).toBe(100)
  })

  it('returns 0 for empty array', () => {
    expect(calcTIR([], 70, 180)).toBe(0)
  })
})

describe('calcEA1c', () => {
  it('returns correct value for avg glucose 154 (expected ~7.0)', () => {
    // (154 + 46.7) / 28.7 = 200.7 / 28.7 ≈ 6.99 → 7.0
    expect(calcEA1c(154)).toBe(7.0)
  })

  it('returns correct value for avg glucose 126 (expected ~6.0)', () => {
    // (126 + 46.7) / 28.7 = 172.7 / 28.7 ≈ 6.02 → 6.0
    expect(calcEA1c(126)).toBe(6.0)
  })

  it('returns a number rounded to 1 decimal', () => {
    const result = calcEA1c(200)
    expect(result).toBe(Math.round(result * 10) / 10)
  })
})

describe('Renderer — glucose-log', () => {
  const defaultData = {
    entries: [
      { timestamp: '2024-01-01T08:00', glucose: 100 },
      { timestamp: '2024-01-01T12:00', glucose: 250 },
    ],
    targetLow: 70,
    targetHigh: 180,
  }
  const noop = () => {}

  it('renders TIR percentage', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // 1 of 2 entries in range = 50%
    expect(screen.getByText(/50%/)).toBeTruthy()
  })

  it('renders eA1c', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // avg = (100+250)/2 = 175 → (175+46.7)/28.7 ≈ 7.7
    expect(screen.getByText(/eA1c/)).toBeTruthy()
  })

  it('renders both TIR and eA1c citations', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText(/Battelino/)).toBeTruthy()
    expect(screen.getByText(/Nathan/)).toBeTruthy()
  })

  it('renders glucose entries in table', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText('100')).toBeTruthy()
    expect(screen.getByText('250')).toBeTruthy()
  })
})
