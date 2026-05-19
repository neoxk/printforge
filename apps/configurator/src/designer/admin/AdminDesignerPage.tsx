import { ImagePlus, Move, Plus, Save, SquarePen, ZoomIn, ZoomOut } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CanvasCreationCard } from './components/CanvasCreationCard'
import { FabricDesignerCanvas } from './components/FabricDesignerCanvas'
import { ViewInspectorCard } from './components/ViewInspectorCard'
import './admin-designer.css'
import {
  createEmptyDraft,
  createViewFromDraft,
  fieldLabel,
  fieldOrder,
} from '../shared/geometry'
import { templatePresets } from '../shared/templates'
import { validateDesignerView } from '../shared/validation'
import type {
  CreateViewDraft,
  DesignerTool,
  DesignerView,
  ZoneKey,
  ZoneRect,
} from '../shared/types'

function updateViewCollection(
  views: DesignerView[],
  selectedViewId: string | null,
  updater: (view: DesignerView) => DesignerView,
) {
  return views.map((view) => (view.id === selectedViewId ? updater(view) : view))
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
    <div className="admin-designer-layout">
      <aside className="designer-sidebar">
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
          <section className="designer-card designer-card-empty">
            <h2>No canvas selected</h2>
            <p>
              Create a view from a template, an uploaded mockup, or a blank canvas to start the
              admin designer flow.
            </p>
          </section>
        )}
      </aside>

      <section className="designer-workspace">
        <header className="workspace-toolbar">
          <div>
            <p className="workspace-eyebrow">Admin Designer</p>
            <h1>{selectedView ? selectedView.name : 'View setup workspace'}</h1>
          </div>

          <div className="workspace-actions">
            <button type="button" className="workspace-button" onClick={handleZoomOut}>
              <ZoomOut className="button-icon" aria-hidden="true" />
              Zoom out
            </button>
            <button type="button" className="workspace-button" onClick={handleZoomIn}>
              <ZoomIn className="button-icon" aria-hidden="true" />
              Zoom in
            </button>
            <button
              type="button"
              className={activeTool === 'pan' ? 'workspace-button workspace-button-active' : 'workspace-button'}
              onClick={() => {
                setActiveTool('pan')
                setActiveDrawTarget(null)
              }}
            >
              <Move className="button-icon" aria-hidden="true" />
              Hand tool
            </button>
            <button type="button" className="workspace-button workspace-button-primary" onClick={handleSaveMock}>
              <Save className="button-icon" aria-hidden="true" />
              Save mock
            </button>
          </div>
        </header>

        <div className="designer-canvas-card">
          {selectedView ? (
            <>
              <div className="designer-canvas-header">
                <div>
                  <h2>{selectedView.name}</h2>
                  <p>
                    {selectedView.sourceMode === 'template'
                      ? 'Template-based view'
                      : selectedView.sourceMode === 'upload'
                        ? 'Mockup-guided view'
                        : 'Blank canvas view'}
                  </p>
                </div>
                <div className="canvas-mode-indicators">
                  <span className="canvas-chip">
                    {selectedView.sourceMode === 'template' ? (
                      <SquarePen className="button-icon" aria-hidden="true" />
                    ) : selectedView.sourceMode === 'upload' ? (
                      <ImagePlus className="button-icon" aria-hidden="true" />
                    ) : (
                      <Plus className="button-icon" aria-hidden="true" />
                    )}
                    {selectedView.sourceMode}
                  </span>
                  <span className="canvas-chip">{Math.round(zoom * 100)}%</span>
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
            <div className="designer-empty-stage">
              <h2>Choose how the next canvas starts</h2>
              <div className="empty-stage-grid">
                <article>
                  <h3>Predefined product template</h3>
                  <p>Start from a mock template such as a business card, flyer, mug, or T-shirt.</p>
                </article>
                <article>
                  <h3>Upload mockup and define zones manually</h3>
                  <p>Load a reference image and draw the print zones directly onto the view.</p>
                </article>
                <article>
                  <h3>Blank canvas</h3>
                  <p>Start with a clean artboard and define every zone manually from scratch.</p>
                </article>
              </div>
            </div>
          )}
        </div>

        <footer className="workspace-status">
          <span>{statusMessage}</span>
          {selectedView && validation?.hasErrors ? (
            <span className="workspace-status-error">Saving is disabled until the design is valid.</span>
          ) : null}
        </footer>
      </section>
    </div>
  )
}
