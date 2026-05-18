import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { OptionItem, OptionsGroup } from '@printforge/ui'

type Props = {
  groups: OptionsGroup[]
  items: OptionItem[]
  selectedGroupId: string | null
  onSelect: (id: string | null) => void
  onCreate: (name: string) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function GroupSidebar({
  groups,
  items,
  selectedGroupId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  function startRename(group: OptionsGroup) {
    setRenamingId(group.id)
    setRenameValue(group.name)
  }

  async function commitRename() {
    if (!renamingId) return
    const name = renameValue.trim()
    if (name) await onRename(renamingId, name)
    setRenamingId(null)
  }

  function cancelRename() {
    setRenamingId(null)
  }

  function startAdding() {
    setIsAdding(true)
    setNewName('')
    setTimeout(() => addInputRef.current?.focus(), 0)
  }

  async function commitAdd() {
    const name = newName.trim()
    if (name) await onCreate(name)
    setIsAdding(false)
    setNewName('')
  }

  function cancelAdd() {
    setIsAdding(false)
    setNewName('')
  }

  const ungroupedCount = items.filter((i) => i.groupId === null).length

  return (
    <aside className="group-sidebar">
      <div className="group-sidebar-section">
        <button
          className={`group-sidebar-entry${selectedGroupId === null ? ' group-sidebar-entry--active' : ''}`}
          type="button"
          onClick={() => onSelect(null)}
        >
          <span className="group-entry-label">All items</span>
          <span className="group-entry-count">{items.length}</span>
        </button>
      </div>

      <div className="group-sidebar-divider" />

      <div className="group-sidebar-section group-sidebar-section--groups">
        {groups.map((group) => (
          <div key={group.id} className="group-sidebar-entry-wrap">
            {renamingId === group.id ? (
              <input
                className="group-inline-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void commitRename()
                  if (e.key === 'Escape') cancelRename()
                }}
                onBlur={() => void commitRename()}
                autoFocus
              />
            ) : (
              <button
                className={`group-sidebar-entry${selectedGroupId === group.id ? ' group-sidebar-entry--active' : ''}`}
                type="button"
                onClick={() => onSelect(group.id)}
              >
                <span className="group-entry-label">{group.name}</span>
                <span className="group-entry-count">
                  {items.filter((i) => i.groupId === group.id).length}
                </span>
                <span className="group-entry-actions">
                  <span
                    role="button"
                    tabIndex={0}
                    className="group-entry-action"
                    title="Rename"
                    onClick={(e) => { e.stopPropagation(); startRename(group) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); startRename(group) } }}
                  >
                    <Pencil size={12} />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    className="group-entry-action group-entry-action--danger"
                    title="Delete group"
                    onClick={(e) => { e.stopPropagation(); void onDelete(group.id) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); void onDelete(group.id) } }}
                  >
                    <Trash2 size={12} />
                  </span>
                </span>
              </button>
            )}
          </div>
        ))}

        {isAdding && (
          <input
            ref={addInputRef}
            className="group-inline-input"
            placeholder="Group name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void commitAdd()
              if (e.key === 'Escape') cancelAdd()
            }}
            onBlur={() => void commitAdd()}
          />
        )}
      </div>

      <div className="group-sidebar-divider" />

      <div className="group-sidebar-section">
        <button
          className={`group-sidebar-entry${selectedGroupId === 'ungrouped' ? ' group-sidebar-entry--active' : ''}`}
          type="button"
          onClick={() => onSelect('ungrouped')}
        >
          <span className="group-entry-label">Ungrouped</span>
          <span className="group-entry-count">{ungroupedCount}</span>
        </button>
      </div>

      <div className="group-sidebar-footer">
        <button className="ghost-button" type="button" onClick={startAdding}>
          <Plus size={14} className="button-icon" aria-hidden="true" />
          New group
        </button>
      </div>
    </aside>
  )
}
