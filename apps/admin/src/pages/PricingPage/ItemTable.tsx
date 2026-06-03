import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { OptionItem, OptionsGroup } from '@printforge/ui'
import { BASIS_LABEL, BASIS_UNIT, basisNeedsLength, basisNeedsWidth } from '../../lib/options-meta'
import { Button } from '@printforge/ui/components/ui/button'
import { Badge } from '@printforge/ui/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@printforge/ui/components/ui/table'

type Props = {
  items: OptionItem[]
  groups: OptionsGroup[]
  isLoading: boolean
  selectedGroupId: string | null
  onEdit: (item: OptionItem | null) => void
  onDelete: (id: string) => Promise<void>
}

function formatDimensions(item: OptionItem): string {
  const needsWidth = basisNeedsWidth(item.calculationBasis)
  const needsLength = basisNeedsLength(item.calculationBasis)

  if (!needsWidth && !needsLength) return '—'

  const w = item.widthMm != null ? `${item.widthMm} mm` : null
  const l = item.lengthMm != null ? `${item.lengthMm} mm` : null

  if (needsWidth && needsLength) {
    if (w && l) return `${item.widthMm} × ${item.lengthMm} mm`
    return w ?? l ?? '—'
  }
  if (needsWidth) return w ?? '—'
  return l ?? '—'
}

export function ItemTable({ items, groups, isLoading, selectedGroupId, onEdit, onDelete }: Props) {
  function getGroupName(groupId: string | null) {
    if (!groupId) return null
    return groups.find((g) => g.id === groupId)?.name ?? null
  }

  const showGroupColumn = selectedGroupId === null
  const colSpan = showGroupColumn ? 5 : 4

  return (
    <div className="col-span-3">
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="flex justify-end px-4 py-2 border-b">
          <Button variant="outline" size="sm" type="button" onClick={() => onEdit(null)}>
            <Plus size={14} aria-hidden="true" />
            New item
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40">
              <TableHead className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Name</TableHead>
              <TableHead className="w-[110px] text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Basis</TableHead>
              <TableHead className="w-[130px] text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Price</TableHead>
              <TableHead className="w-[130px] text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Dimensions</TableHead>
              {showGroupColumn && (
                <TableHead className="w-[120px] text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Group</TableHead>
              )}
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>

          {isLoading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={colSpan} className="py-6 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            </TableBody>
          )}
          {!isLoading && items.length === 0 && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={colSpan} className="py-6 text-center text-muted-foreground">
                  No items here yet.
                </TableCell>
              </TableRow>
            </TableBody>
          )}
          {!isLoading && items.length > 0 && (
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col gap-px overflow-hidden">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{item.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{BASIS_LABEL[item.calculationBasis]}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums text-sm">
                    € {Number(item.priceUnit).toFixed(2)} {BASIS_UNIT[item.calculationBasis]}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDimensions(item)}
                  </TableCell>
                  {showGroupColumn && (
                    <TableCell className="text-sm text-muted-foreground truncate">
                      {getGroupName(item.groupId) ?? '—'}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        title="Edit item"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        title="Delete item"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => void onDelete(item.id)}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  )
}
