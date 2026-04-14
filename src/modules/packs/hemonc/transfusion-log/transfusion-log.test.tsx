import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransfusionLogRenderer } from './Renderer'

const emptyData = { transfusions: [] }

const sampleData = {
  transfusions: [
    {
      product: 'pRBC',
      date: '2026-04-10',
      time: '10:30',
      units: 2,
      preValue: 7.2,
      postValue: 9.5,
      reaction: false,
      reactionType: '',
    },
    {
      product: 'PLT',
      date: '2026-04-11',
      time: '14:00',
      units: 1,
      preValue: 18,
      postValue: 55,
      reaction: true,
      reactionType: 'febrile non-hemolytic',
    },
  ],
}

const noop = () => {}

describe('TransfusionLogRenderer', () => {
  it('renders product column header', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Product/i)).toBeTruthy()
  })

  it('renders transfusion rows', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('pRBC')).toBeTruthy()
    expect(screen.getByText('PLT')).toBeTruthy()
  })

  it('shows reaction type for reaction rows', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/febrile non-hemolytic/i)).toBeTruthy()
  })

  it('shows Add Row button in build mode', () => {
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByRole('button', { name: /add row/i })).toBeTruthy()
  })

  it('calls onDataChange when row is added', () => {
    const onChange = vi.fn()
    render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={emptyData}
        onDataChange={onChange}
        mode="build"
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /add row/i }))
    expect(onChange).toHaveBeenCalled()
    const newData = onChange.mock.calls[0][0]
    expect(newData.transfusions).toHaveLength(1)
  })

  it('renders reaction rows with red styling indicator', () => {
    const { container } = render(
      <TransfusionLogRenderer
        instanceId="test"
        config={{}}
        data={sampleData}
        onDataChange={noop}
        mode="live"
      />
    )
    // PLT row has a reaction — look for a red-styled row
    const redRows = container.querySelectorAll('tr.bg-red-50')
    expect(redRows.length).toBe(1)
  })
})
