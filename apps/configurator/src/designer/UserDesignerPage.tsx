import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IText } from 'fabric'
import { Hand, MousePointer2, Plus, Trash2, ZoomIn, ZoomOut, RotateCcw, Image, Save, Type, X, Eye } from 'lucide-react'
import { fieldOrder, mmToStage, roundMetric, stageToMm, zoneVisual } from '@printforge/ui/designer'
import { Button } from '@printforge/ui/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@printforge/ui/components/ui/dialog'
import type { DesignerView } from '@printforge/ui/designer'
import {
  fetchDesignerConfig,
  getDesignerProductIdFromPath,
  getSessionIdFromSearch,
  isValidDesignerProductId,
} from './designerConfig.js'
import { postDesignerConfiguration } from './parentMessaging.js'
import { recalculateViewsForDimensions } from './recalculate.js'
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

function getEffectiveViews(
  views: DesignerView[],
  customDimensions: { widthMm: number; heightMm: number } | null,
) {
  if (!customDimensions || customDimensions.widthMm <= 0 || customDimensions.heightMm <= 0) {
    return views
  }

  return recalculateViewsForDimensions(views, customDimensions.widthMm, customDimensions.heightMm)
}

function getSelectedDesignValidation(
  view: DesignerView | null,
  selectedDesign: ReturnType<typeof getViewDesign> | null,
) {
  if (!view || !selectedDesign) {
    return null
  }

  return validateDesignForView(view, selectedDesign)
}

export function UserDesignerPage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Stable refs for event handler closures: updated each render
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
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<{ viewId: string; name: string; url: string }[]>([])
  const [customDimensions, setCustomDimensions] = useState<{ widthMm: number; heightMm: number } | null>(null)

  useIframeResize(pageRef)

  // Keep stable refs in sync with current state
  useEffect(() => { zoomRef.current = zoom }, [zoom])
  useEffect(() => { panRef.current = pan }, [pan])
  useEffect(() => { liveActiveToolRef.current = activeTool }, [activeTool])
  useEffect(() => { liveProductIdRef.current = productId }, [productId])

  const effectiveViews = useMemo(
    () => getEffectiveViews(views, customDimensions),
    [views, customDimensions],
  )

  const selectedView = useMemo(
    () => effectiveViews.find((v) => v.id === selectedViewId) ?? null,
    [selectedViewId, effectiveViews],
  )

  const selectedDesign = useMemo(
    () => (selectedView ? getViewDesign(design, selectedView.id) : null),
    [design, selectedView],
  )

  const selectedDesignValidation = useMemo(
    () => getSelectedDesignValidation(selectedView, selectedDesign),
    [selectedDesign, selectedView],
  )

  // Hooks

  const onSelectionChange = useCallback((obj: FabricObjectWithMeta | null) => {
    setSelectedElementId(obj?.__elementId ?? null)
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

  // Data loading

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

  // Cross-iframe dimension sync (BroadcastChannel)

  // Listen for real-time dimension updates from the options iframe
  useEffect(() => {
    let channel: BroadcastChannel | null = null
    try { channel = new BroadcastChannel('printforge-config') } catch { return }

    channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type !== 'printforge:dims:update') return
      const { widthMm, heightMm } = event.data as { widthMm: number; heightMm: number }
      if (widthMm > 0 && heightMm > 0) setCustomDimensions({ widthMm, heightMm })
    }

    return () => { channel?.close() }
  }, [])

  // Once views are loaded, request the current dimensions from the options iframe
  const hasViews = views.length > 0
  useEffect(() => {
    if (!hasViews) return
    try {
      const ch = new BroadcastChannel('printforge-config')
      ch.postMessage({ type: 'printforge:dims:request' })
      ch.close()
    } catch { /* BroadcastChannel not supported */ }
  }, [hasViews])

  // Preview export

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

      window.parent.postMessage(
        { type: 'printforge:designer:preview-response', requestId, previews },
        event.origin,
      )
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [views, fabricCanvasMapRef])

  // Actions

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
    setSelectedElementId(null)
    setStatusMessage('Removed the selected layer.')
  }

  const selectElementOnCanvas = useCallback((elementId: string) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    setActiveTool('select')
    const obj = canvas.getObjects().find((o) => (o as FabricObjectWithMeta).__elementId === elementId)
    if (!obj) return
    canvas.setActiveObject(obj)
    canvas.requestRenderAll()
    onSelectionChange(obj as FabricObjectWithMeta)
  }, [fabricCanvasRef, onSelectionChange])

  const removeElementById = useCallback((elementId: string) => {
    if (!selectedView) return
    setDesign((cur) => removeElementFromDesign(cur, selectedView.id, elementId))
    if (selectedElementIdRef.current === elementId) selectedElementIdRef.current = null
    if (selectedTextId === elementId) { setSelectedTextId(null); setSelectedTextProps(null) }
    setSelectedElementId(null)
    setStatusMessage('Removed the layer.')
  }, [selectedView, selectedTextId, selectedElementIdRef])

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
      skipNextRenderRef.current = true
      setDesign(nextDesign)
      return
    }

    skipNextRenderRef.current = true
    setDesign(nextDesign)
    if (sessionId) saveSession(sessionId, nextDesign)
    postDesignerConfiguration({ productId, routeProductId, design: nextDesign })
    setStatusMessage('Design saved.')
  }

  function handleOpenPreview() {
    const urls: { viewId: string; name: string; url: string }[] = []
    for (const view of views) {
      const canvas = fabricCanvasMapRef.current.get(view.id)
      if (!canvas) continue
      const src = canvas.lowerCanvasEl
      const tmp = document.createElement('canvas')
      tmp.width = src.width
      tmp.height = src.height
      const ctx = tmp.getContext('2d')
      if (!ctx) continue
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, tmp.width, tmp.height)
      ctx.drawImage(src, 0, 0)
      urls.push({ viewId: view.id, name: view.name, url: tmp.toDataURL('image/png') })
    }
    setPreviewUrls(urls)
    setPreviewOpen(true)
  }

  // Render

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
                    setSelectedElementId(null)
                    setStatusMessage(`Viewing ${view.name}.`)
                  }}
                >
                  {view.name}
                </button>
              ))}
            </div>
          </div>

          <div className="designer-card">
            <p className="designer-eyebrow">Add content</p>
            <div className="designer-tool-grid mt-2">
              <Button size="sm" variant="secondary" className="w-full gap-1.5" onClick={() => void handleAddText()}>
                <Plus className="size-3.5" />
                Add text
              </Button>
              <Button size="sm" variant="secondary" className="w-full gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Image className="size-3.5" />
                Upload image
              </Button>
            </div>
            {selectedDesign && selectedDesign.elements.length > 0 && (
              <div className="designer-layer-list">
                {selectedDesign.elements.map((el) => (
                  <div
                    key={el.id}
                    className={el.id === selectedElementId ? 'designer-layer-pill is-active' : 'designer-layer-pill'}
                  >
                    <button
                      type="button"
                      className="designer-layer-select"
                      onClick={() => selectElementOnCanvas(el.id)}
                    >
                      <span className="designer-layer-icon">
                        {el.kind === 'text' ? <Type className="size-3" /> : <Image className="size-3" />}
                      </span>
                      <span className="designer-layer-label">
                        {el.kind === 'text' ? (el.text || 'Text layer') : 'Image'}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="designer-layer-remove"
                      title="Remove layer"
                      onClick={(e) => { e.stopPropagation(); removeElementById(el.id) }}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            <div className="flex items-center gap-1">
              <Button
                size="icon-sm"
                variant={activeTool === 'select' ? 'default' : 'outline'}
                type="button"
                title="Select tool"
                onClick={() => { setActiveTool('select'); setStatusMessage('Select tool active. Move, resize, or rotate artwork directly on the canvas.') }}
              >
                <MousePointer2 className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon-sm"
                variant={activeTool === 'pan' ? 'default' : 'outline'}
                type="button"
                title="Hand tool — drag to pan"
                onClick={() => { setActiveTool('pan'); setStatusMessage('Hand tool active. Drag to pan around the canvas.') }}
              >
                <Hand className="size-4" aria-hidden="true" />
              </Button>
              <div className="mx-1 h-4 w-px bg-border" />
              <Button
                size="icon-sm"
                variant="outline"
                type="button"
                title="Zoom out"
                onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}
              >
                <ZoomOut className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                type="button"
                title="Zoom in"
                onClick={() => setZoom((z) => Math.min(4, Number((z + 0.1).toFixed(2))))}
              >
                <ZoomIn className="size-4" aria-hidden="true" />
              </Button>
              <div className="mx-1 h-4 w-px bg-border" />
              <Button
                size="icon-sm"
                variant="outline"
                type="button"
                title="Delete selected"
                onClick={handleDeleteSelection}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
              <Button
                size="icon-sm"
                variant="outline"
                type="button"
                title="Reset view"
                onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); setStatusMessage('Canvas view reset.') }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="designer-stage-action-bar">
            <Button variant="outline" className="gap-1.5" onClick={handleOpenPreview}>
              <Eye className="size-4" />
              Preview
            </Button>
            <Button
              className="gap-1.5"
              onClick={handleSaveDesign}
              disabled={selectedDesignValidation?.isValid === false}
            >
              <Save className="size-4" />
              Save design
            </Button>
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

          {(() => {
            if (selectedDesignValidation && !selectedDesignValidation.isValid) {
              return (
                <div className="designer-stage-status-bar is-error">
                  {selectedDesignValidation.violations[0]}
                </div>
              )
            }
            if (statusMessage) {
              return (
                <div className="designer-stage-status-bar">
                  {statusMessage}
                </div>
              )
            }
            return null
          })()}
        </section>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Design preview</DialogTitle>
          </DialogHeader>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 120px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {previewUrls.length === 0 ? (
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
                No views have been loaded yet. Select a view on the canvas first.
              </p>
            ) : previewUrls.map(({ viewId, name, url }) => (
              <div key={viewId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {previewUrls.length > 1 && (
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>
                    {name}
                  </p>
                )}
                <img
                  src={url}
                  alt={name}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                />
              </div>
            ))}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </main>
  )
}
