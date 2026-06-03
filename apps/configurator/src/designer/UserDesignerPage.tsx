import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, FabricImage, IText } from 'fabric'
import { Hand, MousePointer2 } from 'lucide-react'
import {
  fieldOrder,
  mmToStage,
  roundMetric,
  stageToMm,
  zoneVisual,
} from '@printforge/ui/designer'
import type { DesignerView, ZoneKey } from '@printforge/ui/designer'
import {
  fetchDesignerConfig,
  getDesignerProductIdFromPath,
  isValidDesignerProductId,
} from './designerConfig.js'
import { postDesignerConfiguration } from './parentMessaging.js'
import type {
  UserDesignElement,
  UserDesignState,
  UserDesignViewState,
  UserDesignerTool,
} from './types.js'
import { ensureFontReady } from './fonts.js'
import { TextPropertiesPanel } from './TextPropertiesPanel.js'
import type { TextProps } from './TextPropertiesPanel.js'
import { useIframeResize } from '../options/useIframeResize.js'
import './designer-ui.css'

type FabricObjectWithMeta = (IText | FabricImage) & {
  __kind?: 'user-text' | 'user-image'
  __elementId?: string
}

const VIEWPORT_PADDING = 40
const DESIGNER_DRAFT_STORAGE_PREFIX = 'printforge:designer:draft:'

function createElementId() {
  return `element-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readImageFile(file: File) {
  return new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result ?? '')
      const img = new Image()
      img.onload = () => resolve({ src, width: img.width, height: img.height })
      img.onerror = () => reject(new Error('Unable to read the image.'))
      img.src = src
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read the image.'))
    reader.readAsDataURL(file)
  })
}

function resolveConstraintRect(view: DesignerView) {
  if (view.fields.allowedPrintArea.enabled) return view.fields.allowedPrintArea.rect
  if (view.fields.safeZone.enabled) return view.fields.safeZone.rect
  if (view.fields.cutArea.enabled) return view.fields.cutArea.rect
  return view.fields.physicalSize.rect
}

function containsRect(
  outer: { x: number; y: number; width: number; height: number },
  inner: { x: number; y: number; width: number; height: number },
) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  )
}

function getViewDesign(design: UserDesignState, viewId: string): UserDesignViewState {
  return design.views.find((v) => v.viewId === viewId) ?? { viewId, elements: [] }
}

function updateViewDesign(
  design: UserDesignState,
  viewId: string,
  updater: (current: UserDesignViewState) => UserDesignViewState,
): UserDesignState {
  const current = getViewDesign(design, viewId)
  const next = updater(current)
  const nextViews = design.views.some((v) => v.viewId === viewId)
    ? design.views.map((v) => (v.viewId === viewId ? next : v))
    : [...design.views, next]
  return { ...design, views: nextViews }
}

// All coordinates in stage units (mm × MM_TO_STAGE_UNITS). No viewport size involved.
// Text objects use originX/Y 'left'/'top'; image objects use 'center'.
function elementFromObject(object: FabricObjectWithMeta): UserDesignElement | null {
  const elementId = object.__elementId
  const kind = object.__kind
  if (!elementId || (kind !== 'user-text' && kind !== 'user-image')) return null

  const sw = object.getScaledWidth()
  const sh = object.getScaledHeight()
  const isText = object instanceof IText

  // Text: originX/Y = 'left'/'top' → object.left/top is already the top-left corner
  // Image: originX/Y = 'center' → subtract half-size to get top-left
  const x = isText ? (object.left ?? 0) : (object.left ?? 0) - sw / 2
  const y = isText ? (object.top ?? 0) : (object.top ?? 0) - sh / 2

  return {
    id: elementId,
    kind: kind === 'user-text' ? 'text' : 'image',
    text: isText ? (object.text ?? 'Your text') : null,
    src: object instanceof FabricImage ? ((object.getSrc?.() as string | undefined) ?? null) : null,
    x: roundMetric(stageToMm(x)),
    y: roundMetric(stageToMm(y)),
    width: roundMetric(stageToMm(sw)),
    height: roundMetric(stageToMm(sh)),
    rotation: roundMetric(object.angle ?? 0),
    fontSize:    isText ? roundMetric(stageToMm(object.fontSize ?? 32)) : null,
    fill:        isText ? String(object.fill ?? '#0f172a') : null,
    fontFamily:  isText ? String(object.fontFamily ?? 'Inter') : null,
    fontWeight:  isText ? String(object.fontWeight ?? '400') : null,
    fontStyle:   isText ? (object.fontStyle === 'italic' ? 'italic' : 'normal') : null,
    textAlign:   isText ? ((object.textAlign as 'left' | 'center' | 'right') ?? 'left') : null,
    charSpacing: isText ? (object.charSpacing ?? 0) : null,
    lineHeight:  isText ? (object.lineHeight ?? 1.16) : null,
    underline:   isText ? Boolean(object.underline) : null,
    linethrough: isText ? Boolean(object.linethrough) : null,
  }
}

function getDesignerDraftKey(productId: string) {
  return `${DESIGNER_DRAFT_STORAGE_PREFIX}${productId}`
}

function isUserDesignState(v: unknown): v is UserDesignState {
  return (
    typeof v === 'object' &&
    v !== null &&
    'version' in v &&
    (v as { version?: unknown }).version === 1 &&
    'views' in v &&
    Array.isArray((v as { views?: unknown }).views)
  )
}

function loadDraft(productId: string): UserDesignState | null {
  try {
    const raw = window.localStorage.getItem(getDesignerDraftKey(productId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return isUserDesignState(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveDraft(productId: string, design: UserDesignState) {
  window.localStorage.setItem(getDesignerDraftKey(productId), JSON.stringify(design))
}

function validateDesignForView(view: DesignerView, design: UserDesignViewState) {
  const primaryZone = view.fields.allowedPrintArea.enabled
    ? view.fields.allowedPrintArea
    : view.fields.safeZone.enabled
      ? view.fields.safeZone
      : view.fields.cutArea.enabled
        ? view.fields.cutArea
        : view.fields.physicalSize

  const zones =
    primaryZone.key === 'physicalSize'
      ? [view.fields.physicalSize]
      : [primaryZone, view.fields.physicalSize]

  const violations = design.elements.flatMap((el) => {
    const r = { x: el.x, y: el.y, width: el.width, height: el.height }
    return zones
      .filter((z) => !containsRect(z.rect, r))
      .map((z) => `${el.kind === 'text' ? 'Text' : 'Image'} layer is outside ${z.label}.`)
  })

  return { isValid: violations.length === 0, violations }
}

// Validate directly from canvas objects (all in stage units — no viewport math needed)
function validateFromCanvas(canvas: Canvas, view: DesignerView) {
  const primaryZone = view.fields.allowedPrintArea.enabled
    ? view.fields.allowedPrintArea
    : view.fields.safeZone.enabled
      ? view.fields.safeZone
      : view.fields.cutArea.enabled
        ? view.fields.cutArea
        : view.fields.physicalSize

  const zones =
    primaryZone.key === 'physicalSize'
      ? [{ label: view.fields.physicalSize.label, rect: view.fields.physicalSize.rect }]
      : [
          { label: primaryZone.label, rect: primaryZone.rect },
          { label: view.fields.physicalSize.label, rect: view.fields.physicalSize.rect },
        ]

  const violations = canvas
    .getObjects()
    .map((o) => o as FabricObjectWithMeta)
    .filter((o) => o.__kind === 'user-text' || o.__kind === 'user-image')
    .flatMap((o) => {
      // getBoundingRect returns stage-unit coords since canvas is sized in stage units
      const b = o.getBoundingRect()
      const elRect = { x: stageToMm(b.left), y: stageToMm(b.top), width: stageToMm(b.width), height: stageToMm(b.height) }
      return zones
        .filter((z) => !containsRect(z.rect, elRect))
        .map((z) => `${o.__kind === 'user-text' ? 'Text' : 'Image'} layer is outside ${z.label}.`)
    })

  return { isValid: violations.length === 0, violations }
}

export function UserDesignerPage() {
  const pageRef = useRef<HTMLElement | null>(null)
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const liveViewRef = useRef<DesignerView | null>(null)
  const liveActiveToolRef = useRef<UserDesignerTool>('select')
  const liveProductIdRef = useRef<string | null>(null)
  const selectedElementIdRef = useRef<string | null>(null)
  const loadedDraftRef = useRef<string | null>(null)
  // Skip canvas re-render when design update originated from canvas interaction
  const skipNextRenderRef = useRef(false)
  // Stable callback ref for selection changes (avoids re-registering canvas listeners)
  const onSelectionChangeRef = useRef<(obj: FabricObjectWithMeta | null) => void>(() => {})

  // Zoom/pan refs for use in event handlers (avoid stale closures)
  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })

  // Pinch-to-zoom tracking
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null)

  // Pan drag tracking
  const panDragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)

  const [routeProductId] = useState(() => getDesignerProductIdFromPath(window.location.pathname))
  const [productId, setProductId] = useState<string | null>(null)
  const [views, setViews] = useState<DesignerView[]>([])
  const [selectedViewId, setSelectedViewId] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<UserDesignerTool>('select')
  const [design, setDesign] = useState<UserDesignState>({ version: 1, views: [] })
  const [viewportSize, setViewportSize] = useState({ width: 320, height: 360 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [statusMessage, setStatusMessage] = useState('Loading print area configuration...')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Selected text element
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null)
  const [selectedTextProps, setSelectedTextProps] = useState<TextProps | null>(null)

  useIframeResize(pageRef)

  // Keep refs in sync for use in event handler closures
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
    () =>
      selectedView && selectedDesign ? validateDesignForView(selectedView, selectedDesign) : null,
    [selectedDesign, selectedView],
  )

  // Keep the selection callback ref up-to-date each render (stable ref, fresh closure)
  useEffect(() => {
    onSelectionChangeRef.current = (obj: FabricObjectWithMeta | null) => {
      if (!obj || obj.__kind !== 'user-text' || !(obj instanceof IText)) {
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
        fill: String(obj.fill ?? '#0f172a'),
        textAlign: (obj.textAlign as 'left' | 'center' | 'right') ?? 'left',
        charSpacing: obj.charSpacing ?? 0,
        lineHeight: obj.lineHeight ?? 1.16,
        underline: Boolean(obj.underline),
        linethrough: Boolean(obj.linethrough),
      })
    }
  })

  // Base scale: fits the physical product in the viewport at zoom = 1
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

  // ── Data loading ────────────────────────────────────────────────────────────

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
    if (!productId || views.length === 0) return
    if (loadedDraftRef.current === productId) return
    loadedDraftRef.current = productId
    const draft = loadDraft(productId)
    if (!draft) return
    setDesign(draft)
    setStatusMessage('Loaded a saved design draft from this device.')
  }, [productId, views.length])

  // ── Viewport size tracking ───────────────────────────────────────────────────

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const update = () =>
      setViewportSize({ width: Math.max(320, viewport.clientWidth), height: Math.max(360, viewport.clientHeight) })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  // ── Wheel zoom ───────────────────────────────────────────────────────────────
  // Deps include selectedView so this re-runs after the loading screen unmounts
  // and the viewport div is actually in the DOM.

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setZoom((z) => Number(Math.max(0.25, Math.min(4, z - event.deltaY * 0.005)).toFixed(2)))
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    return () => viewport.removeEventListener('wheel', handleWheel, { capture: true } as EventListenerOptions)
  }, [selectedView])

  // ── Pan (mouse drag on the full viewport, including grey area) ────────────────
  // Uses mousedown+document mousemove so:
  //   - Works over canvas AND grey background
  //   - Not affected by Fabric intercepting pointer events

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function onMouseDown(e: MouseEvent) {
      if (liveActiveToolRef.current !== 'pan') return
      panDragRef.current = { startX: e.clientX, startY: e.clientY, ox: panRef.current.x, oy: panRef.current.y }
      e.preventDefault()
    }

    function onMouseMove(e: MouseEvent) {
      if (!panDragRef.current) return
      setPan({
        x: panDragRef.current.ox + (e.clientX - panDragRef.current.startX),
        y: panDragRef.current.oy + (e.clientY - panDragRef.current.startY),
      })
    }

    function onMouseUp() {
      panDragRef.current = null
    }

    // mousedown on viewport, move/up on document so dragging outside viewport still works
    viewport.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      viewport.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [selectedView])

  // ── Pinch-to-zoom (touch) ─────────────────────────────────────────────────────

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function onPointerDown(e: PointerEvent) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (activePointersRef.current.size === 2) {
        const pts = Array.from(activePointersRef.current.values())
        pinchStartRef.current = {
          dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          zoom: zoomRef.current,
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (activePointersRef.current.size >= 2 && pinchStartRef.current) {
        const pts = Array.from(activePointersRef.current.values())
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        setZoom(Number(Math.max(0.25, Math.min(4, pinchStartRef.current.zoom * (dist / pinchStartRef.current.dist))).toFixed(2)))
      }
    }

    function onPointerUp(e: PointerEvent) {
      activePointersRef.current.delete(e.pointerId)
      if (activePointersRef.current.size < 2) pinchStartRef.current = null
    }

    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove, { passive: true })
    viewport.addEventListener('pointerup', onPointerUp)
    viewport.addEventListener('pointercancel', onPointerUp)

    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', onPointerUp)
      viewport.removeEventListener('pointercancel', onPointerUp)
    }
  }, [selectedView])

  // ── Canvas init (once per selected view) ────────────────────────────────────

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host || fabricCanvasRef.current || !selectedView) return

    const canvasEl = document.createElement('canvas')
    host.replaceChildren(canvasEl)

    const canvas = new Canvas(canvasEl, { preserveObjectStacking: true, selection: true })
    canvas.wrapperEl.style.background = 'transparent'
    canvas.lowerCanvasEl.style.backgroundColor = 'transparent'
    canvas.upperCanvasEl.style.backgroundColor = 'transparent'
    canvas.lowerCanvasEl.style.touchAction = 'none'
    canvas.upperCanvasEl.style.touchAction = 'none'

    const syncObject = (target?: FabricObjectWithMeta) => {
      const view = liveViewRef.current
      if (!view || !target) return
      const nextEl = elementFromObject(target)
      if (!nextEl) return

      skipNextRenderRef.current = true
      setDesign((cur) =>
        updateViewDesign(cur, view.id, (entry) => ({
          ...entry,
          elements: entry.elements.map((el) => (el.id === nextEl.id ? nextEl : el)),
        })),
      )
    }

    function notifySelection(obj: FabricObjectWithMeta | undefined) {
      const id = obj?.__elementId ?? null
      selectedElementIdRef.current = id
      onSelectionChangeRef.current(obj ?? null)
    }

    canvas.on('selection:created', ((e: { selected?: FabricObjectWithMeta[] }) => notifySelection(e.selected?.[0])) as never)
    canvas.on('selection:updated', ((e: { selected?: FabricObjectWithMeta[] }) => notifySelection(e.selected?.[0])) as never)
    canvas.on('selection:cleared', () => notifySelection(undefined))
    canvas.on('object:modified', ((e: { target?: FabricObjectWithMeta }) => {
      syncObject(e.target)
      // Re-read position after drag/resize so the panel stays in sync
      if (e.target) onSelectionChangeRef.current(e.target)
    }) as never)

    fabricCanvasRef.current = canvas

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
      host.replaceChildren()
    }
  }, [selectedView])

  // ── Canvas render (only when design or view changes, NOT on zoom/pan) ────────

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    const view = selectedView
    if (!canvas || !view) return

    // If design changed because of a canvas interaction (syncObject), the canvas
    // already reflects the new state — skip clearing and rebuilding.
    if (skipNextRenderRef.current) {
      skipNextRenderRef.current = false
      return
    }

    liveViewRef.current = view
    let disposed = false

    async function render() {
      const physical = view.fields.physicalSize.rect
      const w = Math.max(1, mmToStage(physical.width))
      const h = Math.max(1, mmToStage(physical.height))

      canvas.clear()
      canvas.setDimensions({ width: w, height: h })
      canvas.backgroundColor = 'rgba(0,0,0,0)'

      const activeDesign = getViewDesign(design, view.id)

      for (const el of activeDesign.elements) {
        const left = mmToStage(el.x)
        const top = mmToStage(el.y)
        const width = mmToStage(el.width)
        const height = mmToStage(el.height)

        if (el.kind === 'text') {
          // Wait for the font before measuring — avoids bounding-box/render mismatch
          await ensureFontReady(el.fontFamily ?? 'Inter', el.fontWeight ?? '400', el.fontStyle === 'italic')
          if (disposed) return

          const obj = new IText(el.text ?? 'Your text', {
            originX: 'left',
            originY: 'top',
            fontSize: mmToStage(el.fontSize ?? 10),
            fill: el.fill ?? '#0f172a',
            fontFamily: el.fontFamily ?? 'Inter',
            fontWeight: el.fontWeight ?? '400',
            fontStyle: el.fontStyle ?? 'normal',
            textAlign: el.textAlign ?? 'left',
            charSpacing: el.charSpacing ?? 0,
            lineHeight: el.lineHeight ?? 1.16,
            underline: el.underline ?? false,
            linethrough: el.linethrough ?? false,
            editable: true,
            cornerStyle: 'circle',
            cornerSize: 16,
            touchCornerSize: 30,
            transparentCorners: false,
            cornerColor: '#0050cc',
            cornerStrokeColor: '#ffffff',
            borderColor: '#0050cc',
            borderScaleFactor: 2,
            lockScalingFlip: true,
            centeredRotation: true,
            objectCaching: false,
          }) as FabricObjectWithMeta
          obj.__kind = 'user-text'
          obj.__elementId = el.id

          // Scale uniformly to match stored height. Width follows proportionally — no stretching.
          const naturalH = Math.max(1, obj.height ?? 1)
          const uniformScale = height / naturalH
          obj.set({ left, top, angle: el.rotation, scaleX: uniformScale, scaleY: uniformScale })
          canvas.add(obj)
          continue
        }

        if (el.kind === 'image' && el.src) {
          const obj = (await FabricImage.fromURL(el.src)) as FabricObjectWithMeta
          if (disposed) return
          obj.__kind = 'user-image'
          obj.__elementId = el.id
          obj.set({
            left: left + width / 2,
            top: top + height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: width / Math.max(1, obj.width ?? 1),
            scaleY: height / Math.max(1, obj.height ?? 1),
            angle: el.rotation,
            cornerStyle: 'circle',
            cornerSize: 16,
            touchCornerSize: 30,
            transparentCorners: false,
            cornerColor: '#0050cc',
            cornerStrokeColor: '#ffffff',
            borderColor: '#0050cc',
            borderScaleFactor: 2,
            lockScalingFlip: true,
            centeredRotation: true,
            objectCaching: false,
          })
          canvas.add(obj)
        }
      }

      canvas.renderAll()
    }

    void render()
    return () => { disposed = true }
  }, [design, selectedView])

  // ── Tool cursor / selectability ─────────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const isPan = activeTool === 'pan'

    for (const obj of canvas.getObjects()) {
      obj.set({ selectable: !isPan, evented: !isPan })
    }
    canvas.selection = !isPan
    canvas.defaultCursor = isPan ? 'grab' : 'default'
    canvas.hoverCursor = isPan ? 'grab' : 'move'

    // In pan mode, let pointer/mouse events fall through to the viewport so our
    // pan handler (on the viewport) can receive them unimpeded by Fabric.
    canvas.upperCanvasEl.style.pointerEvents = isPan ? 'none' : ''
    canvas.lowerCanvasEl.style.pointerEvents = isPan ? 'none' : ''

    if (isPan) canvas.discardActiveObject()
    canvas.requestRenderAll()
  }, [activeTool])

  // ── Actions ──────────────────────────────────────────────────────────────────

  async function handleAddText() {
    if (!selectedView) return
    const bounds = resolveConstraintRect(selectedView)
    const fontSize = Math.min(10, roundMetric(bounds.height * 0.18))  // mm
    // height = fontSize × default lineHeight so the uniform scale starts at 1
    const lineH = roundMetric(fontSize * 1.16)
    // Rough initial width: 9 chars × ~0.6× fontSize average char width
    const estimatedW = roundMetric(Math.min(fontSize * 9 * 0.6, bounds.width * 0.8))
    const nextEl: UserDesignElement = {
      id: createElementId(),
      kind: 'text',
      text: 'Your text',
      src: null,
      x: roundMetric(bounds.x + (bounds.width - estimatedW) / 2),
      y: roundMetric(bounds.y + (bounds.height - lineH) / 2),
      width: estimatedW,
      height: lineH,
      rotation: 0,
      fontSize,
      fill: '#0f172a',
      fontFamily: 'Inter',
      fontWeight: '400',
      fontStyle: 'normal',
      textAlign: 'left',
      charSpacing: 0,
      lineHeight: 1.16,
      underline: false,
      linethrough: false,
    }
    setDesign((cur) =>
      updateViewDesign(cur, selectedView.id, (entry) => ({ ...entry, elements: [...entry.elements, nextEl] })),
    )
    setStatusMessage('Added a text layer. Drag or resize it inside the allowed print area.')
  }

  // Apply a text property change directly to the live canvas object without clearing
  const applyTextChange = useCallback(
    async <K extends keyof TextProps>(key: K, value: TextProps[K]) => {
      const canvas = fabricCanvasRef.current
      const view = liveViewRef.current
      if (!canvas || !view || !selectedTextId) return

      const obj = canvas.getObjects().find(
        (o) => (o as FabricObjectWithMeta).__elementId === selectedTextId,
      ) as (FabricObjectWithMeta & IText) | undefined

      if (!obj || obj.__kind !== 'user-text' || !(obj instanceof IText)) return

      // Update panel state immediately for responsive feel
      setSelectedTextProps((prev) => (prev ? { ...prev, [key]: value } : null))

      // Apply to Fabric object
      if (key === 'text') {
        obj.set('text', value as string)
      } else if (key === 'fontFamily') {
        const family = value as string
        await ensureFontReady(family, String(obj.fontWeight ?? '400'), obj.fontStyle === 'italic')
        obj.set('fontFamily', family)
      } else if (key === 'fontWeight') {
        const weight = value as string
        await ensureFontReady(String(obj.fontFamily ?? 'Inter'), weight, obj.fontStyle === 'italic')
        obj.set('fontWeight', weight)
      } else if (key === 'fontStyle') {
        const style = value as string
        await ensureFontReady(String(obj.fontFamily ?? 'Inter'), String(obj.fontWeight ?? '400'), style === 'italic')
        obj.set('fontStyle', style)
      } else if (key === 'fontSize') {
        obj.set('fontSize', mmToStage(value as number))
      } else if (key === 'fill') {
        obj.set('fill', value as string)
      } else if (key === 'textAlign') {
        obj.set('textAlign', value as string)
      } else if (key === 'charSpacing') {
        obj.set('charSpacing', value as number)
      } else if (key === 'lineHeight') {
        obj.set('lineHeight', value as number)
      } else if (key === 'underline') {
        obj.set('underline', value as boolean)
      } else if (key === 'linethrough') {
        obj.set('linethrough', value as boolean)
      }

      canvas.requestRenderAll()

      // Sync updated element back to design state (skip canvas re-render)
      const nextEl = elementFromObject(obj)
      if (!nextEl) return
      skipNextRenderRef.current = true
      setDesign((cur) =>
        updateViewDesign(cur, view.id, (entry) => ({
          ...entry,
          elements: entry.elements.map((el) => (el.id === nextEl.id ? nextEl : el)),
        })),
      )
    },
    [selectedTextId],
  )

  async function handleImageSelection(file: File | null) {
    if (!selectedView || !file) return
    const img = await readImageFile(file)
    const bounds = resolveConstraintRect(selectedView)
    const wMm = Math.min(bounds.width * 0.6, Math.max(24, img.width / 10))
    const hMm = roundMetric((wMm * img.height) / Math.max(1, img.width))
    const nextEl: UserDesignElement = {
      id: createElementId(),
      kind: 'image',
      text: null,
      src: img.src,
      x: roundMetric(bounds.x + (bounds.width - wMm) / 2),
      y: roundMetric(bounds.y + (bounds.height - hMm) / 2),
      width: roundMetric(wMm),
      height: roundMetric(Math.min(hMm, bounds.height * 0.7)),
      rotation: 0,
      fontSize: null,
      fill: null,
    }
    setDesign((cur) =>
      updateViewDesign(cur, selectedView.id, (entry) => ({ ...entry, elements: [...entry.elements, nextEl] })),
    )
    setStatusMessage('Added an image layer. Resize or move it inside the allowed print area.')
  }

  function handleDeleteSelection() {
    if (!selectedView || !selectedElementIdRef.current) return
    const id = selectedElementIdRef.current
    setDesign((cur) =>
      updateViewDesign(cur, selectedView.id, (entry) => ({
        ...entry,
        elements: entry.elements.filter((el) => el.id !== id),
      })),
    )
    selectedElementIdRef.current = null
    setSelectedTextId(null)
    setSelectedTextProps(null)
    setStatusMessage('Removed the selected layer.')
  }

  function handleSaveDesign() {
    if (!productId || !selectedView) return

    const canvas = fabricCanvasRef.current
    const view = selectedView

    // Snapshot current canvas state into design
    let nextDesign = design
    if (canvas) {
      const elements = canvas
        .getObjects()
        .map((o) => elementFromObject(o as FabricObjectWithMeta))
        .filter((el): el is UserDesignElement => el !== null)
      nextDesign = updateViewDesign(design, view.id, () => ({ viewId: view.id, elements }))
    }

    // Validate using canvas objects directly (stage units)
    const validation = canvas
      ? validateFromCanvas(canvas, view)
      : (selectedDesignValidation ?? { isValid: true, violations: [] })

    if (!validation.isValid) {
      setDesign(nextDesign)
      setStatusMessage(validation.violations[0] ?? 'Design is outside the configured print areas.')
      return
    }

    setDesign(nextDesign)
    saveDraft(productId, nextDesign)
    postDesignerConfiguration({ productId, routeProductId, design: nextDesign })
    setStatusMessage('Design saved on this device and synced to the embedding page.')
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) return <main className="cf-loading">Loading user designer...</main>
  if (error) return <main className="cf-error">{error}</main>
  if (!selectedView) return <main className="cf-error">This product does not have any configured print-area views yet.</main>

  const effectiveScale = baseScale * zoom
  const allowedZone = resolveConstraintRect(selectedView)
  const physical = selectedView.fields.physicalSize.rect

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
              <button type="button" className="designer-tool-button" onClick={() => void handleAddText()}>
                Add text
              </button>
              <button type="button" className="designer-tool-button" onClick={() => fileInputRef.current?.click()}>
                Upload image
              </button>
              <button type="button" className="designer-tool-button" onClick={handleDeleteSelection}>
                Delete selected
              </button>
              <button type="button" className="designer-tool-button" onClick={() => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))))}>
                Zoom out
              </button>
              <button type="button" className="designer-tool-button" onClick={() => setZoom((z) => Math.min(4, Number((z + 0.1).toFixed(2))))}>
                Zoom in
              </button>
              <button
                type="button"
                className="designer-tool-button"
                onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); setStatusMessage('Canvas view reset.') }}
              >
                Reset view
              </button>
              <button
                type="button"
                className="designer-tool-button designer-tool-button--primary"
                onClick={handleSaveDesign}
              >
                Save design
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="designer-hidden-input"
              onChange={(e) => { void handleImageSelection(e.target.files?.[0] ?? null); e.currentTarget.value = '' }}
            />
          </div>

          {/* Text properties panel — shown when a text layer is selected */}
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
              <button
                type="button"
                className="designer-tool-button designer-tool-button--primary designer-stage-save"
                onClick={handleSaveDesign}
              >
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
            {/* Single CSS-transformed container: canvas + zone overlays share the same coordinate space */}
            <div
              className="designer-stage-transform"
              style={{
                width: physicalStageSize.width,
                height: physicalStageSize.height,
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${effectiveScale})`,
              }}
            >
              {/* White artboard background */}
              <div className="designer-stage-artboard" />

              {/* Optional mockup image */}
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

              {/* Zone overlays — same coordinate space as canvas (stage units) */}
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

              {/* Fabric canvas host — covers the full physical product area */}
              <div ref={canvasHostRef} className="designer-stage-canvas-host" />
            </div>

            {/* Legend — fixed in viewport, not transformed */}
            <div className="designer-legend">
              {fieldOrder
                .filter((key) => key !== 'physicalSize' && selectedView.fields[key].enabled)
                .map((key) => {
                  const visual = zoneVisual(key as ZoneKey)
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
