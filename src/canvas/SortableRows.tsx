import { type ReactNode } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableItemProps {
  id: string
  children: ReactNode
  buildMode: boolean
  direction?: 'horizontal' | 'vertical'
}

export function SortableItem({ id, children, buildMode, direction = 'horizontal' }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {buildMode && (
        <div
          {...attributes}
          {...listeners}
          className={`absolute z-10 flex items-center justify-center bg-gray-700/80 rounded opacity-0 group-hover/sortable:opacity-100 transition-opacity cursor-grab active:cursor-grabbing ${
            direction === 'horizontal'
              ? 'inset-y-0 left-0 w-4'
              : 'inset-x-0 top-0 h-4'
          }`}
          title="Drag to reorder"
        >
          <span className="text-gray-300 text-xs select-none">
            {direction === 'horizontal' ? '⋮' : '⋯'}
          </span>
        </div>
      )}
      <div className={buildMode ? (direction === 'horizontal' ? 'pl-4' : 'pt-4') : ''}>
        {children}
      </div>
    </div>
  )
}

interface SortableRowsProps {
  ids: string[]
  onReorder: (ids: string[]) => void
  buildMode: boolean
  direction?: 'horizontal' | 'vertical'
  children: (id: string, index: number) => ReactNode
}

export function SortableRows({ ids, onReorder, buildMode, direction = 'horizontal', children }: SortableRowsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(active.id as string)
      const newIndex = ids.indexOf(over.id as string)
      onReorder(arrayMove(ids, oldIndex, newIndex))
    }
  }

  const strategy = direction === 'horizontal'
    ? horizontalListSortingStrategy
    : verticalListSortingStrategy

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={strategy}>
        <div className={`flex ${direction === 'horizontal' ? 'flex-wrap gap-2' : 'flex-col gap-1'}`}>
          {ids.map((id, index) => (
            <SortableItem key={id} id={id} buildMode={buildMode} direction={direction}>
              {children(id, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
