import { ImagePlus, Move, Plus, Save, SquarePen, ZoomIn, ZoomOut } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CanvasCreationCard } from './components/CanvasCreationCard'
import { ViewInspectorCard } from './components/ViewInspectorCard'
import {
  createEmptyDraft,
  createViewFromDraft,
  FabricDesignerCanvas,
  fieldLabel,
  fieldOrder,
  templatePresets,
  updateViewCollection,
  validateDesignerView,
} from '@printforge/ui/designer'
import type {
  CreateViewDraft,
  DesignerTool,
  DesignerView,
  ZoneKey,
  ZoneRect,
} from '@printforge/ui/designer'
import { cn } from '@/lib/utils'
import { Button } from '@printforge/ui/components/ui/button'


function getSourceModeLabel(mode: string | undefined) {
  switch (mode) {
    case 'template':
      return 'Template-based view'
    case 'upload':
      return 'Mockup-guided view'
    default:
      return 'Blank canvas view'
  }
}

function getSourceModeIcon(mode: string | undefined) {
  switch (mode) {
    case 'template':
      return <SquarePen className="size-4" aria-hidden="true" />
    case 'upload':
      return <ImagePlus className="size-4" aria-hidden="true" />
    default:
      return <Plus className="size-4" aria-hidden="true" />
  }
}

export function AdminDesignerPage() {
  const [views, setViews] = useState<DesignerView[]>([])
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null)
  const [draft, setDraft] = useState<CreateViewDraft>(createEmptyDraft())
  const [activeTool, setActiveTool] = useState<DesignerTool>('select')
  const [activeDrawTarget, setActiveDrawTarget] = useState<ZoneKey | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [statusMessage, setStatusMessage] = useState('Create a view to start defining print zones.')

  const selectedView = views.find((view) => view.id === selectedViewId) ?? null
  const validation = selectedView ? validateDesignerView(selectedView) : null
  const selectedViewSourceModeLabel = selectedView ? getSourceModeLabel(selectedView.sourceMode) : ''
  const selectedViewSourceIcon = selectedView ? getSourceModeIcon(selectedView.sourceMode) : null

  const legendEntries = useMemo(
    () =>
      fieldOrder
        .filter((key) => key !== 'physicalSize')
        .map((key) => ({
          key,
          label: fieldLabel(key),
        })),
    [],
  )

  function resetViewport() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  function handleCreateView() {
    const nextView = createViewFromDraft(draft)
    setViews((currentViews) => [...currentViews, nextView])
    setSelectedViewId(nextView.id)
    setDraft(createEmptyDraft())
    setActiveTool('select')
    setActiveDrawTarget(null)
    resetViewport()
    setStatusMessage(`View "${nextView.name}" was created locally. Backend sync will be added later.`)
  }

  function handleSelectView(viewId: string) {
    setSelectedViewId(viewId)
    setActiveTool('select')
    setActiveDrawTarget(null)
    resetViewport()
  }

  function handleFieldToggle(key: ZoneKey, enabled: boolean) {
    if (!selectedViewId || key === 'physicalSize') {
      return
    }

    setViews((currentViews) =>
      updateViewCollection(currentViews, selectedViewId, (view) => ({
        ...view,
        fields: {
          ...view.fields,
          [key]: {
            ...view.fields[key],
            enabled,
          },
        },
      })),
    )
  }

  function handleFieldRectChange(key: ZoneKey, rect: Partial<ZoneRect>) {
    if (!selectedViewId) {
      return
    }

    setViews((currentViews) =>
      updateViewCollection(currentViews, selectedViewId, (view) => ({
        ...view,
        fields: {
          ...view.fields,
          [key]: {
            ...view.fields[key],
            rect: {
              ...view.fields[key].rect,
              ...rect,
            },
          },
        },
      })),
    )
  }

  function handleCanvasZoneChange(key: ZoneKey, rect: ZoneRect) {
    if (key === 'physicalSize') {
      handleFieldRectChange(key, {
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
      })
    } else {
      handleFieldRectChange(key, rect)
    }
    setActiveTool('select')
    setActiveDrawTarget(null)
  }

  function handleActivateDraw(key: ZoneKey) {
    setActiveTool('draw')
    setActiveDrawTarget(key)
    setStatusMessage(`Draw ${fieldLabel(key)} directly on the canvas.`)
  }

  function handleSaveMock() {
    if (validation?.hasErrors) {
      setStatusMessage('Resolve the red validation messages before saving this design.')
      return
    }

    setStatusMessage('Designer state saved locally. Backend persistence will be connected later.')
  }

  function handleZoomIn() {
    setZoom((currentZoom) => Math.min(3, Number((currentZoom + 0.1).toFixed(2))))
  }

  function handleZoomOut() {
    setZoom((currentZoom) => Math.max(0.4, Number((currentZoom - 0.1).toFixed(2))))
  }

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-6 p-6">
      <aside className="flex flex-col gap-4">
        <CanvasCreationCard
          draft={draft}
          templates={templatePresets}
          views={views}
          selectedViewId={selectedViewId}
          onDraftChange={setDraft}
          onSelectView={handleSelectView}
          onCreateView={handleCreateView}
        />

        {selectedView ? (
          <ViewInspectorCard
            view={selectedView}
            activeTool={activeTool}
            activeDrawTarget={activeDrawTarget}
            alerts={validation?.alerts ?? null}
            onToolChange={(nextTool) => {
              setActiveTool(nextTool)
              if (nextTool !== 'draw') {
                setActiveDrawTarget(null)
              }
            }}
            onFieldToggle={handleFieldToggle}
            onFieldRectChange={handleFieldRectChange}
            onActivateDraw={handleActivateDraw}
            onSave={handleSaveMock}
            saveDisabled={validation?.hasErrors ?? false}
          />
        ) : (
          <section className="rounded-2xl border border-border bg-card p-5 text-muted-foreground">
            <h2 className="mb-2 text-lg font-semibold text-foreground">No canvas selected</h2>
            <p>
              Create a view from a template, an uploaded mockup, or a blank canvas to start the
              admin designer flow.
            </p>
          </section>
        )}
      </aside>

      <section className="flex min-w-0 flex-col gap-4">
        <header className="flex items-start justify-between gap-4 px-2 pt-2">
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
              Admin Designer
            </p>
            <h1 className="text-3xl font-bold leading-tight text-foreground">
              {selectedView ? selectedView.name : 'View setup workspace'}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" type="button" onClick={handleZoomOut}>
              <ZoomOut className="size-4" aria-hidden="true" />
              Zoom out
            </Button>
            <Button variant="outline" type="button" onClick={handleZoomIn}>
              <ZoomIn className="size-4" aria-hidden="true" />
              Zoom in
            </Button>
            <Button
              variant="outline"
              type="button"
              className={cn(
                activeTool === 'pan' && 'border-primary bg-[#eef4ff] text-[#001849]',
              )}
              onClick={() => {
                setActiveTool('pan')
                setActiveDrawTarget(null)
              }}
            >
              <Move className="size-4" aria-hidden="true" />
              Hand tool
            </Button>
            <Button type="button" onClick={handleSaveMock}>
              <Save className="size-4" aria-hidden="true" />
              Save mock
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col rounded-2xl border border-border p-5">
          {selectedView ? (
            <>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{selectedView.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedViewSourceModeLabel}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-muted px-3 text-xs font-semibold text-muted-foreground">
                    {selectedViewSourceIcon}
                    {selectedView.sourceMode}
                  </span>
                  <span className="inline-flex h-8 items-center rounded-full border border-border bg-muted px-3 text-xs font-semibold text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              <FabricDesignerCanvas
                view={selectedView}
                activeTool={activeTool}
                activeDrawTarget={activeDrawTarget}
                zoom={zoom}
                pan={pan}
                legendEntries={legendEntries}
                onPanChange={setPan}
                onZoneRectChange={handleCanvasZoneChange}
              />
            </>
          ) : (
            <div className="flex min-h-130 flex-col justify-center">
              <h2 className="text-lg font-semibold text-foreground">
                Choose how the next canvas starts
              </h2>
              <div className="mt-7 grid grid-cols-3 gap-4">
                <article className="rounded-xl border border-border bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    Predefined product template
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start from a mock template such as a business card, flyer, mug, or T-shirt.
                  </p>
                </article>
                <article className="rounded-xl border border-border bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    Upload mockup and define zones manually
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Load a reference image and draw the print zones directly onto the view.
                  </p>
                </article>
                <article className="rounded-xl border border-border bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Blank canvas</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with a clean artboard and define every zone manually from scratch.
                  </p>
                </article>
              </div>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 px-2 text-sm text-muted-foreground">
          <span>{statusMessage}</span>
          {selectedView && validation?.hasErrors ? (
            <span className="font-semibold text-destructive">
              Saving is disabled until the design is valid.
            </span>
          ) : null}
        </footer>
      </section>
    </div>
  )
}
