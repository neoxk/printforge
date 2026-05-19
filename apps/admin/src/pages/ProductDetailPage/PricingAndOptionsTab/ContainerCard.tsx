import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem, OptionItem, OptionsContainer, OptionsGroup } from '@printforge/ui'
import { CONTAINER_TYPE_LABEL } from '../../../lib/options-meta'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
    <div className="border border-dashed border-border rounded-xl bg-muted/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-card border-b border-dashed border-border">
        <span className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab select-none text-base" aria-hidden="true">
          ⠿
        </span>
        <span className="italic font-bold text-base">{container.name}</span>
        <Badge variant="outline">{CONTAINER_TYPE_LABEL[container.containerType]}</Badge>
        {container.isHidden && <Badge variant="secondary">Hidden</Badge>}
        {container.isRequired && <Badge variant="secondary">Required</Badge>}
        <Badge variant="outline" className="text-[11px] text-muted-foreground font-normal">
          {position} of {total}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
          {containerItems.length} items · default: {defaultItemName}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          title="Delete container"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <X size={14} aria-hidden="true" />
        </Button>
      </div>

      <Table>
        {containerItems.length > 0 && (
          <TableHeader className="bg-muted/40 [&_tr]:border-border/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 pr-1 w-6" />
              <TableHead className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">item</TableHead>
              <TableHead className="px-1 w-[100px] text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">basis</TableHead>
              <TableHead className="px-1 min-w-[100px] text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">price</TableHead>
              <TableHead className="px-1 w-7" />
              <TableHead className="pl-1 pr-4 w-7" />
            </TableRow>
          </TableHeader>
        )}
        <TableBody className="[&_tr]:border-border/60">
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
        </TableBody>
      </Table>

      <div className="px-4 py-2.5 bg-muted/20">
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="border-dashed text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Plus size={14} aria-hidden="true" />
              add item from library
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-3">
            <ItemPicker
              libraryItems={libraryItems}
              excludedIds={excludedIds}
              groups={groups}
              onSelect={onAddItem}
              onClose={() => setIsPickerOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
