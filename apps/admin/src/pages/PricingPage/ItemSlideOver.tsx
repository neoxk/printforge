import { useEffect, useState } from 'react'
import { CalcBasis } from '@printforge/ui'
import type { OptionItem, OptionsGroup } from '@printforge/ui'
import type { ItemPayload } from '../../lib/services/items'
import { BASIS_OPTIONS, BASIS_UNIT, basisNeedsLength, basisNeedsWidth } from '../../lib/options-meta'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

export type ItemFormData = ItemPayload & { groupId: string | null }

type Props = {
  isOpen: boolean
  item: OptionItem | null
  groups: OptionsGroup[]
  onClose: () => void
  onSave: (data: ItemFormData, item: OptionItem | null) => Promise<void>
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function blank() {
  return {
    name: '',
    slug: '',
    slugTouched: false,
    calculationBasis: CalcBasis.YIELD_PCS as CalcBasis,
    priceUnit: '',
    lengthMm: '',
    widthMm: '',
    groupId: null as string | null,
  }
}

function fromItem(item: OptionItem) {
  return {
    name: item.name,
    slug: item.slug,
    slugTouched: true,
    calculationBasis: item.calculationBasis,
    priceUnit: String(item.priceUnit),
    lengthMm: item.lengthMm !== null ? String(item.lengthMm) : '',
    widthMm: item.widthMm !== null ? String(item.widthMm) : '',
    groupId: item.groupId,
  }
}

export function ItemSlideOver({ isOpen, item, groups, onClose, onSave }: Props) {
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(item ? fromItem(item) : blank())
      setSaving(false)
    }
  }, [isOpen, item])

  function set<K extends keyof ReturnType<typeof blank>>(key: K, value: ReturnType<typeof blank>[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: f.slugTouched ? f.slug : toSlug(name),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const priceUnitNum = parseFloat(form.priceUnit)
    if (isNaN(priceUnitNum) || priceUnitNum < 0) return

    const needsLength = basisNeedsLength(form.calculationBasis)
    const needsWidth = basisNeedsWidth(form.calculationBasis)

    const data: ItemFormData = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      priceUnit: priceUnitNum,
      calculationBasis: form.calculationBasis,
      lengthMm: needsLength && form.lengthMm !== '' ? parseInt(form.lengthMm, 10) : null,
      widthMm: needsWidth && form.widthMm !== '' ? parseInt(form.widthMm, 10) : null,
      groupId: form.groupId,
    }

    setSaving(true)
    try {
      await onSave(data, item)
    } finally {
      setSaving(false)
    }
  }

  const needsLength = basisNeedsLength(form.calculationBasis)
  const needsWidth = basisNeedsWidth(form.calculationBasis)

  return (
    <Sheet open={isOpen} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] p-0 gap-0 flex flex-col">
        <SheetHeader className="border-b px-4 py-3 shrink-0">
          <SheetTitle>{item ? item.name : 'New item'}</SheetTitle>
        </SheetHeader>

        <form className="flex flex-col flex-1 min-h-0" onSubmit={(e) => void handleSubmit(e)}>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-name" className="text-xs font-semibold uppercase tracking-wide">Name</Label>
              <Input
                id="item-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Coated 135g"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-slug" className="text-xs font-semibold uppercase tracking-wide">Slug</Label>
              <Input
                id="item-slug"
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))}
                placeholder="e.g. coated-135g"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide">Calculation basis</Label>
              <Select
                value={form.calculationBasis}
                onValueChange={(v) => set('calculationBasis', v as CalcBasis)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BASIS_OPTIONS.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-price" className="text-xs font-semibold uppercase tracking-wide">
                Price {BASIS_UNIT[form.calculationBasis]} (€)
              </Label>
              <Input
                id="item-price"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.priceUnit}
                onChange={(e) => set('priceUnit', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {(needsLength || needsWidth) && (
              <div className="flex flex-col gap-4 p-4 bg-muted/40 rounded-lg border">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground m-0">
                  Process dimensions (mm)
                </p>
                {needsLength && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="item-length" className="text-xs font-semibold uppercase tracking-wide">Sheet length (mm)</Label>
                    <Input
                      id="item-length"
                      type="number"
                      min="1"
                      step="1"
                      value={form.lengthMm}
                      onChange={(e) => set('lengthMm', e.target.value)}
                      placeholder="e.g. 450"
                    />
                  </div>
                )}
                {needsWidth && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="item-width" className="text-xs font-semibold uppercase tracking-wide">
                      {form.calculationBasis === CalcBasis.LINEAR_M ? 'Roll width (mm)' : 'Sheet width (mm)'}
                    </Label>
                    <Input
                      id="item-width"
                      type="number"
                      min="1"
                      step="1"
                      value={form.widthMm}
                      onChange={(e) => set('widthMm', e.target.value)}
                      placeholder="e.g. 330"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide">Group</Label>
              <Select
                value={form.groupId ?? '__none__'}
                onValueChange={(v) => set('groupId', v === '__none__' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Ungrouped —</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="border-t px-4 py-3 flex-row justify-end gap-2 shrink-0">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : item ? 'Save changes' : 'Create item'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
