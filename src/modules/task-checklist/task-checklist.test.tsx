// src/modules/task-checklist/task-checklist.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import taskChecklistPlugin from './index'

const noop = () => {}

describe('task-checklist Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={taskChecklistPlugin.defaultConfig}
        data={{ tasks: [] }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('+ Add Task')).toBeDefined()
  })

  it('renders a task with correct text', () => {
    render(
      <Renderer
        instanceId="test"
        config={taskChecklistPlugin.defaultConfig}
        data={{
          tasks: [{ id: '1', text: 'Order echo', completed: false, role: 'MD', urgent: false }],
        }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Order echo')).toBeDefined()
  })

  it('shows 3 placeholder tasks in build mode', () => {
    render(
      <Renderer
        instanceId="test"
        config={taskChecklistPlugin.defaultConfig}
        data={{ tasks: [] }}
        onDataChange={noop}
        mode="build"
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBe(3)
  })
})

describe('task-checklist PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={taskChecklistPlugin.defaultConfig}
        data={{
          tasks: [
            { id: '1', text: 'Follow up cultures', completed: true, role: 'MD', urgent: true },
          ],
        }}
      />
    )
    expect(screen.getByText(/Follow up cultures/)).toBeDefined()
    expect(screen.getByText(/URGENT/)).toBeDefined()
  })
})
