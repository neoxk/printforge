import { useState } from 'react'
import { Search } from 'lucide-react'
import type { OptionItem, OptionsGroup } from '@printforge/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <div className="grid gap-2">
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
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-1">No items match.</p>
      ) : (
        <ul className="list-none m-0 p-0 max-h-[220px] overflow-y-auto border border-border rounded-lg bg-card">
          {filtered.map((item) => {
            const groupName = item.groupId ? (groupById[item.groupId]?.name ?? '') : ''
            return (
              <li key={item.id} className="border-b border-border last:border-b-0">
                <button
                  className="flex flex-col items-start w-full bg-transparent border-0 px-3 py-2 text-left gap-0.5 hover:bg-muted cursor-pointer"
                  type="button"
                  onClick={() => handleSelect(item.id)}
                >
                  <span className="font-semibold text-sm">{item.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {[groupName, item.slug].filter(Boolean).join(' · ')}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <Button variant="ghost" type="button" onClick={onClose} className="self-start">
        Cancel
      </Button>
    </div>
  )
}
