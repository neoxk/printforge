import { useState } from 'react'
import { Search } from 'lucide-react'
import type { OptionItem, OptionsGroup } from '@printforge/ui'
import { Input } from '@printforge/ui/components/ui/input'
import { Badge } from '@printforge/ui/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = {
  libraryItems: OptionItem[]
  excludedIds: Set<string>
  groups: OptionsGroup[]
  onSelect: (itemId: string) => void
  onClose: () => void
}

export function ItemPicker({ libraryItems, excludedIds, groups, onSelect, onClose }: Readonly<Props>) {
  const [query, setQuery] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const availableItems = libraryItems.filter((item) => !excludedIds.has(item.id))

  const filteredItems = availableItems.filter((item) => {
    let matchesGroup = true

    if (selectedGroupId === 'ungrouped') {
      matchesGroup = item.groupId === null
    } else if (selectedGroupId !== null) {
      matchesGroup = item.groupId === selectedGroupId
    }

    if (!matchesGroup) return false
    if (!query) return true
    const q = query.toLowerCase()
    return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
  })

  function handleSelect(itemId: string) {
    onSelect(itemId)
    onClose()
  }

  const ungroupedCount = availableItems.filter((i) => i.groupId === null).length

  return (
    <div className="flex h-90 overflow-hidden">
      <div className="w-44 shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="py-1 flex-1 overflow-y-auto">
          <div className="px-1">
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors hover:bg-accent',
                selectedGroupId === null && 'bg-primary/10 text-primary font-medium'
              )}
              onClick={() => setSelectedGroupId(null)}
            >
              <span className="flex-1 truncate text-left">All items</span>
              <Badge
                variant="secondary"
                className={cn('ml-auto text-xs min-w-6 justify-center rounded-full font-normal', selectedGroupId === null && 'bg-primary/20 text-primary')}
              >
                {availableItems.length}
              </Badge>
            </button>
          </div>

          {groups.map((group) => (
            <div key={group.id} className="px-1">
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors hover:bg-accent',
                  selectedGroupId === group.id && 'bg-primary/10 text-primary font-medium'
                )}
                onClick={() => setSelectedGroupId(group.id)}
              >
                <span className="flex-1 truncate text-left">{group.name}</span>
                <Badge
                  variant="secondary"
                  className={cn('ml-auto text-xs min-w-6 justify-center rounded-full font-normal', selectedGroupId === group.id && 'bg-primary/20 text-primary')}
                >
                  {availableItems.filter((i) => i.groupId === group.id).length}
                </Badge>
              </button>
            </div>
          ))}

          {ungroupedCount > 0 && (
            <div className="px-1">
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-1 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors hover:bg-accent',
                  selectedGroupId === 'ungrouped' && 'bg-primary/10 text-primary font-medium'
                )}
                onClick={() => setSelectedGroupId('ungrouped')}
              >
                <span className="flex-1 truncate text-left">Ungrouped</span>
                <Badge
                  variant="secondary"
                  className={cn('ml-auto text-xs min-w-6 justify-center rounded-full font-normal', selectedGroupId === 'ungrouped' && 'bg-primary/20 text-primary')}
                >
                  {ungroupedCount}
                </Badge>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8"
              type="text"
              placeholder="Search items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <p className="text-sm text-muted-foreground p-3">No items match.</p>
          ) : (
            <ul className="list-none m-0 p-0">
              {filteredItems.map((item) => (
                <li key={item.id} className="border-b border-border last:border-b-0">
                  <button
                    className="flex flex-col items-start w-full bg-transparent border-0 px-3 py-2 text-left gap-0.5 hover:bg-muted cursor-pointer"
                    type="button"
                    onClick={() => handleSelect(item.id)}
                  >
                    <span className="font-semibold text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.slug}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
