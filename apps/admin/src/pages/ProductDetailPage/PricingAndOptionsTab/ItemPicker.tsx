import { useState } from 'react'
import { Search } from 'lucide-react'
import type { OptionItem, OptionsGroup } from '@printforge/ui'

type Props = {
  libraryItems: OptionItem[]
  excludedIds: Set<string>
  groups: OptionsGroup[]
  onSelect: (itemId: string) => void
  onClose: () => void
}

export function ItemPicker({ libraryItems, excludedIds, groups, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')

  const groupById = Object.fromEntries(groups.map((g) => [g.id, g]))

  const filtered = libraryItems.filter((item) => {
    if (excludedIds.has(item.id)) return false
    if (!query) return true
    const q = query.toLowerCase()
    return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
  })

  function handleSelect(itemId: string) {
    onSelect(itemId)
    onClose()
  }

  return (
    <div className="item-picker-panel">
      <div className="input-shell">
        <Search className="input-icon" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      {filtered.length === 0 ? (
        <p className="empty-row muted-copy">No items match.</p>
      ) : (
        <ul className="item-picker-list">
          {filtered.map((item) => {
            const groupName = item.groupId ? (groupById[item.groupId]?.name ?? '') : ''
            return (
              <li key={item.id}>
                <button
                  className="item-picker-entry"
                  type="button"
                  onClick={() => handleSelect(item.id)}
                >
                  <span className="item-picker-entry-name">{item.name}</span>
                  <span className="item-picker-entry-meta">
                    {[groupName, item.slug].filter(Boolean).join(' · ')}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <button className="ghost-button" type="button" onClick={onClose}>
        Cancel
      </button>
    </div>
  )
}
