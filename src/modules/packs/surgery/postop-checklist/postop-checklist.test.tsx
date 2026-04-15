import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DEFAULT_MILESTONES } from './index'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'

const makeMilestones = (overrides: Partial<typeof DEFAULT_MILESTONES[0]>[] = []) =>
  DEFAULT_MILESTONES.map((m, i) => ({ ...m, ...(overrides[i] ?? {}) }))

describe('DEFAULT_MILESTONES', () => {
  it('has 9 default milestones', () => {
    expect(DEFAULT_MILESTONES).toHaveLength(9)
  })

  it('first milestone is Ambulation', () => {
    expect(DEFAULT_MILESTONES[0].label).toMatch(/ambulation/i)
  })
})

describe('Renderer', () => {
  it('renders all milestone labels', () => {
    const data = { milestones: makeMilestones() }
    render(
      <Renderer
        instanceId="poc-1"
        config={{}}
        data={data}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/ambulation/i)).toBeTruthy()
    expect(screen.getByText(/foley/i)).toBeTruthy()
    expect(screen.getByText(/discharge criteria/i)).toBeTruthy()
  })

  it('shows progress as "X of Y complete"', () => {
    const milestones = makeMilestones()
    milestones[0].completed = true
    milestones[0].completedAt = '2026-04-13T10:00:00Z'
    render(
      <Renderer
        instanceId="poc-2"
        config={{}}
        data={{ milestones }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/1 of 9/i)).toBeTruthy()
  })

  it('calls onDataChange when a milestone is checked', () => {
    const onChange = vi.fn()
    const data = { milestones: makeMilestones() }
    render(
      <Renderer
        instanceId="poc-3"
        config={{}}
        data={data}
        onDataChange={onChange}
        mode="live"
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    expect(onChange).toHaveBeenCalled()
    const call = onChange.mock.calls[0][0] as { milestones: typeof DEFAULT_MILESTONES }
    expect(call.milestones[0].completed).toBe(true)
    expect(call.milestones[0].completedAt).not.toBe('')
  })

  it('shows Add Milestone button', () => {
    render(
      <Renderer
        instanceId="poc-4"
        config={{}}
        data={{ milestones: [] }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/add milestone/i)).toBeTruthy()
  })
})

describe('PrintView', () => {
  it('renders milestones in print view', () => {
    render(<PrintView config={{}} data={{ milestones: makeMilestones() }} />)
    expect(screen.getByText(/ambulation/i)).toBeTruthy()
  })
})
