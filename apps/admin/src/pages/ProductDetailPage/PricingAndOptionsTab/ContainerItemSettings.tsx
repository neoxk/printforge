import { useState } from 'react'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem } from '@printforge/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="grid gap-3">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide">Price override</Label>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder={`item default: ${containerItem.item.priceUnit}`}
          value={priceUnit}
          onChange={(e) => setPriceUnit(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide">
          Display name override
        </Label>
        <Input
          type="text"
          placeholder={`item default: ${containerItem.item.name}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" type="button" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}
