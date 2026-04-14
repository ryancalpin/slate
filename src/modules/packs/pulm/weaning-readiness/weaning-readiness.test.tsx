import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcRSBI } from './index'
import { Renderer } from './Renderer'

describe('calcRSBI', () => {
  it('divides RR by TV in liters', () => {
    // RSBI = RR / (TV_mL / 1000)
    expect(calcRSBI(20, 500)).toBe(40)       // 20 / 0.5 = 40
    expect(calcRSBI(30, 300)).toBeCloseTo(100) // 30 / 0.3 = 100
  })

  it('RSBI < 105 is favorable for extubation', () => {
    expect(calcRSBI(20, 500)).toBeLessThan(105)
  })

  it('RSBI >= 105 is unfavorable', () => {
    expect(calcRSBI(30, 200)).toBeGreaterThanOrEqual(105)
  })
})

describe('weaning-readiness Renderer', () => {
  const defaultData = {
    weanChecklist: {},
    rsbiRR: 18,
    rsbiTV: 450,
    sbtLog: [],
  }

  it('renders wean readiness checklist', () => {
    render(
      <Renderer
        instanceId="wr-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/FiO₂/i)).toBeDefined()
  })

  it('shows RSBI value', () => {
    render(
      <Renderer
        instanceId="wr-2"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // RSBI = 18 / (450/1000) = 40
    expect(screen.getByText('40.0')).toBeDefined()
  })

  it('shows favorable message when RSBI < 105', () => {
    render(
      <Renderer
        instanceId="wr-3"
        config={{}}
        data={{ ...defaultData, rsbiRR: 18, rsbiTV: 450 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/favorable/i)).toBeDefined()
  })

  it('shows unfavorable message when RSBI >= 105', () => {
    render(
      <Renderer
        instanceId="wr-4"
        config={{}}
        data={{ ...defaultData, rsbiRR: 30, rsbiTV: 200 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/unfavorable/i)).toBeDefined()
  })

  it('renders SBT log table', () => {
    const sbtLog = [
      { date: '2026-04-13', duration: 30, outcome: 'pass' as const, reason: '' },
    ]
    render(
      <Renderer
        instanceId="wr-5"
        config={{}}
        data={{ ...defaultData, sbtLog }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText('2026-04-13')).toBeDefined()
    expect(screen.getByText(/pass/i)).toBeDefined()
  })

  it('displays Yang & Tobin citation', () => {
    render(
      <Renderer
        instanceId="wr-6"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Yang KL/i)).toBeDefined()
  })
})
