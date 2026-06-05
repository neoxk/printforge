import { Canvas, FabricImage, Rect } from 'fabric'
import { useEffect, useRef } from 'react'
import {
  clampZoom,
  fieldLabel,
  mmToStage,
  resolveWorkspaceRect,
  roundMetric,
  stageToMm,
  viewportStageMetrics,
  ZONE_LEGEND_ORDER,
  ZONE_RENDER_ORDER,
  ZONE_SWATCH_STYLE,
  VIEWPORT_BG,
  zoneVisual,
} from '@printforge/ui/designer'
import type { DesignerTool, DesignerView, StageMetrics, ZoneKey, ZoneRect } from '@printforge/ui/designer'
import { cn } from '@/lib/utils'

// ─── Fabric-specific types ────────────────────────────────────────────────────

type ZoneRectObject = Rect & { __zoneKey?: ZoneKey }
type MockupObject = FabricImage & { __kind?: 'mockup' }

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function createZoneRect(key: ZoneKey, rect: ZoneRect, selectable: boolean) {
  const visual = zoneVisual(key)
  const stageWidth = mmToStage(rect.width)
  const stageHeight = mmToStage(rect.height)

  return new Rect({
    left: mmToStage(rect.x) + stageWidth / 2,
    top: mmToStage(rect.y) + stageHeight / 2,
    originX: 'center',
    originY: 'center',
    width: stageWidth,
    height: stageHeight,
    angle: rect.rotation ?? 0,
    fill: visual.fill,
    opacity: visual.opacity,
    stroke: visual.stroke,
    strokeWidth: 2,
    strokeUniform: true,
    strokeDashArray: visual.strokeDashArray,
    lockScalingFlip: true,
    transparentCorners: false,
    cornerStyle: 'circle',
    cornerSize: 16,
    touchCornerSize: 28,
    padding: 0,
    cornerColor: visual.stroke,
    cornerStrokeColor: '#ffffff',
    borderColor: visual.stroke,
    borderScaleFactor: 2,
    centeredScaling: false,
    centeredRotation: true,
    objectCaching: false,
    selectable,
    evented: selectable,
  })
}

function rectToMetricsWithinStage(rect: Rect, stage: StageMetrics): ZoneRect {
  const scaledWidth = ((rect.width ?? 0) * (rect.scaleX ?? 1)) / stage.effectiveScale
  const scaledHeight = ((rect.height ?? 0) * (rect.scaleY ?? 1)) / stage.effectiveScale
  const centerX = ((rect.left ?? 0) - stage.originX) / stage.effectiveScale
  const centerY = ((rect.top ?? 0) - stage.originY) / stage.effectiveScale

  return {
    x: roundMetric(stageToMm(centerX - scaledWidth / 2) + stage.workspaceMinX),
    y: roundMetric(stageToMm(centerY - scaledHeight / 2) + stage.workspaceMinY),
    width: roundMetric(stageToMm(scaledWidth)),
    height: roundMetric(stageToMm(scaledHeight)),
    rotation: roundMetric(rect.angle ?? 0),
  }
}

function getHoverCursor(selectable: boolean, tool: DesignerTool): string {
  if (selectable) return 'move'
  if (tool === 'draw') return 'crosshair'
  return 'grab'
}

function getDefaultCursor(tool: DesignerTool): string {
  if (tool === 'pan') return 'grab'
  if (tool === 'draw') return 'crosshair'
  return 'default'
}

function getObjectEventConfig(
  tool: DesignerTool,
  selectable: boolean,
  isSelectedObject: boolean,
) {
  return {
    selectable: selectable && isSelectedObject,
    evented: tool === 'select' ? isSelectedObject : tool !== 'pan',
    hasControls: selectable && isSelectedObject,
    hasBorders: selectable && isSelectedObject,
  }
}

export function getCanvasStatusMessage(
  tool: DesignerTool,
  drawTarget: ZoneKey | null,
  view: DesignerView,
): string {
  if (tool === 'draw') {
    const label = drawTarget ? view.fields[drawTarget].label : 'zone'
    return `Drawing ${label} directly on the canvas.`
  }
  if (tool === 'pan') return 'Hand tool active. Drag to pan. Use Ctrl + wheel to zoom.'
  return 'Select a guide once to move, resize, or rotate it. Use Ctrl + wheel to zoom.'
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = Readonly<{
  view: DesignerView
  activeTool: DesignerTool
  activeDrawTarget: ZoneKey | null
  zoom: number
  pan: { x: number; y: number }
  onPanChange: (pan: { x: number; y: number }) => void
  onZoomChange: (zoom: number) => void
  onZoneRectChange: (key: ZoneKey, rect: ZoneRect) => void
  onMockupRectChange: (rect: ZoneRect) => void
  selectedZoneKey: ZoneKey | null
  onSelectedZoneKeyChange: (key: ZoneKey | null) => void
}>

export function FabricPrintAreaCanvas({
  view,
  activeTool,
  activeDrawTarget,
  zoom,
  pan,
  onPanChange,
  onZoomChange,
  onZoneRectChange,
  onMockupRectChange,
  selectedZoneKey,
  onSelectedZoneKeyChange,
}: Props) {
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const liveStateRef = useRef({
    view, activeTool, activeDrawTarget, selectedZoneKey,
    zoom, pan, onZoneRectChange, onMockupRectChange, onSelectedZoneKeyChange,
  })
  const viewportSizeRef = useRef({ width: 0, height: 0 })
  const isRenderingRef = useRef(false)
  const selectedZoneKeyRef = useRef<ZoneKey | null>(null)
  const panStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const drawStateRef = useRef<{ startX: number; startY: number; rect: Rect | null } | null>(null)

  // Keep live state ref fresh on every render
  useEffect(() => {
    liveStateRef.current = {
      view, activeTool, activeDrawTarget, selectedZoneKey,
      zoom, pan, onZoneRectChange, onMockupRectChange, onSelectedZoneKeyChange,
    }
  }, [activeDrawTarget, activeTool, onMockupRectChange, onSelectedZoneKeyChange, onZoneRectChange, pan, selectedZoneKey, view, zoom])

  // ── Canvas init (once) ────────────────────────────────────────────────────

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return

    const canvasElement = document.createElement('canvas')
    canvasElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1'
    host.replaceChildren(canvasElement)

    const canvas = new Canvas(canvasElement, { selection: true, preserveObjectStacking: true })
    fabricCanvasRef.current = canvas

    const getStage = () => {
      const current = liveStateRef.current
      const workspace = resolveWorkspaceRect(current.view)
      return viewportStageMetrics(
        viewportSizeRef.current.width,
        viewportSizeRef.current.height,
        workspace,
        current.view.fields.physicalSize.rect,
        current.zoom,
        current.pan,
      )
    }

    const syncRect = (target?: Rect) => {
      if (isRenderingRef.current || !target) return
      const current = liveStateRef.current
      const stage = getStage()
      if ((target as unknown as MockupObject).__kind === 'mockup') {
        current.onMockupRectChange(rectToMetricsWithinStage(target, stage))
        return
      }
      const zoneKey = (target as ZoneRectObject).__zoneKey
      if (zoneKey) current.onZoneRectChange(zoneKey, rectToMetricsWithinStage(target, stage))
    }

    const handleSelectionCreated = (event: { selected?: Array<{ __zoneKey?: ZoneKey }> }) => {
      const nextKey = event.selected?.[0]?.__zoneKey ?? null
      selectedZoneKeyRef.current = nextKey
      onSelectedZoneKeyChange(nextKey)
    }

    const handleSelectionCleared = () => {
      selectedZoneKeyRef.current = null
      onSelectedZoneKeyChange(null)
    }

    const handleMouseDown = (event: { e: MouseEvent | TouchEvent | PointerEvent; target?: Rect }) => {
      const current = liveStateRef.current
      if (current.activeTool === 'select' && !event.target) {
        selectedZoneKeyRef.current = null
        current.onSelectedZoneKeyChange(null)
        canvas.discardActiveObject()
        canvas.requestRenderAll()
        return
      }
      if (current.activeTool !== 'draw' || !current.activeDrawTarget) return
      const pointer = canvas.getScenePoint(event.e)
      const rect = createZoneRect(current.activeDrawTarget, { x: 0, y: 0, width: 1, height: 1, rotation: 0 }, false)
      rect.set({ left: pointer.x, top: pointer.y, width: 1, height: 1, angle: 0, selectable: false, evented: false })
      ;(rect as ZoneRectObject).__zoneKey = current.activeDrawTarget
      drawStateRef.current = { startX: pointer.x, startY: pointer.y, rect }
      canvas.add(rect)
    }

    const handleMouseMove = (event: { e: MouseEvent | TouchEvent | PointerEvent }) => {
      if (!drawStateRef.current?.rect) return
      const pointer = canvas.getScenePoint(event.e)
      const left = Math.min(drawStateRef.current.startX, pointer.x)
      const top = Math.min(drawStateRef.current.startY, pointer.y)
      const width = Math.abs(pointer.x - drawStateRef.current.startX)
      const height = Math.abs(pointer.y - drawStateRef.current.startY)
      drawStateRef.current.rect.set({ left: left + width / 2, top: top + height / 2, width: Math.max(1, width), height: Math.max(1, height) })
      canvas.requestRenderAll()
    }

    const handleMouseUp = () => {
      const current = liveStateRef.current
      if (!drawStateRef.current?.rect || !current.activeDrawTarget) return
      const nextRect = rectToMetricsWithinStage(drawStateRef.current.rect, getStage())
      canvas.remove(drawStateRef.current.rect)
      drawStateRef.current = null
      if (nextRect.width > 0 && nextRect.height > 0) {
        current.onZoneRectChange(current.activeDrawTarget, nextRect)
      }
    }

    canvas.on('selection:created', handleSelectionCreated as never)
    canvas.on('selection:updated', handleSelectionCreated as never)
    canvas.on('selection:cleared', handleSelectionCleared as never)
    canvas.on('object:modified', ((event: { target?: Rect }) => syncRect(event.target)) as never)
    canvas.on('mouse:down', handleMouseDown as never)
    canvas.on('mouse:move', handleMouseMove as never)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
      host.replaceChildren()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Canvas render ─────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    isRenderingRef.current = true
    let disposed = false

    async function renderCanvas() {
      if (!canvas || !wrapper) return
      const viewportWidth = Math.max(320, wrapper.clientWidth)
      const viewportHeight = Math.max(320, wrapper.clientHeight)
      viewportSizeRef.current = { width: viewportWidth, height: viewportHeight }
      const workspace = resolveWorkspaceRect(view)
      const stage = viewportStageMetrics(viewportWidth, viewportHeight, workspace, view.fields.physicalSize.rect, zoom, pan)

      canvas.clear()
      canvas.backgroundColor = 'rgba(255,255,255,0)'
      canvas.setDimensions({ width: viewportWidth, height: viewportHeight })

      if (view.mockupSrc && view.mockupRect) {
        const image = (await FabricImage.fromURL(view.mockupSrc)) as MockupObject
        if (disposed) return
        const scaledWidth = mmToStage(view.mockupRect.width) * stage.effectiveScale
        const scaledHeight = mmToStage(view.mockupRect.height) * stage.effectiveScale
        const centerX = stage.originX + (mmToStage(view.mockupRect.x - workspace.x) + mmToStage(view.mockupRect.width) / 2) * stage.effectiveScale
        const centerY = stage.originY + (mmToStage(view.mockupRect.y - workspace.y) + mmToStage(view.mockupRect.height) / 2) * stage.effectiveScale
        image.set({
          left: centerX, top: centerY, originX: 'center', originY: 'center',
          width: image.width, height: image.height,
          scaleX: scaledWidth / Math.max(1, image.width ?? 1),
          scaleY: scaledHeight / Math.max(1, image.height ?? 1),
          angle: view.mockupRect.rotation ?? 0, opacity: 0.88,
          selectable: activeTool === 'select', evented: activeTool !== 'pan',
          borderColor: '#0050cc', cornerColor: '#0050cc', cornerStrokeColor: '#ffffff',
          cornerStyle: 'circle', cornerSize: 16, touchCornerSize: 28, transparentCorners: false,
        })
        image.__kind = 'mockup'
        canvas.add(image)
      }

      for (const key of ZONE_RENDER_ORDER) {
        const field = view.fields[key]
        if (!field.enabled) continue
        const rect = createZoneRect(key, field.rect, activeTool === 'select')
        const scaledWidth = mmToStage(field.rect.width) * stage.effectiveScale
        const scaledHeight = mmToStage(field.rect.height) * stage.effectiveScale
        const centerX = stage.originX + (mmToStage(field.rect.x - workspace.x) + mmToStage(field.rect.width) / 2) * stage.effectiveScale
        const centerY = stage.originY + (mmToStage(field.rect.y - workspace.y) + mmToStage(field.rect.height) / 2) * stage.effectiveScale
        rect.set({ left: centerX, top: centerY, width: scaledWidth, height: scaledHeight, scaleX: 1, scaleY: 1, angle: field.rect.rotation ?? 0 })
        ;(rect as ZoneRectObject).__zoneKey = key
        canvas.add(rect)
      }

      if (selectedZoneKeyRef.current && activeTool === 'select') {
        const sel = canvas.getObjects().find((o) => (o as ZoneRectObject).__zoneKey === selectedZoneKeyRef.current)
        if (sel) canvas.setActiveObject(sel)
      }

      canvas.renderAll()
      isRenderingRef.current = false
    }

    void renderCanvas()
    return () => { disposed = true }
  }, [activeTool, pan, view, zoom])

  // ── Selection sync ────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || activeTool !== 'select') return
    if (!selectedZoneKey) {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      return
    }
    const sel = canvas.getObjects().find((o) => (o as ZoneRectObject).__zoneKey === selectedZoneKey)
    if (sel) { canvas.setActiveObject(sel); canvas.requestRenderAll() }
  }, [activeTool, selectedZoneKey])

  // ── Tool cursor / selectability ───────────────────────────────────────────

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const selectable = activeTool === 'select'
    for (const object of canvas.getObjects()) {
      const zoneKey = (object as ZoneRectObject).__zoneKey ?? null
      const isSelected = selectedZoneKey ? zoneKey === selectedZoneKey : true
      object.set(getObjectEventConfig(activeTool, selectable, isSelected))
    }
    canvas.selection = selectable
    canvas.hoverCursor = getHoverCursor(selectable, activeTool)
    canvas.moveCursor = 'move'
    canvas.defaultCursor = getDefaultCursor(activeTool)
    if (!selectable) canvas.discardActiveObject()
    canvas.requestRenderAll()
  }, [activeTool, selectedZoneKey])

  // ── Pan ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    function handlePointerDown(event: PointerEvent) {
      if (activeTool !== 'pan') return
      panStateRef.current = { startX: event.clientX, startY: event.clientY, originX: pan.x, originY: pan.y }
      if (!wrapper) return
      wrapper.setPointerCapture(event.pointerId)
    }
    function handlePointerMove(event: PointerEvent) {
      if (!panStateRef.current || activeTool !== 'pan') return
      onPanChange({ x: panStateRef.current.originX + (event.clientX - panStateRef.current.startX), y: panStateRef.current.originY + (event.clientY - panStateRef.current.startY) })
    }
    function handlePointerUp(event: PointerEvent) {
      if (!panStateRef.current) return
      panStateRef.current = null
      if (!wrapper) return
      wrapper.releasePointerCapture(event.pointerId)
    }
    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      onZoomChange(clampZoom(zoom - event.deltaY * 0.0025))
    }
    function handleTouchMove(event: TouchEvent) { event.preventDefault() }

    wrapper.addEventListener('pointerdown', handlePointerDown)
    wrapper.addEventListener('pointermove', handlePointerMove)
    wrapper.addEventListener('pointerup', handlePointerUp)
    wrapper.addEventListener('pointercancel', handlePointerUp)
    wrapper.addEventListener('wheel', handleWheel, { passive: false })
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      wrapper.removeEventListener('pointerdown', handlePointerDown)
      wrapper.removeEventListener('pointermove', handlePointerMove)
      wrapper.removeEventListener('pointerup', handlePointerUp)
      wrapper.removeEventListener('pointercancel', handlePointerUp)
      wrapper.removeEventListener('wheel', handleWheel)
      wrapper.removeEventListener('touchmove', handleTouchMove)
    }
  }, [activeTool, onPanChange, onZoomChange, pan.x, pan.y, zoom])

  const statusMessage = getCanvasStatusMessage(activeTool, activeDrawTarget, view)

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        ref={wrapperRef}
        className={cn('relative min-h-160 overflow-hidden rounded-2xl border border-border', activeTool === 'pan' && 'cursor-grab')}
        style={VIEWPORT_BG}
      >
        <div ref={canvasHostRef} className="absolute inset-0" />
        <div className="absolute bottom-3.5 right-3.5 z-10 flex flex-col gap-2 rounded-xl border border-border/30 bg-white/90 p-3 backdrop-blur-sm">
          {ZONE_LEGEND_ORDER
            .filter((key) => view.fields[key].enabled)
            .map((key) => (
              <button
                key={key}
                type="button"
                className={cn('inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs text-foreground transition-colors', selectedZoneKey === key && 'bg-[#eef4ff] text-[#001849]')}
                onClick={() => onSelectedZoneKeyChange(key)}
              >
                <span className="h-4 w-4 rounded-lg" style={ZONE_SWATCH_STYLE[key] ?? {}} />
                <span>{fieldLabel(key)}</span>
              </button>
            ))}
        </div>
      </div>
      <p className="text-[13px] text-muted-foreground">{statusMessage}</p>
    </div>
  )
}
