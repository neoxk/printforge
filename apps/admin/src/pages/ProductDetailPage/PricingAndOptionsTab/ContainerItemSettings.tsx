import { useState } from 'react'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem, DisplayMode } from '@printforge/ui'

type Props = {
  containerItem: ContainerOptionItem
  onPatch: (payload: ContainerItemPatchPayload) => void
  onClose: () => void
}

const DISPLAY_OPTIONS: { value: DisplayMode | ''; label: string }[] = [
  { value: '', label: '— item default —' },
  { value: 'SELECTABLE', label: 'Selectable' },
  { value: 'REQUIRED', label: 'Required' },
  { value: 'HIDDEN', label: 'Hidden' },
]

export function ContainerItemSettings({ containerItem, onPatch, onClose }: Props) {
  const [priceUnit, setPriceUnit] = useState(
    containerItem.priceUnit !== null ? String(containerItem.priceUnit) : '',
  )
  const [displayMode, setDisplayMode] = useState<DisplayMode | ''>(
    containerItem.displayMode ?? '',
  )

  function handleApply() {
    const payload: ContainerItemPatchPayload = {}
    const parsedPrice = parseFloat(priceUnit)

    if (priceUnit === '') {
      payload.priceUnit = null
    } else if (!isNaN(parsedPrice)) {
      payload.priceUnit = parsedPrice
    }

    payload.displayMode = displayMode === '' ? null : displayMode

    onPatch(payload)
    onClose()
  }

  return (
    <div className="slot-settings-panel">
      <label>
        <span>Price override</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder={`item default: ${containerItem.item.priceUnit}`}
          value={priceUnit}
          onChange={(e) => setPriceUnit(e.target.value)}
        />
      </label>
      <label>
        <span>Display mode override</span>
        <select value={displayMode} onChange={(e) => setDisplayMode(e.target.value as DisplayMode | '')}>
          {DISPLAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <div className="slot-settings-actions">
        <button className="ghost-button" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="primary-button" type="button" onClick={handleApply}>
          Apply
        </button>
      </div>
    </div>
  )
}
