import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChemoRegimenRenderer } from './Renderer'

const emptyData = {
  regimenName: '',
  cycleNum: 1,
  dayNum: 1,
  agents: [],
  nadirDate: '',
  nextCycleDate: '',
}

const sampleData = {
  regimenName: 'CHOP',
  cycleNum: 2,
  dayNum: 1,
  agents: [
    { drug: 'Cyclophosphamide', doseMgM2: 750, route: 'IV' },
    { drug: 'Vincristine', doseMgM2: 1.4, route: 'IV' },
  ],
  nadirDate: '2026-04-20',
  nextCycleDate: '2026-05-01',
}

const noop = () => {}

describe('ChemoRegimenRenderer', () => {
  it('renders regimen name', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('CHOP')).toBeTruthy()
  })

  it('renders cycle and day numbers', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Cycle 2/i)).toBeTruthy()
    expect(screen.getByText(/Day 1/i)).toBeTruthy()
  })

  it('renders agent rows', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Cyclophosphamide')).toBeTruthy()
    expect(screen.getByText('Vincristine')).toBeTruthy()
  })

  it('shows nadir date and next cycle date', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/2026-04-20/)).toBeTruthy()
    expect(screen.getByText(/2026-05-01/)).toBeTruthy()
  })

  it('shows Add Agent button in build mode', () => {
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByRole('button', { name: /add agent/i })).toBeTruthy()
  })

  it('calls onDataChange when agent is added', () => {
    const onChange = vi.fn()
    render(
      <ChemoRegimenRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={onChange}
        mode="build"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /add agent/i }))
    expect(onChange).toHaveBeenCalled()
    const newData = onChange.mock.calls[0][0]
    expect(newData.agents).toHaveLength(1)
  })
})
