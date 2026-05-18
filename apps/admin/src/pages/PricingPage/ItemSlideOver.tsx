import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CalcBasis } from '@printforge/ui'
import type { OptionItem, OptionsGroup } from '@printforge/ui'
import type { ItemPayload } from '../../lib/services/items'
import { BASIS_OPTIONS, BASIS_UNIT, basisNeedsLength, basisNeedsWidth } from '../../lib/options-meta'

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
    <>
      {isOpen && (
        <div className="slide-over-backdrop" onClick={onClose} aria-hidden="true" />
      )}
      <div className={`item-slide-over${isOpen ? ' item-slide-over--open' : ''}`} aria-label="Item editor">
        <div className="slide-over-header">
          <h3>{item ? item.name : 'New item'}</h3>
          <button className="icon-button-sm" type="button" onClick={onClose} aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form className="slide-over-body" onSubmit={(e) => void handleSubmit(e)}>
          <label className="slide-over-field">
            <span>Name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Coated 135g"
            />
          </label>

          <label className="slide-over-field">
            <span>Slug</span>
            <input
              type="text"
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))}
              placeholder="e.g. coated-135g"
            />
          </label>

          <label className="slide-over-field">
            <span>Calculation basis</span>
            <select
              value={form.calculationBasis}
              onChange={(e) => set('calculationBasis', e.target.value as CalcBasis)}
            >
              {BASIS_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </label>

          <label className="slide-over-field">
            <span>Price {BASIS_UNIT[form.calculationBasis]} (€)</span>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={form.priceUnit}
              onChange={(e) => set('priceUnit', e.target.value)}
              placeholder="0.00"
            />
          </label>

          {(needsLength || needsWidth) && (
            <div className="slide-over-section">
              <p className="slide-over-section-label">Process dimensions (mm)</p>
              {needsLength && (
                <label className="slide-over-field">
                  <span>Sheet length (mm)</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.lengthMm}
                    onChange={(e) => set('lengthMm', e.target.value)}
                    placeholder="e.g. 450"
                  />
                </label>
              )}
              {needsWidth && (
                <label className="slide-over-field">
                  <span>{form.calculationBasis === CalcBasis.LINEAR_M ? 'Roll width (mm)' : 'Sheet width (mm)'}</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.widthMm}
                    onChange={(e) => set('widthMm', e.target.value)}
                    placeholder="e.g. 330"
                  />
                </label>
              )}
            </div>
          )}

          <label className="slide-over-field">
            <span>Group</span>
            <select
              value={form.groupId ?? ''}
              onChange={(e) => set('groupId', e.target.value || null)}
            >
              <option value="">— Ungrouped —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </label>

          <div className="slide-over-footer">
            <button className="ghost-button" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : item ? 'Save changes' : 'Create item'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
