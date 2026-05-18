import { Settings, X } from 'lucide-react'
import { useState } from 'react'
import type { ContainerItemPatchPayload } from '../../../lib/services/containers'
import type { ContainerOptionItem, OptionsGroup } from '@printforge/ui'
import { CalcBasis, DisplayMode } from '@printforge/ui'
import { BASIS_UNIT, DISPLAY_LABEL } from '../../../lib/options-meta'
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
  const effectiveDisplayMode = containerItem.displayMode ?? item.displayMode
  const effectivePriceUnit = containerItem.priceUnit ?? item.priceUnit
  const isOverridden = containerItem.priceUnit !== null

  const groupName = item.groupId ? (groups.find((g) => g.id === item.groupId)?.name ?? '') : ''
  const subtitleParts = [
    groupName.toLowerCase(),
    item.slug,
    item.lengthMm && item.widthMm ? `${item.lengthMm} × ${item.widthMm} mm` : null,
  ].filter(Boolean)

  const unit = BASIS_UNIT[item.calculationBasis] ?? ''

  return (
    <>
      <div className="container-item-row">
        <span className="drag-handle" aria-hidden="true">⠿</span>

        <div>
          <div className="container-item-name">
            {item.name}
            {isDefault && (
              <button
                className="item-default-badge"
                type="button"
                title="Click to clear default"
                onClick={onSetDefault}
              >
                DEFAULT
              </button>
            )}
          </div>
          <div className="item-subtitle">{subtitleParts.join(' · ')}</div>
        </div>

        <span className="container-item-basis">{item.calculationBasis}</span>

        <div className="container-item-price">
          {item.calculationBasis === CalcBasis.FREE ? (
            <span className="muted-copy">— always 0</span>
          ) : isOverridden ? (
            <>
              <s className="price-override-base">
                € {Number(item.priceUnit).toFixed(2)} {unit}
              </s>{' '}
              <span style={{ color: 'var(--error)' }}>
                € {Number(effectivePriceUnit).toFixed(2)} {unit}
              </span>
              <div className="muted-copy" style={{ fontSize: '0.7rem' }}>overridden here</div>
            </>
          ) : (
            `€ ${Number(effectivePriceUnit).toFixed(2)} ${unit}`
          )}
        </div>

        <div>
          <span
            className={`display-mode-badge${effectiveDisplayMode === DisplayMode.REQUIRED ? ' display-required' : ''}`}
          >
            {DISPLAY_LABEL[effectiveDisplayMode]}
          </span>
        </div>

        <button
          className="icon-button-sm"
          type="button"
          title="Settings"
          onClick={() => setIsSettingsOpen((v) => !v)}
        >
          <Settings size={14} aria-hidden="true" />
        </button>

        <button className="icon-button-sm danger" type="button" title="Remove" onClick={onRemove}>
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {isSettingsOpen && (
        <ContainerItemSettings
          containerItem={containerItem}
          onPatch={onPatch}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  )
}
