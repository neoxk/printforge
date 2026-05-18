import { useState } from 'react'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem } from '@printforge/ui'

type Props = {
  containerItem: ContainerOptionItem
  onPatch: (payload: ContainerItemPatchPayload) => void
  onClose: () => void
}

export function ContainerItemSettings({ containerItem, onPatch, onClose }: Props) {
  const [priceUnit, setPriceUnit] = useState(
    containerItem.priceUnit !== null ? String(containerItem.priceUnit) : '',
  )
  const [name, setName] = useState(containerItem.name ?? '')

  function handleApply() {
    const payload: ContainerItemPatchPayload = {}
    const parsedPrice = parseFloat(priceUnit)

    if (priceUnit === '') {
      payload.priceUnit = null
    } else if (!isNaN(parsedPrice)) {
      payload.priceUnit = parsedPrice
    }

    payload.name = name.trim() || null

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
        <span>Display name override</span>
        <input
          type="text"
          placeholder={`item default: ${containerItem.item.name}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
