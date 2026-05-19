import { Hand, MousePointer2, PenSquare, Save } from 'lucide-react'
import { fieldOrder, zoneSupportsPosition } from '../../shared/geometry'
import { InlineZoneAlerts } from './InlineZoneAlerts'
import type { DesignerTool, DesignerView, InlineAlert, ZoneKey, ZoneRect } from '../../shared/types'

type ViewInspectorCardProps = {
  view: DesignerView
  activeTool: DesignerTool
  activeDrawTarget: ZoneKey | null
  alerts: Record<ZoneKey, InlineAlert[]> | null
  saveDisabled: boolean
  onToolChange: (tool: DesignerTool) => void
  onFieldToggle: (key: ZoneKey, enabled: boolean) => void
  onFieldRectChange: (key: ZoneKey, rect: Partial<ZoneRect>) => void
  onActivateDraw: (key: ZoneKey) => void
  onSave: () => void
}

export function ViewInspectorCard({
  view,
  activeTool,
  activeDrawTarget,
  alerts,
  saveDisabled,
  onToolChange,
  onFieldToggle,
  onFieldRectChange,
  onActivateDraw,
  onSave,
}: ViewInspectorCardProps) {
  return (
    <section className="designer-card">
      <header className="designer-card-header">
        <div>
          <p className="card-eyebrow">Selected view</p>
          <h2>{view.name}</h2>
        </div>
        <button
          type="button"
          className={saveDisabled ? 'save-button save-button-disabled' : 'save-button'}
          disabled={saveDisabled}
          onClick={onSave}
        >
          <Save className="button-icon" aria-hidden="true" />
          Save
        </button>
      </header>

      <div className="tool-row">
        <button
          type="button"
          className={activeTool === 'select' ? 'tool-chip tool-chip-active' : 'tool-chip'}
          onClick={() => onToolChange('select')}
        >
          <MousePointer2 className="button-icon" aria-hidden="true" />
          Select
        </button>
        <button
          type="button"
          className={activeTool === 'pan' ? 'tool-chip tool-chip-active' : 'tool-chip'}
          onClick={() => onToolChange('pan')}
        >
          <Hand className="button-icon" aria-hidden="true" />
          Hand
        </button>
      </div>

      <div className="field-groups">
        {fieldOrder.map((key) => {
          const field = view.fields[key]
          const isDisabled = !field.enabled

          return (
            <section
              key={field.key}
              className={isDisabled ? 'field-group field-group-disabled' : 'field-group'}
            >
              <header className="field-group-header">
                <label className="field-toggle">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    disabled={!field.optional}
                    onChange={(event) => onFieldToggle(field.key, event.target.checked)}
                  />
                  <span>{field.label}</span>
                </label>
                <button
                  type="button"
                  className={
                    activeDrawTarget === key && activeTool === 'draw'
                      ? 'draw-trigger draw-trigger-active'
                      : 'draw-trigger'
                  }
                  disabled={!field.enabled}
                  onClick={() => onActivateDraw(key)}
                >
                  <PenSquare className="button-icon" aria-hidden="true" />
                </button>
              </header>

              <div className="field-input-grid">
                {zoneSupportsPosition(key) ? (
                  <>
                    <label>
                      <span>X</span>
                      <input
                        type="number"
                        disabled={!field.enabled}
                        value={field.rect.x}
                        onChange={(event) =>
                          onFieldRectChange(key, { x: Number(event.target.value) })
                        }
                      />
                    </label>
                    <label>
                      <span>Y</span>
                      <input
                        type="number"
                        disabled={!field.enabled}
                        value={field.rect.y}
                        onChange={(event) =>
                          onFieldRectChange(key, { y: Number(event.target.value) })
                        }
                      />
                    </label>
                  </>
                ) : null}
                <label>
                  <span>W (mm)</span>
                  <input
                    type="number"
                    disabled={!field.enabled}
                    value={field.rect.width}
                    onChange={(event) =>
                      onFieldRectChange(key, { width: Number(event.target.value) })
                    }
                  />
                </label>
                <label>
                  <span>H (mm)</span>
                  <input
                    type="number"
                    disabled={!field.enabled}
                    value={field.rect.height}
                    onChange={(event) =>
                      onFieldRectChange(key, { height: Number(event.target.value) })
                    }
                  />
                </label>
              </div>

              <InlineZoneAlerts alerts={alerts?.[key] ?? []} />
            </section>
          )
        })}
      </div>
    </section>
  )
}
