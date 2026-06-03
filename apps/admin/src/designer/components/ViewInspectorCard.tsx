import { Hand, MousePointer2, PenSquare, Save } from 'lucide-react'
import { fieldOrder, zoneSupportsPosition } from '@printforge/ui/designer'
import { InlineZoneAlerts } from './InlineZoneAlerts'
import type { DesignerTool, DesignerView, InlineAlert, ZoneKey, ZoneRect } from '@printforge/ui/designer'
import { cn } from '@/lib/utils'
import { Button } from '@printforge/ui/components/ui/button'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'

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

const CHIP_BASE =
  'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 py-2 text-sm transition-colors'
const CHIP_INACTIVE = 'border-border bg-white text-foreground hover:border-primary'
const CHIP_ACTIVE = 'border-primary bg-[#eef4ff] text-[#001849]'

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
}: Readonly<ViewInspectorCardProps>) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Selected view
          </p>
          <h2 className="m-0 text-lg font-semibold text-foreground">{view.name}</h2>
        </div>
        <Button type="button" size="sm" disabled={saveDisabled} onClick={onSave}>
          <Save className="size-4" aria-hidden="true" />
          Save
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2.5">
        <button
          type="button"
          className={cn(CHIP_BASE, activeTool === 'select' ? CHIP_ACTIVE : CHIP_INACTIVE)}
          onClick={() => onToolChange('select')}
        >
          <MousePointer2 className="size-4" aria-hidden="true" />
          Select
        </button>
        <button
          type="button"
          className={cn(CHIP_BASE, activeTool === 'pan' ? CHIP_ACTIVE : CHIP_INACTIVE)}
          onClick={() => onToolChange('pan')}
        >
          <Hand className="size-4" aria-hidden="true" />
          Hand
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        {fieldOrder.map((key) => {
          const field = view.fields[key]
          const isDisabled = !field.enabled

          return (
            <section
              key={field.key}
              className={cn(
                'rounded-xl border border-border p-3.5 transition-opacity',
                isDisabled && 'opacity-50',
              )}
            >
              <header className="mb-3 flex items-center justify-between gap-2.5">
                <label className="inline-flex cursor-pointer items-center gap-2.5 font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    disabled={!field.optional}
                    onChange={(event) => onFieldToggle(field.key, event.target.checked)}
                  />
                  <span>{field.label}</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'size-9 rounded-[10px]',
                    activeDrawTarget === key &&
                      activeTool === 'draw' &&
                      'border-primary bg-[#eef4ff] text-[#001849]',
                  )}
                  disabled={!field.enabled}
                  onClick={() => onActivateDraw(key)}
                >
                  <PenSquare className="size-4" aria-hidden="true" />
                </Button>
              </header>

              <div className="grid grid-cols-2 gap-2.5">
                {zoneSupportsPosition(key) ? (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        X
                      </Label>
                      <Input
                        type="number"
                        disabled={!field.enabled}
                        value={field.rect.x}
                        onChange={(event) =>
                          onFieldRectChange(key, { x: Number(event.target.value) })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Y
                      </Label>
                      <Input
                        type="number"
                        disabled={!field.enabled}
                        value={field.rect.y}
                        onChange={(event) =>
                          onFieldRectChange(key, { y: Number(event.target.value) })
                        }
                      />
                    </div>
                  </>
                ) : null}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    W (mm)
                  </Label>
                  <Input
                    type="number"
                    disabled={!field.enabled}
                    value={field.rect.width}
                    onChange={(event) =>
                      onFieldRectChange(key, { width: Number(event.target.value) })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    H (mm)
                  </Label>
                  <Input
                    type="number"
                    disabled={!field.enabled}
                    value={field.rect.height}
                    onChange={(event) =>
                      onFieldRectChange(key, { height: Number(event.target.value) })
                    }
                  />
                </div>
              </div>

              <InlineZoneAlerts alerts={alerts?.[key] ?? []} />
            </section>
          )
        })}
      </div>
    </section>
  )
}
