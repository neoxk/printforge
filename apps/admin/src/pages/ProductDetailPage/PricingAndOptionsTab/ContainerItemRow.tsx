import { Settings, X } from 'lucide-react'
import { useState } from 'react'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem, OptionsGroup } from '@printforge/ui'
import { CalcBasis } from '@printforge/ui'
import { BASIS_UNIT } from '../../../lib/options-meta'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell, TableRow } from '@/components/ui/table'
import { ContainerItemSettings } from './ContainerItemSettings'

type Props = {
  containerItem: ContainerOptionItem
  isDefault: boolean
  groups: OptionsGroup[]
  onRemove: () => void
  onPatch: (payload: ContainerItemPatchPayload) => void
  onSetDefault: () => void
}

export function ContainerItemRow({
  containerItem,
  isDefault,
  groups,
  onRemove,
  onPatch,
  onSetDefault,
}: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { item } = containerItem
  const effectivePriceUnit = containerItem.priceUnit ?? item.priceUnit
  const isPriceOverridden = containerItem.priceUnit !== null
  const isNameOverridden = containerItem.name !== null

  const groupName = item.groupId ? (groups.find((g) => g.id === item.groupId)?.name ?? '') : ''
  const subtitleParts = [
    groupName.toLowerCase(),
    item.slug,
    item.lengthMm && item.widthMm ? `${item.lengthMm} × ${item.widthMm} mm` : null,
  ].filter(Boolean)

  const unit = BASIS_UNIT[item.calculationBasis] ?? ''

  return (
    <TableRow className="bg-card hover:bg-muted/30">
        <TableCell className="pl-4 pr-1 py-1.5 w-6">
          <span className="text-muted-foreground/30 hover:text-muted-foreground cursor-grab select-none text-base flex items-center justify-center" aria-hidden="true">
            ⠿
          </span>
        </TableCell>

        <TableCell className="px-1 py-1.5">
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
        </TableCell>

        <TableCell className="px-1 py-1.5 w-[100px] text-xs text-muted-foreground tabular-nums">
          {item.calculationBasis}
        </TableCell>

        <TableCell className="px-1 py-1.5 min-w-[100px] text-sm tabular-nums">
          {item.calculationBasis === CalcBasis.FREE ? (
            <span className="text-muted-foreground">— always 0</span>
          ) : isPriceOverridden ? (
            <div className="flex flex-col gap-0.5">
              <s className="text-muted-foreground text-xs">
                € {Number(item.priceUnit).toFixed(2)} {unit}
              </s>
              <span className="text-destructive text-xs">
                € {Number(effectivePriceUnit).toFixed(2)} {unit}
              </span>
              <span className="text-[10px] text-muted-foreground">overridden here</span>
            </div>
          ) : (
            `€ ${Number(effectivePriceUnit).toFixed(2)} ${unit}`
          )}
        </TableCell>

        <TableCell className="px-1 py-1.5 w-7">
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                title="Settings"
              >
                <Settings size={14} aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <ContainerItemSettings
                containerItem={containerItem}
                onPatch={onPatch}
                onClose={() => setIsSettingsOpen(false)}
              />
            </PopoverContent>
          </Popover>
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
}
