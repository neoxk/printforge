import { Plus, X } from 'lucide-react'
import { type ComponentProps, type KeyboardEvent, type Ref, forwardRef, useRef, useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable, isSortable } from '@dnd-kit/react/sortable'
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom'
import type { ContainerItemPatchPayload, ContainerPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem, OptionItem, OptionsContainer, OptionsGroup } from '@printforge/ui'
import { CONTAINER_TYPE_OPTIONS } from '../../../lib/options-meta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ContainerItemRow } from './ContainerItemRow'
import { ItemPicker } from './ItemPicker'

type SortableContainerItemRowProps = ComponentProps<typeof ContainerItemRow> & { index: number }

function SortableContainerItemRow({ index, ...props }: SortableContainerItemRowProps) {
  const { ref, handleRef } = useSortable({ id: props.containerItem.itemId, index })
  return <ContainerItemRow ref={ref} handleRef={handleRef} {...props} />
}

type Props = {
  container: OptionsContainer
  containerItems: ContainerOptionItem[]
  libraryItems: OptionItem[]
  groups: OptionsGroup[]
  onDelete: () => void
  onSetDefault: (itemId: string | null) => void
  onAddItem: (itemId: string) => void
  onRemoveItem: (itemId: string) => void
  onPatchItem: (itemId: string, payload: ContainerItemPatchPayload) => void
  onReorderItems: (newOrder: ContainerOptionItem[]) => void
  onPatchContainer: (payload: ContainerPatchPayload) => void
  handleRef?: Ref<HTMLElement>
}

export const ContainerCard = forwardRef<HTMLDivElement, Props>(function ContainerCard({
  container,
  containerItems,
  libraryItems,
  groups,
  onDelete,
  onSetDefault,
  onAddItem,
  onRemoveItem,
  onPatchItem,
  onReorderItems,
  onPatchContainer,
  handleRef,
}, ref) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState(container.name)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const defaultItemName = container.defaultItem?.name ?? 'none'
  const excludedIds = new Set(containerItems.map((i) => i.itemId))

  function commitName() {
    const trimmed = nameValue.trim()
    if (trimmed && trimmed !== container.name) {
      onPatchContainer({ name: trimmed })
    } else {
      setNameValue(container.name)
    }
    setIsEditingName(false)
  }

  function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitName()
    if (e.key === 'Escape') {
      setNameValue(container.name)
      setIsEditingName(false)
    }
  }

  return (
    <div ref={ref} className="border border-dashed border-border rounded-xl bg-muted/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-card border-b border-dashed border-border">
        <span ref={handleRef as Ref<HTMLSpanElement>} className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab select-none text-base" aria-hidden="true">
          ⠿
        </span>

        {isEditingName ? (
          <Input
            ref={nameInputRef}
            className="h-7 py-0 px-1.5 text-sm italic font-bold w-48"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
        ) : (
          <span
            className="italic font-bold text-base cursor-text hover:bg-muted/60 rounded px-1 -mx-1 transition-colors"
            title="Double-click to rename"
            onDoubleClick={() => {
              setNameValue(container.name)
              setIsEditingName(true)
            }}
          >
            {container.name}
          </span>
        )}

        <Select
          value={container.containerType}
          onValueChange={(v) => onPatchContainer({ containerType: v as OptionsContainer['containerType'] })}
        >
          <SelectTrigger className="h-6 px-2 text-xs w-auto gap-1 border-dashed font-normal text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTAINER_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
          <DragDropProvider
            sensors={[PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 8 })] })]}
            onDragEnd={(event) => {
              if (event.canceled) return
              const { source } = event.operation
              if (!isSortable(source)) return
              const { initialIndex, index } = source
              if (initialIndex === index) return
              const newOrder = [...containerItems]
              const [moved] = newOrder.splice(initialIndex, 1)
              newOrder.splice(index, 0, moved)
              onReorderItems(newOrder)
            }}
          >
            {containerItems.map((ci, idx) => (
              <SortableContainerItemRow
                key={ci.itemId}
                index={idx}
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
          </DragDropProvider>
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
          <PopoverContent align="start" className="w-[50vw] min-w-[400px] p-0 overflow-hidden">
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
})
