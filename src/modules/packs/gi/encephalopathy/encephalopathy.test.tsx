import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EncephalopathyRenderer } from './Renderer'

const defaultData = {
  westHavenGrade: 0,
  laxuloseLog: [],
  rifaximin: false,
  rifaximinDose: '',
  stoolsPerDay: 0,
}

describe('EncephalopathyRenderer', () => {
  it('renders West Haven grade label', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/West Haven/i)).toBeTruthy()
  })

  it('renders all five grade options (0 through IV)', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Grade 0/i)).toBeTruthy()
    expect(screen.getByText(/Grade I/i)).toBeTruthy()
    expect(screen.getByText(/Grade II/i)).toBeTruthy()
    expect(screen.getByText(/Grade III/i)).toBeTruthy()
    expect(screen.getByText(/Grade IV/i)).toBeTruthy()
  })

  it('displays criteria text for selected grade', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-3"
        config={{}}
        data={{ ...defaultData, westHavenGrade: 0 }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Normal/i)).toBeTruthy()
  })

  it('displays Grade II criteria when grade is 2', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-4"
        config={{}}
        data={{ ...defaultData, westHavenGrade: 2 }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Lethargy|apathy/i)).toBeTruthy()
  })

  it('renders lactulose log section', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Lactulose/i)).toBeTruthy()
    expect(screen.getByText(/Add Entry/i)).toBeTruthy()
  })

  it('renders rifaximin toggle', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Rifaximin/i)).toBeTruthy()
  })

  it('shows rifaximin dose input when rifaximin is true', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-7"
        config={{}}
        data={{ ...defaultData, rifaximin: true }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Rifaximin dose/i)).toBeTruthy()
  })

  it('renders stools per day input', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-8"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/Stools per day/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <EncephalopathyRenderer
        instanceId="test-9"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Conn HO/i)).toBeTruthy()
  })

  it('calls onDataChange when grade changes', () => {
    const onDataChange = vi.fn()
    render(
      <EncephalopathyRenderer
        instanceId="test-10"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } })
    expect(onDataChange).toHaveBeenCalledWith(expect.objectContaining({ westHavenGrade: 2 }))
  })
})
