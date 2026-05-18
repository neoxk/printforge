import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { OptionItem, OptionsGroup } from '@printforge/ui'
import { BASIS_LABEL, DISPLAY_LABEL } from '../../lib/options-meta'

type Props = {
  items: OptionItem[]
  groups: OptionsGroup[]
  isLoading: boolean
  selectedGroupId: string | null
  onEdit: (item: OptionItem | null) => void
  onDelete: (id: string) => Promise<void>
}

export function ItemTable({ items, groups, isLoading, selectedGroupId, onEdit, onDelete }: Props) {
  function groupName(groupId: string | null) {
    if (!groupId) return null
    return groups.find((g) => g.id === groupId)?.name ?? null
  }

  const showGroupColumn = selectedGroupId === null

  return (
    <div className="item-library-table">
      <div className="item-library-toolbar">
        <button className="ghost-button" type="button" onClick={() => onEdit(null)}>
          <Plus size={14} className="button-icon" aria-hidden="true" />
          New item
        </button>
      </div>
      <div className={`item-library-row item-library-row--header${showGroupColumn ? ' item-library-row--with-group' : ''}`}>
        <span>Name</span>
        <span>Basis</span>
        <span>Price</span>
        <span>Display</span>
        {showGroupColumn && <span>Group</span>}
        <span />
      </div>

      {isLoading ? (
        <p className="empty-row muted-copy">Loading…</p>
      ) : items.length === 0 ? (
        <p className="empty-row muted-copy">No items here yet.</p>
      ) : (
        <div className="item-library-rows">
          {items.map((item) => (
            <div
              key={item.id}
              className={`item-library-row${showGroupColumn ? ' item-library-row--with-group' : ''}`}
            >
              <div className="item-row-name">
                <span>{item.name}</span>
                <span className="item-row-slug">{item.slug}</span>
              </div>
              <span className="item-basis-badge">{BASIS_LABEL[item.calculationBasis]}</span>
              <span className="item-row-price">€ {Number(item.priceUnit).toFixed(2)}</span>
              <span className="item-row-display">{DISPLAY_LABEL[item.displayMode]}</span>
              {showGroupColumn && (
                <span className="item-row-group muted-copy">
                  {groupName(item.groupId) ?? '—'}
                </span>
              )}
              <div className="item-row-actions">
                <button
                  className="icon-button-sm"
                  type="button"
                  title="Edit item"
                  onClick={() => onEdit(item)}
                >
                  <Pencil size={14} aria-hidden="true" />
                </button>
                <button
                  className="icon-button-sm danger"
                  type="button"
                  title="Delete item"
                  onClick={() => void onDelete(item.id)}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
