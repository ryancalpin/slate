import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AntibioticRenderer } from './Renderer'

const emptyData = { antibiotics: [] }
const sampleData = {
  antibiotics: [
    {
      agent: 'Vancomycin',
      dose: '25 mg/kg',
      route: 'IV',
      startDate: '2026-04-10',
      durationDays: 14,
      renalAdjust: true,
    },
  ],
}

describe('AntibioticRenderer', () => {
  it('renders the table headers', () => {
    render(
      <AntibioticRenderer
        instanceId="test-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('Agent')).toBeTruthy()
    expect(screen.getByText('Dose')).toBeTruthy()
    expect(screen.getByText('Route')).toBeTruthy()
    expect(screen.getByText('Start Date')).toBeTruthy()
    expect(screen.getByText('Duration (d)')).toBeTruthy()
    expect(screen.getByText('Day #')).toBeTruthy()
    expect(screen.getByText('Renal Adj.')).toBeTruthy()
  })

  it('renders existing antibiotic rows', () => {
    render(
      <AntibioticRenderer
        instanceId="test-2"
        config={{}}
        data={sampleData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Vancomycin')).toBeTruthy()
    expect(screen.getByDisplayValue('25 mg/kg')).toBeTruthy()
  })

  it('calls onDataChange when Add Row is clicked', () => {
    const onDataChange = vi.fn()
    render(
      <AntibioticRenderer
        instanceId="test-3"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('+ Add Antibiotic'))
    expect(onDataChange).toHaveBeenCalledOnce()
    const called = onDataChange.mock.calls[0][0]
    expect(called.antibiotics).toHaveLength(1)
  })

  it('auto-calculates day number from start date', () => {
    // Use a fixed start date that is 2 days before today
    const today = new Date()
    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(today.getDate() - 2)
    const startDate = twoDaysAgo.toISOString().split('T')[0]

    render(
      <AntibioticRenderer
        instanceId="test-4"
        config={{}}
        data={{
          antibiotics: [
            {
              agent: 'Piperacillin-Tazobactam',
              dose: '4.5g',
              route: 'IV',
              startDate,
              durationDays: 7,
              renalAdjust: false,
            },
          ],
        }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // Day # should be 3 (today - 2 days ago + 1)
    expect(screen.getByText('3')).toBeTruthy()
  })

  it('shows read-only day number cell, not an input', () => {
    const today = new Date().toISOString().split('T')[0]
    render(
      <AntibioticRenderer
        instanceId="test-5"
        config={{}}
        data={{
          antibiotics: [
            {
              agent: 'Meropenem',
              dose: '1g',
              route: 'IV',
              startDate: today,
              durationDays: 10,
              renalAdjust: false,
            },
          ],
        }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    // Day 1 displayed as text, not an input
    const dayCell = screen.getByText('1')
    expect(dayCell.tagName).not.toBe('INPUT')
  })
})
