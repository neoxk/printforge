import { ExternalLink, X } from 'lucide-react'
import { type KeyboardEvent, type ReactNode, type Ref, forwardRef, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem, OptionsGroup } from '@printforge/ui'
import { CalcBasis } from '@printforge/ui'
import { BASIS_UNIT } from '../../../lib/options-meta'
import { Button } from '@printforge/ui/components/ui/button'
import { Badge } from '@printforge/ui/components/ui/badge'
import { Input } from '@printforge/ui/components/ui/input'
import { TableCell, TableRow } from '@printforge/ui/components/ui/table'

type EditingField = 'name' | 'price' | null

type Props = {
  containerItem: ContainerOptionItem
  isDefault: boolean
  groups: OptionsGroup[]
  onRemove: () => void
  onPatch: (payload: ContainerItemPatchPayload) => void
  onSetDefault: () => void
  handleRef?: Ref<HTMLElement>
}

export const ContainerItemRow = forwardRef<HTMLTableRowElement, Props>(function ContainerItemRow({
  containerItem,
  isDefault,
  groups,
  onRemove,
  onPatch,
  onSetDefault,
  handleRef,
}, ref) {
  const navigate = useNavigate()
  const [editingField, setEditingField] = useState<EditingField>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { item } = containerItem
  const effectivePriceUnit = containerItem.priceUnit ?? item.priceUnit
  const isPriceOverridden = containerItem.priceUnit !== null
  const isNameOverridden = containerItem.name !== null
  const canOverridePrice = item.calculationBasis !== CalcBasis.FREE

  const groupName = item.groupId ? (groups.find((g) => g.id === item.groupId)?.name ?? '') : ''
  const subtitleParts = [
    groupName.toLowerCase(),
    item.slug,
    item.lengthMm && item.widthMm ? `${item.lengthMm} × ${item.widthMm} mm` : null,
  ].filter(Boolean)

  const unit = BASIS_UNIT[item.calculationBasis] ?? ''

  function startEdit(field: EditingField) {
    if (field === 'name') {
      setEditValue(containerItem.name ?? '')
    } else if (field === 'price') {
      setEditValue(containerItem.priceUnit === null ? '' : String(containerItem.priceUnit))
    }
    setEditingField(field)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commitEdit() {
    if (editingField === 'name') {
      onPatch({ name: editValue.trim() || null })
    } else if (editingField === 'price') {
      const parsed = Number.parseFloat(editValue)
      let priceUnit: number | null = null

      if (editValue !== '' && !Number.isNaN(parsed)) {
        priceUnit = parsed
      }

      onPatch({ priceUnit })
    }
    setEditingField(null)
  }

  function cancelEdit() {
    setEditingField(null)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') cancelEdit()
  }

  let priceContent: ReactNode
  if (editingField === 'price') {
    priceContent = (
      <Input
        ref={inputRef}
        type="number"
        min="0"
        step="0.01"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={handleKeyDown}
        placeholder={`default: ${item.priceUnit}`}
        className="h-6 text-sm py-0 px-1.5 w-24"
        autoFocus
      />
    )
  } else if (!canOverridePrice) {
    priceContent = <span className="text-muted-foreground">— always 0</span>
  } else if (isPriceOverridden) {
    priceContent = (
      <div className="flex flex-col gap-0.5">
        <s className="text-muted-foreground text-xs">
          € {Number(item.priceUnit).toFixed(2)} {unit}
        </s>
        <span className="text-destructive text-xs">
          € {Number(effectivePriceUnit).toFixed(2)} {unit}
        </span>
        <span className="text-[10px] text-muted-foreground">overridden here</span>
      </div>
    )
  } else {
    priceContent = `€ ${Number(effectivePriceUnit).toFixed(2)} ${unit}`
  }

  return (
    <TableRow ref={ref} className="bg-card hover:bg-muted/30">
        <TableCell className="pl-4 pr-1 py-1.5 w-6">
          <span ref={handleRef} className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab select-none text-base flex items-center justify-center" aria-hidden="true">
            ⠿
          </span>
        </TableCell>

        <TableCell
          className="px-1 py-1.5 cursor-text"
          onDoubleClick={() => startEdit('name')}
          title="Double-click to override name"
        >
          {editingField === 'name' ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
              placeholder={`default: ${item.name}`}
              className="h-6 text-sm py-0 px-1.5"
              autoFocus
            />
          ) : (
            <>
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                {isNameOverridden ? (
                  <>
                    <span>{containerItem.name}</span>
                    <Badge variant="outline" className="text-[10px]" title={`Library name: ${item.name}`}>
                      renamed
                    </Badge>
                  </>
                ) : (
                  item.name
                )}
                {isDefault && (
                  <button
                    type="button"
                    title="Click to clear default"
                    onClick={onSetDefault}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide bg-yellow-400 text-yellow-900 hover:opacity-75 transition-opacity border-0 cursor-pointer"
                  >
                    DEFAULT
                  </button>
                )}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{subtitleParts.join(' · ')}</div>
            </>
          )}
        </TableCell>

        <TableCell className="px-1 py-1.5 w-25 text-xs text-muted-foreground tabular-nums">
          {item.calculationBasis}
        </TableCell>

        <TableCell
          className="px-1 py-1.5 min-w-25 text-sm tabular-nums cursor-text"
          onDoubleClick={() => canOverridePrice && startEdit('price')}
          title={canOverridePrice ? 'Double-click to override price' : undefined}
        >
          {priceContent}
        </TableCell>

        <TableCell className="px-1 py-1.5 w-7">
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            title="Open in library"
            onClick={() => navigate('/pricing')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink size={14} aria-hidden="true" />
          </Button>
        </TableCell>

        <TableCell className="pl-1 pr-4 py-1.5 w-7">
          <Button
            variant="ghost"
            size="icon-sm"
            type="button"
            title="Remove"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X size={14} aria-hidden="true" />
          </Button>
        </TableCell>
    </TableRow>
  )
})
