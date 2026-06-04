import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IText } from 'fabric'
import { Hand, MousePointer2 } from 'lucide-react'
import { fieldOrder, mmToStage, roundMetric, stageToMm, zoneVisual } from '@printforge/ui/designer'
import type { DesignerView } from '@printforge/ui/designer'
import {
  fetchDesignerConfig,
  getDesignerProductIdFromPath,
  getSessionIdFromSearch,
  isValidDesignerProductId,
} from './designerConfig.js'
import { postDesignerConfiguration } from './parentMessaging.js'
import type { UserDesignElement, UserDesignState, UserDesignerTool } from './types.js'
import { ensureFontReady } from './fonts.js'
import { TextPropertiesPanel } from './TextPropertiesPanel.js'
import type { TextProps } from './TextPropertiesPanel.js'
import { useIframeResize } from '../options/useIframeResize.js'
import {
  addElementToDesign,
  createElementId,
  elementFromObject,
  getViewDesign,
  loadSession,
  patchElementInDesign,
  readImageFile,
  removeElementFromDesign,
  resolveConstraintRect,
  saveSession,
  updateViewDesign,
  validateDesignForView,
  validateFromCanvas,
  VIEWPORT_PADDING,
  type FabricObjectWithMeta,
} from './designerUtils.js'
import { useFabricCanvas } from './useFabricCanvas.js'
import { useViewportInteraction } from './useViewportInteraction.js'
import './designer-ui.css'

export function UserDesignerPage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Stable refs for event handler closures — updated each render
  const liveActiveToolRef = useRef<UserDesignerTool>('select')
  const liveProductIdRef = useRef<string | null>(null)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })

  const [routeProductId] = useState(() => getDesignerProductIdFromPath(globalThis.location.pathname))
  const [sessionId] = useState(() => getSessionIdFromSearch(globalThis.location.search))
  const [productId, setProductId] = useState<string | null>(null)
  const [views, setViews] = useState<DesignerView[]>([])
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<UserDesignerTool>('select')
  const [design, setDesign] = useState<UserDesignState>({ version: 1, views: [] })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [statusMessage, setStatusMessage] = useState('Loading print area configuration...')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [selectedTextProps, setSelectedTextProps] = useState<TextProps | null>(null)

  useIframeResize(pageRef)

  // Keep stable refs in sync with current state
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current = pan }, [pan])
  useEffect(() => { liveActiveToolRef.current = activeTool }, [activeTool])
  useEffect(() => { liveProductIdRef.current = productId }, [productId])

  const selectedView = useMemo(
    () => views.find((v) => v.id === selectedViewId) ?? null,
    [selectedViewId, views],
  )

  const selectedDesign = useMemo(
    () => (selectedView ? getViewDesign(design, selectedView.id) : null),
    [design, selectedView],
  )

  const selectedDesignValidation = useMemo(
    () => selectedView && selectedDesign ? validateDesignForView(selectedView, selectedDesign) : null,
    [selectedDesign, selectedView],
  )

  // ── Hooks ─────────────────────────────────────────────────────────────────

  const onSelectionChange = useCallback((obj: FabricObjectWithMeta | null) => {
    if (obj?.__kind !== 'user-text' || !(obj instanceof IText)) {
      setSelectedTextId(null)
      setSelectedTextProps(null)
      return
    }
    setSelectedTextId(obj.__elementId ?? null)
    setSelectedTextProps({
      text: obj.text ?? '',
      fontFamily: String(obj.fontFamily ?? 'Inter'),
      fontWeight: String(obj.fontWeight ?? '400'),
      fontStyle: obj.fontStyle === 'italic' ? 'italic' : 'normal',
      fontSize: roundMetric(stageToMm(obj.fontSize ?? 30)),
      fill: typeof obj.fill === 'string' ? obj.fill : '#0f172a',
      textAlign: (obj.textAlign as 'left' | 'center' | 'right') ?? 'left',
      charSpacing: obj.charSpacing ?? 0,
      lineHeight: obj.lineHeight ?? 1.16,
      underline: Boolean(obj.underline),
      linethrough: Boolean(obj.linethrough),
    })
  }, [])

  const {
    canvasHostMapRef,
    fabricCanvasRef,
    fabricCanvasMapRef,
    liveViewRef,
    selectedElementIdRef,
    skipNextRenderRef,
  } = useFabricCanvas(selectedView, design, setDesign, activeTool, onSelectionChange)

  const { viewportSize } = useViewportInteraction(
    viewportRef,
    selectedView,
    liveActiveToolRef,
    zoomRef,
    panRef,
    setZoom,
    setPan,
  )

  const baseScale = useMemo(() => {
    if (!selectedView) return 1
    const { width, height } = selectedView.fields.physicalSize.rect
    const sw = Math.max(1, mmToStage(width))
    const sh = Math.max(1, mmToStage(height))
    const aw = Math.max(220, viewportSize.width - VIEWPORT_PADDING * 2)
    const ah = Math.max(220, viewportSize.height - VIEWPORT_PADDING * 2)
    return Math.min(aw / sw, ah / sh)
  }, [selectedView, viewportSize.width, viewportSize.height])

  const physicalStageSize = useMemo(() => {
    if (!selectedView) return { width: 0, height: 0 }
    return {
      width: Math.max(1, mmToStage(selectedView.fields.physicalSize.rect.width)),
      height: Math.max(1, mmToStage(selectedView.fields.physicalSize.rect.height)),
    }
  }, [selectedView])

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!routeProductId) { setIsLoading(false); setError('Missing product id.'); return }
    if (!isValidDesignerProductId(routeProductId)) { setIsLoading(false); setError('Invalid product id.'); return }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchDesignerConfig(routeProductId)
      .then((config) => {
        if (cancelled) return
        setProductId(config.productId)
        setViews(config.views)
        setSelectedViewId(config.views[0]?.id ?? null)
        setStatusMessage(
          config.views.length > 0
            ? 'Choose a view and place artwork inside the allowed print area.'
            : 'No print area views were configured for this product.',
        )
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load print areas.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [routeProductId])

  useEffect(() => {
    if (!productId) return
    postDesignerConfiguration({ productId, routeProductId, design })
  }, [design, productId, routeProductId])

  useEffect(() => {
    if (!sessionId || views.length === 0) return
    const saved = loadSession(sessionId)
    if (!saved) return
    setDesign(saved)
    setStatusMessage('Loaded a saved design draft from this device.')
  }, [sessionId, views.length])

  // ── Preview export ────────────────────────────────────────────────────────

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== window.parent) return
      if (event.data?.type !== 'printforge:designer:preview-request') return
      if (!event.origin || event.origin === 'null') return

      const requestId = event.data.requestId as string
      const previews = views.map((view) => {
        const canvas = fabricCanvasMapRef.current.get(view.id)
        return {
          viewId: view.id,
          viewName: view.name,
          dataUrl: canvas ? canvas.toDataURL({ format: 'png', multiplier: 1 }) : null,
        }
      })

      const targetOrigin = event.origin && event.origin !== 'null' ? event.origin : '*'
      window.parent.postMessage(
        { type: 'printforge:designer:preview-response', requestId, previews },
        targetOrigin,
      )
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [views, fabricCanvasMapRef])

  // ── Actions ───────────────────────────────────────────────────────────────

  async function handleAddText() {
    if (!selectedView) return
    const bounds = resolveConstraintRect(selectedView)
    const fontSize = Math.min(10, roundMetric(bounds.height * 0.18))
    const lineH = roundMetric(fontSize * 1.16)
    const estimatedW = roundMetric(Math.min(fontSize * 9 * 0.6, bounds.width * 0.8))
    const nextEl: UserDesignElement = {
      id: createElementId(), kind: 'text', text: 'Your text', src: null,
      x: roundMetric(bounds.x + (bounds.width - estimatedW) / 2),
      y: roundMetric(bounds.y + (bounds.height - lineH) / 2),
      width: estimatedW, height: lineH, rotation: 0,
      fontSize, fill: '#0f172a', fontFamily: 'Inter', fontWeight: '400',
      fontStyle: 'normal', textAlign: 'left', charSpacing: 0,
      lineHeight: 1.16, underline: false, linethrough: false,
    }
    setDesign((cur) => addElementToDesign(cur, selectedView.id, nextEl))
    setStatusMessage('Added a text layer. Drag or resize it inside the allowed print area.')
  }

  const applyTextChange = useCallback(
    async <K extends keyof TextProps>(key: K, value: TextProps[K]) => {
      const canvas = fabricCanvasRef.current
      const view = liveViewRef.current
      if (!canvas || !view || !selectedTextId) return

      const obj = canvas.getObjects().find(
        (o) => (o as FabricObjectWithMeta).__elementId === selectedTextId,
      ) as (FabricObjectWithMeta & IText) | undefined
      if (obj?.__kind !== 'user-text' || !(obj instanceof IText)) return

      setSelectedTextProps((prev) => (prev ? { ...prev, [key]: value } : null))

      if (key === 'text') { obj.set('text', value) }
      else if (key === 'fontFamily') {
        const v = value as string
        await ensureFontReady(v, String(obj.fontWeight ?? '400'), obj.fontStyle === 'italic')
        obj.set('fontFamily', v)
      } else if (key === 'fontWeight') {
        const v = value as string
        await ensureFontReady(String(obj.fontFamily ?? 'Inter'), v, obj.fontStyle === 'italic')
        obj.set('fontWeight', v)
      } else if (key === 'fontStyle') {
        const v = value as string
        await ensureFontReady(String(obj.fontFamily ?? 'Inter'), String(obj.fontWeight ?? '400'), v === 'italic')
        obj.set('fontStyle', v)
      } else if (key === 'fontSize') { obj.set('fontSize', mmToStage(value as number)) }
      else if (key === 'fill') { obj.set('fill', value) }
      else if (key === 'textAlign') { obj.set('textAlign', value) }
      else if (key === 'charSpacing') { obj.set('charSpacing', value) }
      else if (key === 'lineHeight') { obj.set('lineHeight', value) }
      else if (key === 'underline') { obj.set('underline', value) }
      else if (key === 'linethrough') { obj.set('linethrough', value) }

      canvas.requestRenderAll()

      const nextEl = elementFromObject(obj)
      if (!nextEl) return
      skipNextRenderRef.current = true
      setDesign((cur) => patchElementInDesign(cur, view.id, nextEl))
    },
    [selectedTextId, fabricCanvasRef, liveViewRef, skipNextRenderRef],
  )

  async function handleImageSelection(file: File | null) {
    if (!selectedView || !file) return
    const img = await readImageFile(file)
    const bounds = resolveConstraintRect(selectedView)
    const wMm = Math.min(bounds.width * 0.6, Math.max(24, img.width / 10))
    const hMm = roundMetric((wMm * img.height) / Math.max(1, img.width))
    const nextEl: UserDesignElement = {
      id: createElementId(), kind: 'image', text: null, src: img.src,
      x: roundMetric(bounds.x + (bounds.width - wMm) / 2),
      y: roundMetric(bounds.y + (bounds.height - hMm) / 2),
      width: roundMetric(wMm),
      height: roundMetric(Math.min(hMm, bounds.height * 0.7)),
      rotation: 0, fontSize: null, fill: null,
      fontFamily: null,
      fontWeight: null,
      fontStyle: null,
      textAlign: null,
      charSpacing: null,
      lineHeight: null,
      underline: null,
      linethrough: null
    }
    setDesign((cur) => addElementToDesign(cur, selectedView.id, nextEl))
    setStatusMessage('Added an image layer. Resize or move it inside the allowed print area.')
  }

  function handleDeleteSelection() {
    if (!selectedView || !selectedElementIdRef.current) return
    const id = selectedElementIdRef.current
    setDesign((cur) => removeElementFromDesign(cur, selectedView.id, id))
    selectedElementIdRef.current = null
    setSelectedTextId(null)
    setSelectedTextProps(null)
    setStatusMessage('Removed the selected layer.')
  }

  function handleSaveDesign() {
    if (!productId || !selectedView) return
    const canvas = fabricCanvasRef.current
    const view = selectedView

    let nextDesign = design
    if (canvas) {
      const elements = canvas
        .getObjects()
        .map((o) => elementFromObject(o as FabricObjectWithMeta))
        .filter((el): el is UserDesignElement => el !== null)
      nextDesign = updateViewDesign(design, view.id, () => ({ viewId: view.id, elements }))
    }

    const validation = canvas
      ? validateFromCanvas(canvas, view)
      : (selectedDesignValidation ?? { isValid: true, violations: [] })

    if (!validation.isValid) {
      setDesign(nextDesign)
      setStatusMessage(validation.violations[0] ?? 'Design is outside the configured print areas.')
      return
    }

    setDesign(nextDesign)
    if (sessionId) saveSession(sessionId, nextDesign)
    postDesignerConfiguration({ productId, routeProductId, design: nextDesign })
    setStatusMessage('Design saved on this device and synced to the embedding page.')
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) return <main className="cf-loading">Loading user designer...</main>
  if (error) return <main className="cf-error">{error}</main>
  if (!selectedView) return <main className="cf-error">This product does not have any configured print-area views yet.</main>

  const effectiveScale = baseScale * zoom
  const allowedZone = resolveConstraintRect(selectedView)

  return (
    <main ref={pageRef} className="designer-page">
      <div className="designer-shell">
        <aside className="designer-sidebar">
          <div className="designer-card">
            <p className="designer-eyebrow">Views</p>
            <h1 className="designer-title">User Designer</h1>
            <p className="designer-description">
              Place text and graphics inside the configured print area for each product view.
            </p>
            <div className="designer-view-list">
              {views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  className={selectedViewId === view.id ? 'designer-view-chip is-active' : 'designer-view-chip'}
                  onClick={() => {
                    setSelectedViewId(view.id)
                    setPan({ x: 0, y: 0 })
                    setZoom(1)
                    setSelectedTextId(null)
                    setSelectedTextProps(null)
                    setStatusMessage(`Viewing ${view.name}.`)
                  }}
                >
                  {view.name}
                </button>
              ))}
            </div>
          </div>

          <div className="designer-card">
            <p className="designer-eyebrow">Tools</p>
            <div className="designer-tool-grid">
              <button
                type="button"
                className={activeTool === 'select' ? 'designer-tool-button designer-tool-button--active' : 'designer-tool-button'}
                onClick={() => { setActiveTool('select'); setStatusMessage('Select tool active. Move, resize, or rotate artwork directly on the canvas.') }}
              >
                <MousePointer2 size={16} />
                Select tool
              </button>
              <button
                type="button"
                className={activeTool === 'pan' ? 'designer-tool-button designer-tool-button--active' : 'designer-tool-button'}
                onClick={() => { setActiveTool('pan'); setStatusMessage('Hand tool active. Drag to pan around the canvas.') }}
              >
                <Hand size={16} />
                Hand tool
              </button>
              <button type="button" className="designer-tool-button" onClick={() => void handleAddText()}>Add text</button>
              <button type="button" className="designer-tool-button" onClick={() => fileInputRef.current?.click()}>Upload image</button>
              <button type="button" className="designer-tool-button" onClick={handleDeleteSelection}>Delete selected</button>
              <button type="button" className="designer-tool-button" onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}>Zoom out</button>
              <button type="button" className="designer-tool-button" onClick={() => setZoom((z) => Math.min(4, Number((z + 0.1).toFixed(2))))}>Zoom in</button>
              <button type="button" className="designer-tool-button" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); setStatusMessage('Canvas view reset.') }}>Reset view</button>
              <button type="button" className="designer-tool-button designer-tool-button--primary" onClick={handleSaveDesign}>Save design</button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="designer-hidden-input"
              onChange={(e) => { void handleImageSelection(e.target.files?.[0] ?? null); e.currentTarget.value = '' }}
            />
          </div>

          {selectedTextProps ? (
            <TextPropertiesPanel value={selectedTextProps} onChange={applyTextChange} />
          ) : null}

          <div className="designer-card">
            <p className="designer-eyebrow">Placement rules</p>
            <ul className="designer-rules">
              <li>Artwork must stay inside the allowed print area.</li>
              <li>Pinch or Ctrl+scroll to zoom. Use the hand tool or two fingers to pan.</li>
              <li>Switch views for products with front/back or multi-surface layouts.</li>
            </ul>
            <div className="designer-zone-meta">
              <span>Allowed area</span>
              <strong>{allowedZone.width} × {allowedZone.height} mm</strong>
            </div>
            {selectedDesignValidation && !selectedDesignValidation.isValid ? (
              <div className="designer-validation-block" role="alert">
                {selectedDesignValidation.violations.map((msg, i) => (
                  <p key={`${msg}-${i}`} className="designer-validation-message">{msg}</p>
                ))}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="designer-stage-card">
          <div className="designer-stage-header">
            <div>
              <p className="designer-eyebrow">Canvas</p>
              <h2 className="designer-stage-title">{selectedView.name}</h2>
            </div>
            <div className="designer-stage-actions">
              <button type="button" className="designer-tool-button designer-tool-button--primary designer-stage-save" onClick={handleSaveDesign}>
                Save design
              </button>
              <p className="designer-status">{statusMessage}</p>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="designer-stage-viewport"
            style={{ cursor: activeTool === 'pan' ? 'grab' : undefined }}
          >
            <div
              className="designer-stage-transform"
              style={{
                width: physicalStageSize.width,
                height: physicalStageSize.height,
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${effectiveScale})`,
              }}
            >
              <div className="designer-stage-artboard" />

              {selectedView.mockupSrc && selectedView.mockupRect ? (
                <img
                  src={selectedView.mockupSrc}
                  alt=""
                  className="designer-stage-mockup"
                  style={{
                    position: 'absolute',
                    left: mmToStage(selectedView.mockupRect.x),
                    top: mmToStage(selectedView.mockupRect.y),
                    width: mmToStage(selectedView.mockupRect.width),
                    height: mmToStage(selectedView.mockupRect.height),
                    transform: `rotate(${selectedView.mockupRect.rotation ?? 0}deg)`,
                    transformOrigin: 'center',
                    objectFit: 'cover',
                    opacity: 0.38,
                  }}
                />
              ) : null}

              {fieldOrder
                .filter((key) => key !== 'physicalSize' && selectedView.fields[key].enabled)
                .map((key) => {
                  const field = selectedView.fields[key]
                  const visual = zoneVisual(key)
                  return (
                    <div
                      key={key}
                      className="designer-stage-zone"
                      style={{
                        position: 'absolute',
                        left: mmToStage(field.rect.x),
                        top: mmToStage(field.rect.y),
                        width: mmToStage(field.rect.width),
                        height: mmToStage(field.rect.height),
                        background: visual.fill,
                        opacity: visual.opacity,
                        borderColor: visual.stroke,
                        borderStyle: visual.strokeDashArray ? 'dashed' : 'solid',
                        transform: `rotate(${field.rect.rotation ?? 0}deg)`,
                        transformOrigin: 'center',
                      }}
                    />
                  )
                })}

              {views.map((view) => (
                <div
                  key={view.id}
                  ref={(el) => {
                    if (el) canvasHostMapRef.current.set(view.id, el)
                    else canvasHostMapRef.current.delete(view.id)
                  }}
                  className="designer-stage-canvas-host"
                  style={{ display: view.id === selectedViewId ? '' : 'none' }}
                />
              ))}
            </div>

            <div className="designer-legend">
              {fieldOrder
                .filter((key) => key !== 'physicalSize' && selectedView.fields[key].enabled)
                .map((key) => {
                  const visual = zoneVisual(key)
                  return (
                    <div key={key} className="designer-legend-item">
                      <span
                        className="designer-legend-swatch"
                        style={{
                          background: visual.fill,
                          borderColor: visual.stroke,
                          borderStyle: visual.strokeDashArray ? 'dashed' : 'solid',
                        }}
                      />
                      <span>{selectedView.fields[key].label}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
