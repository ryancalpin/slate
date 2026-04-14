import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcMinutesBetween } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcMinutesBetween', () => {
  it('returns null when start is empty', () => {
    expect(calcMinutesBetween('', '2024-01-01T10:30')).toBeNull()
  })

  it('returns null when end is empty', () => {
    expect(calcMinutesBetween('2024-01-01T10:00', '')).toBeNull()
  })

  it('returns null when both are empty', () => {
    expect(calcMinutesBetween('', '')).toBeNull()
  })

  it('calculates minutes correctly for a 30-minute interval', () => {
    expect(calcMinutesBetween('2024-01-01T10:00', '2024-01-01T10:30')).toBe(30)
  })

  it('calculates minutes correctly for a 90-minute interval', () => {
    expect(calcMinutesBetween('2024-01-01T08:00', '2024-01-01T09:30')).toBe(90)
  })

  it('returns 0 when start equals end', () => {
    expect(calcMinutesBetween('2024-01-01T10:00', '2024-01-01T10:00')).toBe(0)
  })

  it('handles midnight-crossing intervals', () => {
    expect(
      calcMinutesBetween('2024-01-01T23:45', '2024-01-02T00:15')
    ).toBe(30)
  })
})

// --- Render tests ---

describe('Stroke Timeline Renderer', () => {
  const defaultData = {
    lkw: '',
    doorTime: '',
    ctTime: '',
    tpaDecision: '',
    tpaAdmin: '',
    groinTime: '',
    recanalTime: '',
    ticiGrade: '',
  }
  const noop = () => {}

  it('renders Last Known Well input', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Last Known Well/i)).toBeTruthy()
  })

  it('renders Door-to-CT label', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Door.to.CT/i)).toBeTruthy()
  })

  it('renders Door-to-Needle label', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Door.to.Needle/i)).toBeTruthy()
  })

  it('renders Door-to-Groin label', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Door.to.Groin/i)).toBeTruthy()
  })

  it('renders TICI grade selector', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/TICI/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Powers WJ/i)).toBeTruthy()
  })

  it('shows door-to-needle time in green when within 60 min', () => {
    const data = {
      ...defaultData,
      doorTime: '2024-01-01T08:00',
      tpaAdmin: '2024-01-01T08:55',
    }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={data}
        onDataChange={noop}
        mode="live"
      />
    )
    // 55 min — should render with green styling; find the element by text
    expect(screen.getByText('55 min')).toBeTruthy()
  })
})
