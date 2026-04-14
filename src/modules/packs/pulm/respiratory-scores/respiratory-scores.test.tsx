import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcCURB65 } from './index'
import { Renderer } from './Renderer'

describe('calcCURB65', () => {
  it('score 0 for no items', () => {
    expect(calcCURB65([false, false, false, false, false])).toBe(0)
  })

  it('score 5 for all items', () => {
    expect(calcCURB65([true, true, true, true, true])).toBe(5)
  })

  it('score 2 for two items', () => {
    expect(calcCURB65([true, false, true, false, false])).toBe(2)
  })
})

describe('respiratory-scores Renderer', () => {
  const defaultData = {
    curb65: [false, false, false, false, false],
    berlinOnset: false,
    berlinRadio: false,
    berlinNotCardiac: false,
    pf: 250,
    peep: 5,
  }

  it('renders CURB-65 heading', () => {
    render(
      <Renderer
        instanceId="rs-1"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/CURB-65/i)).toBeDefined()
  })

  it('renders Berlin ARDS heading', () => {
    render(
      <Renderer
        instanceId="rs-2"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Berlin/i)).toBeDefined()
  })

  it('shows low risk for CURB-65 score 0', () => {
    render(
      <Renderer
        instanceId="rs-3"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/low/i)).toBeDefined()
  })

  it('shows severe risk for CURB-65 score ≥3', () => {
    render(
      <Renderer
        instanceId="rs-4"
        config={{}}
        data={{ ...defaultData, curb65: [true, true, true, false, false] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/severe/i)).toBeDefined()
  })

  it('shows Berlin mild ARDS when all criteria met and PF 200-300', () => {
    render(
      <Renderer
        instanceId="rs-5"
        config={{}}
        data={{
          ...defaultData,
          berlinOnset: true,
          berlinRadio: true,
          berlinNotCardiac: true,
          pf: 250,
          peep: 5,
        }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/mild/i)).toBeDefined()
  })

  it('shows Berlin severe ARDS when PF < 100', () => {
    render(
      <Renderer
        instanceId="rs-6"
        config={{}}
        data={{
          ...defaultData,
          berlinOnset: true,
          berlinRadio: true,
          berlinNotCardiac: true,
          pf: 80,
          peep: 5,
        }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/severe/i)).toBeDefined()
  })

  it('displays CURB-65 citation', () => {
    render(
      <Renderer
        instanceId="rs-7"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Lim WS/i)).toBeDefined()
  })

  it('displays Berlin citation', () => {
    render(
      <Renderer
        instanceId="rs-8"
        config={{}}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ARDS Definition Task Force/i)).toBeDefined()
  })
})
