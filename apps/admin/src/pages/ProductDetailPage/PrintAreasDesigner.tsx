import {
  Hand,
  ImagePlus,
  Eye,
  Layers3,
  MousePointer2,
  Plus,
  Save,
  Shapes,
  SquarePen,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { SectionCard } from '@printforge/ui'
import {
  createEmptyDraft,
  createViewFromDraft,
  fieldOrder,
  readMockupFile,
  templatePresets,
  updateViewCollection,
  validateDesignerView,
  zoneSupportsPosition,
} from '@printforge/ui/designer'
import type {
  CreateViewDraft,
  DesignerTool,
  DesignerView,
  ZoneKey,
  ZoneRect,
} from '@printforge/ui/designer'
import { cn } from '@/lib/utils'
import { showInfo } from '@/lib/toast'
import { Button } from '@printforge/ui/components/ui/button'
import { Input } from '@printforge/ui/components/ui/input'
import { Label } from '@printforge/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@printforge/ui/components/ui/select'
import { Switch } from '@printforge/ui/components/ui/switch'
import { InlineZoneAlerts } from '../../designer/components/InlineZoneAlerts'
import { FabricPrintAreaCanvas } from './FabricPrintAreaCanvas'

// ─── Types ────────────────────────────────────────────────────────────────────

type PrintAreasDesignerState = {
  views: DesignerView[]
  selectedViewId: string | null
  draft: CreateViewDraft
  activeTool: DesignerTool
  activeDrawTarget: ZoneKey | null
  zoom: number
  pan: { x: number; y: number }
  statusMessage: string
}

type PrintAreasDesignerActions = {
  setViews: React.Dispatch<React.SetStateAction<DesignerView[]>>
  setSelectedViewId: React.Dispatch<React.SetStateAction<string | null>>
  setDraft: React.Dispatch<React.SetStateAction<CreateViewDraft>>
  setActiveTool: React.Dispatch<React.SetStateAction<DesignerTool>>
  setActiveDrawTarget: React.Dispatch<React.SetStateAction<ZoneKey | null>>
  setZoom: React.Dispatch<React.SetStateAction<number>>
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>
}

type Props = {
  state: PrintAreasDesignerState
  actions: PrintAreasDesignerActions
  isSaving: boolean
  onSave: () => Promise<void> | void
  onPreview: () => Promise<void> | void
}

// ─── Style constants ──────────────────────────────────────────────────────────

const CHIP_INACTIVE = 'border-border bg-white text-foreground hover:border-primary'
const CHIP_ACTIVE = 'border-primary bg-[#eef4ff] text-[#001849]'
const PILL_BASE = 'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm transition-colors'
const TILE_BASE = 'grid cursor-pointer gap-2 rounded-xl border p-3.5 text-left transition-colors'
const TILE_INACTIVE = 'border-border bg-white text-foreground hover:border-primary'
const TILE_ACTIVE = 'border-primary bg-[#eef4ff] text-[#001849]'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCanvasDescription(view: DesignerView | null): string {
  if (!view) return 'Create a view from a template, uploaded mockup, or blank canvas to begin.'
  if (view.sourceMode === 'template') return 'Template-based view'
  if (view.sourceMode === 'upload') return 'Mockup-guided view'
  return 'Blank canvas view'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PrintAreasDesigner({ state, actions, isSaving, onSave, onPreview }: Readonly<Props>) {
  const { views, selectedViewId, draft, activeTool, activeDrawTarget, zoom, pan } = state
  const { setViews, setSelectedViewId, setDraft, setActiveTool, setActiveDrawTarget, setZoom, setPan, setStatusMessage } = actions

  const selectedView = views.find((view) => view.id === selectedViewId) ?? null
  const [selectedZoneKey, setSelectedZoneKey] = useState<ZoneKey | null>(null)
  const validation = useMemo(
    () => (selectedView ? validateDesignerView(selectedView) : null),
    [selectedView],
  )

  function resetViewport() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  function handleCreateView() {
    const nextView = createViewFromDraft(draft)
    setViews((v) => [...v, nextView])
    setSelectedViewId(nextView.id)
    setDraft(createEmptyDraft())
    setActiveTool('select')
    setActiveDrawTarget(null)
    resetViewport()
    setStatusMessage(`View "${nextView.name}" created. Use the tools to define print zones, then save.`)
    showInfo(`View "${nextView.name}" created. Remember to save when done.`, 'View created')
  }

  function handleRenameView(viewId: string, name: string) {
    setViews((v) => v.map((view) => (view.id === viewId ? { ...view, name } : view)))
  }

  function handleDeleteView(viewId: string) {
    const remaining = views.filter((v) => v.id !== viewId)
    setViews(remaining)
    if (selectedViewId === viewId) {
      const next = remaining[0] ?? null
      setSelectedViewId(next?.id ?? null)
      setActiveTool('select')
      setActiveDrawTarget(null)
      setSelectedZoneKey(null)
      if (!next) {
        resetViewport()
        setStatusMessage('Create a view to start defining print zones.')
      }
    }
  }

  function handleSelectView(viewId: string) {
    setSelectedViewId(viewId)
    setActiveTool('select')
    setActiveDrawTarget(null)
    setSelectedZoneKey(null)
    resetViewport()
  }

  async function handleMockupChange(file: File | null) {
    if (!file) {
      setDraft((d) => ({ ...d, mockupName: null, mockupSrc: null }))
      return
    }
    const mockupSrc = await readMockupFile(file)
    const nameFromFile = file.name.replace(/\.[^.]+$/, '')
    setDraft((d) => ({ ...d, mockupName: file.name, mockupSrc, name: nameFromFile }))
  }

  function handleFieldToggle(key: ZoneKey, enabled: boolean) {
    if (!selectedViewId || key === 'physicalSize') return
    setViews((v) =>
      updateViewCollection(v, selectedViewId, (view) => ({
        ...view,
        fields: { ...view.fields, [key]: { ...view.fields[key], enabled } },
      })),
    )
  }

  function handleFieldRectChange(key: ZoneKey, rect: Partial<ZoneRect>) {
    if (!selectedViewId) return
    setViews((v) =>
      updateViewCollection(v, selectedViewId, (view) => ({
        ...view,
        fields: { ...view.fields, [key]: { ...view.fields[key], rect: { ...view.fields[key].rect, ...rect } } },
      })),
    )
  }

  function handleCanvasZoneChange(key: ZoneKey, rect: ZoneRect) {
    handleFieldRectChange(key, rect)
    setActiveTool('select')
    setActiveDrawTarget(null)
    setSelectedZoneKey(key)
  }

  function handleMockupRectChange(rect: ZoneRect) {
    if (!selectedViewId) return
    setViews((v) =>
      updateViewCollection(v, selectedViewId, (view) => ({
        ...view,
        mockupRect: {
          ...(view.mockupRect ?? { x: 0, y: 0, width: rect.width, height: rect.height, rotation: 0 }),
          ...rect,
        },
      })),
    )
  }

  return (
    <div className="mt-5 grid grid-cols-1 items-start gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <aside className="flex flex-col gap-4">
        {/* Canvas setup */}
        <SectionCard title="Canvas setup" description="Add and switch between product print views.">
          <div className="my-4 flex flex-wrap gap-2">
            {views.length === 0 ? (
              <p className="m-0 text-sm text-muted-foreground">No views created yet.</p>
            ) : (
              views.map((view) => (
                <div
                  key={view.id}
                  className={cn(PILL_BASE, selectedViewId === view.id ? CHIP_ACTIVE : CHIP_INACTIVE, 'pr-1.5')}
                >
                  <button
                    type="button"
                    className="flex min-w-0 items-center gap-2"
                    onClick={() => handleSelectView(view.id)}
                  >
                    <Layers3 className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{view.name}</span>
                  </button>
                  <button
                    type="button"
                    className="ml-1.5 shrink-0 rounded-full p-0.5 opacity-50 transition-opacity hover:opacity-100"
                    onClick={() => handleDeleteView(view.id)}
                    title={`Remove view "${view.name}"`}
                    aria-label={`Remove view "${view.name}"`}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label>{selectedView ? 'Rename view' : 'View name'}</Label>
              <Input
                type="text"
                value={selectedView ? selectedView.name : draft.name}
                placeholder="Front, Back, Sleeve, Lid..."
                onChange={(e) =>
                  selectedView
                    ? handleRenameView(selectedView.id, e.target.value)
                    : setDraft((d) => ({ ...d, name: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2.5">
              {[
                { mode: 'template' as const, icon: <Shapes className="size-4" />, title: 'Predefined product template', desc: 'Business cards, flyers, mugs, apparel, packaging.' },
                { mode: 'upload' as const, icon: <ImagePlus className="size-4" />, title: 'Upload mockup', desc: 'Use a reference image and draw the print zones manually.' },
                { mode: 'blank' as const, icon: <Plus className="size-4" />, title: 'Blank canvas', desc: 'Start with a clean artboard and define every zone manually.' },
              ].map(({ mode, icon, title, desc }) => (
                <button
                  key={mode}
                  type="button"
                  className={cn(TILE_BASE, draft.sourceMode === mode ? TILE_ACTIVE : TILE_INACTIVE)}
                  onClick={() => {
                    const autoName = mode === 'blank' ? 'Blank canvas' : mode === 'upload' ? 'Mockup view' : draft.name
                    setDraft((d) => ({ ...d, sourceMode: mode, name: autoName }))
                  }}
                >
                  {icon}
                  <strong>{title}</strong>
                  <span className="text-[13px] leading-snug text-muted-foreground">{desc}</span>
                </button>
              ))}
            </div>

            {draft.sourceMode === 'template' && (
              <div className="flex flex-col gap-1.5">
                <Label>Template preset</Label>
                <Select
                  value={draft.templateId}
                  onValueChange={(value) => {
                    const preset = templatePresets.find((t) => t.id === value)
                    setDraft((d) => ({ ...d, templateId: value, name: preset?.label ?? d.name }))
                  }}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {templatePresets.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {draft.sourceMode === 'upload' && (
              <div className="flex flex-col gap-1.5">
                <Label>Mockup file</Label>
                <Input type="file" accept="image/*" onChange={(e) => { void handleMockupChange(e.target.files?.[0] ?? null) }} />
                <p className="text-xs text-muted-foreground">{draft.mockupName ?? 'No mockup selected yet.'}</p>
              </div>
            )}

            <Button
              type="button"
              className="w-full"
              disabled={draft.sourceMode === 'upload' && !draft.mockupSrc}
              onClick={handleCreateView}
            >
              Add canvas
            </Button>
          </div>
        </SectionCard>

        {/* Zone inspector */}
        {selectedView ? (
          <SectionCard title={selectedView.name} description="Configure optional print-area zones for this view.">
            <div className="flex flex-col gap-3.5">
              {fieldOrder.map((key) => {
                const field = selectedView.fields[key]
                return (
                  <section
                    key={field.key}
                    className={cn('rounded-xl border border-border p-3.5 transition-opacity', !field.enabled && 'opacity-50')}
                  >
                    <header className="mb-3 flex items-center justify-between gap-2.5">
                      <label className="inline-flex cursor-pointer items-center gap-2.5 font-semibold text-foreground">
                        <Switch
                          size="sm"
                          checked={field.enabled}
                          disabled={!field.optional}
                          onCheckedChange={(checked) => handleFieldToggle(field.key, checked)}
                        />
                        <span>{field.label}</span>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn('size-9 rounded-[10px]', activeDrawTarget === key && activeTool === 'draw' && 'border-primary bg-[#eef4ff] text-[#001849]')}
                        disabled={!field.enabled}
                        onClick={() => {
                          setActiveTool('draw')
                          setActiveDrawTarget(key)
                          setSelectedZoneKey(key)
                          setStatusMessage(`Draw ${field.label} directly on the canvas. Release to create the zone, then switch back to Select to fine-tune it.`)
                        }}
                      >
                        <SquarePen className="size-4" aria-hidden="true" />
                      </Button>
                    </header>

                    <div className="grid grid-cols-2 gap-2.5">
                      {zoneSupportsPosition(key) && (
                        <>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">X</Label>
                            <Input type="number" disabled={!field.enabled} value={field.rect.x} onChange={(e) => handleFieldRectChange(key, { x: Number(e.target.value) })} />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Y</Label>
                            <Input type="number" disabled={!field.enabled} value={field.rect.y} onChange={(e) => handleFieldRectChange(key, { y: Number(e.target.value) })} />
                          </div>
                        </>
                      )}
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">W (mm)</Label>
                        <Input type="number" disabled={!field.enabled} value={field.rect.width} onChange={(e) => handleFieldRectChange(key, { width: Number(e.target.value) })} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">H (mm)</Label>
                        <Input type="number" disabled={!field.enabled} value={field.rect.height} onChange={(e) => handleFieldRectChange(key, { height: Number(e.target.value) })} />
                      </div>
                      {zoneSupportsPosition(key) && (
                        <div className="col-span-2 flex flex-col gap-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rotation</Label>
                          <Input type="number" disabled={!field.enabled} value={field.rect.rotation ?? 0} onChange={(e) => handleFieldRectChange(key, { rotation: Number(e.target.value) })} />
                        </div>
                      )}
                    </div>

                    <InlineZoneAlerts alerts={validation?.alerts[key] ?? []} />
                  </section>
                )
              })}
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="No canvas selected" description="Create a view to start defining print areas.">
            <p className="m-0 text-sm text-muted-foreground">Select a starting mode above and add your first canvas.</p>
          </SectionCard>
        )}
      </aside>

      {/* ── Right panel: canvas workspace ───────────────────────────────────── */}
      <section className="flex min-w-0 flex-col gap-4 self-start xl:sticky xl:top-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">Print Area Designer</p>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedView ? selectedView.name : 'View setup workspace'}
            </h2>
          </div>
          {selectedView && (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={validation?.hasErrors || isSaving} onClick={() => void onPreview()}>
                <Eye className="size-4" aria-hidden="true" />
                Preview
              </Button>
              <Button type="button" size="sm" disabled={validation?.hasErrors || isSaving} onClick={() => void onSave()}>
                <Save className="size-4" aria-hidden="true" />
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          )}
        </div>

        <SectionCard
          title={selectedView ? 'Canvas workspace' : 'Choose how the first canvas starts'}
          description={getCanvasDescription(selectedView)}
          actions={selectedView ? (
            <div className="flex items-center gap-1">
              <Button
                variant={activeTool === 'select' ? 'default' : 'outline'}
                size="icon-sm" type="button" title="Select tool"
                onClick={() => { setActiveTool('select'); setActiveDrawTarget(null); setStatusMessage('Select mode active. Tap a guide to move, resize, or rotate it.') }}
              >
                <MousePointer2 className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant={activeTool === 'pan' ? 'default' : 'outline'}
                size="icon-sm" type="button" title="Hand tool — drag to pan"
                onClick={() => { setActiveTool('pan'); setActiveDrawTarget(null); setStatusMessage('Hand tool active. Drag to pan. Ctrl + scroll to zoom.') }}
              >
                <Hand className="size-4" aria-hidden="true" />
              </Button>
              <div className="mx-1 h-4 w-px bg-border" />
              <Button variant="outline" size="icon-sm" type="button" title="Zoom out" onClick={() => setZoom((z) => Math.max(0.35, Number((z - 0.1).toFixed(2))))}>
                <ZoomOut className="size-4" aria-hidden="true" />
              </Button>
              <Button variant="outline" size="icon-sm" type="button" title="Zoom in" onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}>
                <ZoomIn className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ) : undefined}
        >
          {selectedView ? (
            <FabricPrintAreaCanvas
              view={selectedView}
              activeTool={activeTool}
              activeDrawTarget={activeDrawTarget}
              zoom={zoom}
              pan={pan}
              onPanChange={setPan}
              onZoomChange={setZoom}
              onZoneRectChange={handleCanvasZoneChange}
              onMockupRectChange={handleMockupRectChange}
              selectedZoneKey={selectedZoneKey}
              onSelectedZoneKeyChange={(key) => {
                setSelectedZoneKey(key)
                if (key) { setActiveTool('select'); setActiveDrawTarget(null) }
              }}
            />
          ) : (
            <div className="flex min-h-130 flex-col justify-center">
              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { title: 'Predefined product template', desc: 'Start from a mock template such as a business card, flyer, mug, or T-shirt.' },
                  { title: 'Upload mockup and define zones manually', desc: 'Load a reference image and draw the print zones directly onto the view.' },
                  { title: 'Blank canvas', desc: 'Start with a clean artboard and define every zone manually from scratch.' },
                ].map(({ title, desc }) => (
                  <article key={title} className="rounded-xl border border-border bg-white p-4">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{state.statusMessage}</span>
          {selectedView && validation?.hasErrors ? (
            <span className="font-semibold text-destructive">Saving is disabled until the design is valid.</span>
          ) : null}
        </div>
      </section>
    </div>
  )
}