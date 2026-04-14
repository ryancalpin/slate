import { useState, useCallback } from 'react'
import clsx from 'clsx'
import type { PatientSlot } from '../../core/template/types'

interface PatientSelectorProps {
  slots: PatientSlot[]
  activeSlotId: string | null
  onSelect: (slotId: string) => void
  onAddSlot: (label: string, room: string) => Promise<void>
}

/**
 * Shown in the canvas header during Live Mode for roster templates.
 * Renders a dropdown of patient slots and an "Add Patient" button
 * that opens an inline modal for label + room fields.
 */
export function PatientSelector({
  slots,
  activeSlotId,
  onSelect,
  onAddSlot,
}: PatientSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newRoom, setNewRoom] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = useCallback(async () => {
    if (!newLabel.trim()) return
    setSaving(true)
    try {
      await onAddSlot(newLabel.trim(), newRoom.trim())
      setNewLabel('')
      setNewRoom('')
      setShowAddModal(false)
    } finally {
      setSaving(false)
    }
  }, [newLabel, newRoom, onAddSlot])

  return (
    <div className="relative flex items-center gap-2">
      {/* Slot dropdown */}
      <select
        value={activeSlotId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        className="text-sm rounded bg-gray-800 border border-gray-600 text-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
        aria-label="Select patient slot"
      >
        {slots.map((slot) => (
          <option key={slot.id} value={slot.id}>
            {slot.label || 'Unnamed'}{slot.room ? ` · ${slot.room}` : ''}
          </option>
        ))}
      </select>

      {/* Add Patient button */}
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        title="Add patient slot"
      >
        + Add Patient
      </button>

      {/* Add Patient modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add patient"
          className="absolute top-full right-0 mt-2 z-50 w-64 bg-[rgb(var(--color-surface-raised))] border border-gray-600 rounded-lg shadow-xl p-4 space-y-3"
        >
          <h3 className="text-sm font-semibold text-white">Add Patient</h3>

          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-gray-400">Label (name / initials)</span>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Smith, J"
                className="mt-1 w-full text-sm rounded bg-gray-800 border border-gray-600 text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="text-xs text-gray-400">Room / Bed</span>
              <input
                type="text"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                placeholder="4A"
                className="mt-1 w-full text-sm rounded bg-gray-800 border border-gray-600 text-white px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT"
              />
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs px-3 py-1.5 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newLabel.trim() || saving}
              className={clsx(
                'text-xs px-3 py-1.5 rounded font-medium transition-colors',
                newLabel.trim() && !saving
                  ? 'bg-accent-DEFAULT text-white hover:opacity-90'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed',
              )}
            >
              {saving ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
