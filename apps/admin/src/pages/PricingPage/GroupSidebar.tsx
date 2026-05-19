import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import type { OptionItem, OptionsGroup } from '@printforge/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
    <aside className="flex flex-col bg-card border rounded-xl overflow-hidden">
      <div className="py-2">
        <div className="px-1">
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors hover:bg-accent',
              selectedGroupId === null && 'bg-primary/10 text-primary font-medium'
            )}
            onClick={() => onSelect(null)}
          >
            <span className="flex-1 truncate text-left">All items</span>
            <Badge
              variant="secondary"
              className={cn('ml-auto text-xs min-w-[1.5rem] justify-center rounded-full font-normal', selectedGroupId === null && 'bg-primary/20 text-primary')}
            >
              {items.length}
            </Badge>
          </button>
        </div>
      </div>

      <Separator />

      <div className="py-2 flex-1">
        {groups.map((group) => (
          <div key={group.id} className="group/entry px-1">
            {renamingId === group.id ? (
              <Input
                className="h-7 text-sm my-0.5"
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
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1.5 rounded text-sm transition-colors hover:bg-accent',
                  selectedGroupId === group.id && 'bg-primary/10 text-primary font-medium'
                )}
              >
                <button
                  type="button"
                  className="flex flex-1 items-center gap-1 min-w-0 text-left"
                  onClick={() => onSelect(group.id)}
                >
                  <span className="flex-1 truncate">{group.name}</span>
                  <Badge
                    variant="secondary"
                    className={cn('text-xs min-w-[1.5rem] justify-center rounded-full font-normal', selectedGroupId === group.id && 'bg-primary/20 text-primary')}
                  >
                    {items.filter((i) => i.groupId === group.id).length}
                  </Badge>
                </button>
                <div className="hidden group-hover/entry:flex items-center gap-0.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    type="button"
                    title="Rename"
                    className="h-5 w-5"
                    onClick={() => startRename(group)}
                  >
                    <Pencil size={12} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    type="button"
                    title="Delete group"
                    className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => void onDelete(group.id)}
                  >
                    <Trash2 size={12} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="px-1">
            <Input
              ref={addInputRef}
              className="h-7 text-sm my-0.5"
              placeholder="Group name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void commitAdd()
                if (e.key === 'Escape') cancelAdd()
              }}
              onBlur={() => void commitAdd()}
            />
          </div>
        )}
      </div>

      <Separator />

      <div className="py-2">
        <div className="px-1">
          <button
            type="button"
            className={cn(
              'flex w-full items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors hover:bg-accent',
              selectedGroupId === 'ungrouped' && 'bg-primary/10 text-primary font-medium'
            )}
            onClick={() => onSelect('ungrouped')}
          >
            <span className="flex-1 truncate text-left">Ungrouped</span>
            <Badge
              variant="secondary"
              className={cn('ml-auto text-xs min-w-[1.5rem] justify-center rounded-full font-normal', selectedGroupId === 'ungrouped' && 'bg-primary/20 text-primary')}
            >
              {ungroupedCount}
            </Badge>
          </button>
        </div>
      </div>

      <div className="p-2 border-t">
        <Button variant="ghost" size="sm" type="button" className="w-full justify-start gap-2" onClick={startAdding}>
          <Plus size={14} aria-hidden="true" />
          New group
        </Button>
      </div>
    </aside>
  )
}
