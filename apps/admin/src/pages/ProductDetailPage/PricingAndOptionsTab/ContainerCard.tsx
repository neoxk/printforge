import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem, OptionItem, OptionsContainer, OptionsGroup } from '@printforge/ui'
import { ContainerItemRow } from './ContainerItemRow'
import { ItemPicker } from './ItemPicker'

type Props = {
  container: OptionsContainer
  containerItems: ContainerOptionItem[]
  position: number
  total: number
  libraryItems: OptionItem[]
  groups: OptionsGroup[]
  onDelete: () => void
  onSetDefault: (itemId: string | null) => void
  onAddItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onPatchItem: (itemId: string, payload: ContainerItemPatchPayload) => void
}

export function ContainerCard({
  container,
  containerItems,
  position,
  total,
  libraryItems,
  groups,
  onDelete,
  onSetDefault,
  onAddItem,
  onRemoveItem,
  onPatchItem,
}: Props) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const defaultItemName = container.defaultItem?.name ?? 'none'
  const excludedIds = new Set(containerItems.map((i) => i.itemId))

  return (
    <div className="container-card">
      <div className="container-card-header">
        <span className="drag-handle" aria-hidden="true">⠿</span>
        <span className="container-card-name">{container.name}</span>
        <span className="container-pos-badge">
          container {position} of {total}
        </span>
        <span className="container-card-meta">
          {containerItems.length} items · default: {defaultItemName}
        </span>
        <button className="icon-button-sm danger" type="button" title="Delete container" onClick={onDelete}>
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {containerItems.length > 0 && (
        <div className="container-col-headers">
          <span />
          <span>item</span>
          <span>basis</span>
          <span>price</span>
          <span>display</span>
          <span />
          <span />
        </div>
      )}

      <div>
        {containerItems.map((ci) => (
          <ContainerItemRow
            key={ci.itemId}
            containerItem={ci}
            isDefault={ci.itemId === container.defaultItemId}
            groups={groups}
            onRemove={() => onRemoveItem(ci.itemId)}
            onPatch={(payload) => onPatchItem(ci.itemId, payload)}
            onSetDefault={() =>
              onSetDefault(ci.itemId === container.defaultItemId ? null : ci.itemId)
            }
          />
        ))}
      </div>

      <div className="container-footer">
        {isPickerOpen ? (
          <ItemPicker
            libraryItems={libraryItems}
            excludedIds={excludedIds}
            groups={groups}
            onSelect={onAddItem}
            onClose={() => setIsPickerOpen(false)}
          />
        ) : (
          <button
            className="add-item-button"
            type="button"
            onClick={() => setIsPickerOpen(true)}
          >
            <Plus size={14} aria-hidden="true" />
            add item from library
          </button>
        )}
      </div>
    </div>
  )
}
