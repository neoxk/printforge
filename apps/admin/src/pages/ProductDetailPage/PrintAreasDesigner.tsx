import {
  Hand,
  ImagePlus,
  Layers3,
  MousePointer2,
  Eye,
  Plus,
  Save,
  Shapes,
  SquarePen,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Canvas, FabricImage, Rect } from 'fabric'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { SectionCard } from '@printforge/ui'
import {
  createEmptyDraft,
  createViewFromDraft,
  fieldLabel,
  fieldOrder,
  mmToStage,
  roundMetric,
  stageToMm,
  templatePresets,
  validateDesignerView,
  zoneVisual,
  zoneSupportsPosition,
} from '@printforge/ui/designer'
import type {
  CreateViewDraft,
  DesignerTool,
  DesignerView,
  InlineAlert,
  ZoneKey,
  ZoneRect,
} from '@printforge/ui/designer'
import { cn } from '@/lib/utils'
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

type StageMetrics = {
  effectiveScale: number
  originX: number
  originY: number
  workspaceMinX: number
  workspaceMinY: number
}

type ZoneRectObject = Rect & { __zoneKey?: ZoneKey }
type MockupObject = FabricImage & { __kind?: 'mockup' }

function clampZoom(value: number) {
  return Math.max(0.35, Math.min(3, Number(value.toFixed(2))))
}

function readMockupFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function updateViewCollection(
  views: DesignerView[],
  selectedViewId: string | null,
  updater: (view: DesignerView) => DesignerView,
) {
  return views.map((view) => (view.id === selectedViewId ? updater(view) : view))
}

// ─── Inline alerts ────────────────────────────────────────────────────────────

const ALERT_TONE_CLASS: Record<InlineAlert['tone'], string> = {
  error: 'text-destructive',
  warning: 'text-amber-700',
  info: 'text-primary',
}

function InlineAlertIcon({ tone }: { tone: InlineAlert['tone'] }) {
  if (tone === 'error') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4 shrink-0">
        <path
          d="M10 2.5L18 17.5H2L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 7V11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14.25" r="1" fill="currentColor" />
      </svg>
    )
  }

  if (tone === 'warning') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4 shrink-0">
        <path
          d="M10 2.5L18 17.5H2L10 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 7.25V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14.25H10.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="5.75" r="1" fill="currentColor" />
    </svg>
  )
}

function InlineZoneAlerts({ alerts }: { alerts: InlineAlert[] }) {
  if (alerts.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-2">
      {alerts.map((alert, index) => (
        <p
          key={`${alert.tone}-${index}`}
          className={cn(
            'm-0 flex items-start gap-2 text-xs leading-snug',
            ALERT_TONE_CLASS[alert.tone],
          )}
        >
          <InlineAlertIcon tone={alert.tone} />
          <span>{alert.message}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Stage geometry helpers ───────────────────────────────────────────────────

function viewportStageMetrics(
  viewportWidth: number,
  viewportHeight: number,
  workspaceRect: ZoneRect,
  physicalRect: ZoneRect,
  zoom: number,
  pan: { x: number; y: number },
): StageMetrics {
  // fitScale fits the physical artboard (not the full workspace) so zoom=1 shows
  // the artboard filling the viewport, regardless of workspace padding size.
  const stagePhysicalW = Math.max(1, mmToStage(physicalRect.width))
  const stagePhysicalH = Math.max(1, mmToStage(physicalRect.height))
  const inset = 56
  const availableWidth = Math.max(160, viewportWidth - inset * 2)
  const availableHeight = Math.max(160, viewportHeight - inset * 2)
  const fitScale = Math.min(availableWidth / stagePhysicalW, availableHeight / stagePhysicalH)
  const effectiveScale = fitScale * zoom

  // Center the physical artboard in the viewport, keeping workspace coords consistent.
  const physicalCenterStageX = mmToStage(physicalRect.x - workspaceRect.x) + stagePhysicalW / 2
  const physicalCenterStageY = mmToStage(physicalRect.y - workspaceRect.y) + stagePhysicalH / 2

  return {
    effectiveScale,
    originX: viewportWidth / 2 - physicalCenterStageX * effectiveScale + pan.x,
    originY: viewportHeight / 2 - physicalCenterStageY * effectiveScale + pan.y,
    workspaceMinX: workspaceRect.x,
    workspaceMinY: workspaceRect.y,
  }
}

function resolveWorkspaceRect(view: DesignerView): ZoneRect {
  // Workspace is anchored only to the physical size — zone positions are intentionally
  // excluded so the viewport scale and origin stay stable while guides are dragged.
  const physical = view.fields.physicalSize.rect
  const padX = Math.max(physical.width * 1.5, 200)
  const padY = Math.max(physical.height * 1.5, 200)

  return {
    x: physical.x - padX,
    y: physical.y - padY,
    width: physical.width + padX * 2,
    height: physical.height + padY * 2,
    rotation: 0,
  }
}

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

// ─── Swatch styles for canvas legend ─────────────────────────────────────────

const ZONE_SWATCH_STYLE: Record<string, CSSProperties> = {
  cutArea: { background: '#ffffff', border: '2px solid #050809' },
  bleedArea: { background: 'rgba(255,90,90,0.28)', border: '2px dashed #ba1a1a' },
  safeZone: { background: 'rgba(67,160,71,0.22)', border: '2px dashed #2e7d32' },
  allowedPrintArea: { background: 'rgba(2,102,255,0.18)', border: '2px solid #0050cc' },
}

const ZONE_RENDER_ORDER: ZoneKey[] = [
  'physicalSize',
  'cutArea',
  'bleedArea',
  'safeZone',
  'allowedPrintArea',
]

const ZONE_LEGEND_ORDER: ZoneKey[] = [
  'cutArea',
  'bleedArea',
  'safeZone',
  'allowedPrintArea',
  'physicalSize',
]

const VIEWPORT_BG: CSSProperties = {
  background:
    'linear-gradient(rgba(118,119,124,0.08) 1px,transparent 1px),' +
    'linear-gradient(90deg,rgba(118,119,124,0.08) 1px,transparent 1px),' +
    'oklch(0.964 0.005 60)',
  backgroundSize: '24px 24px, 24px 24px, auto',
}

// ─── Fabric canvas component ──────────────────────────────────────────────────

function FabricPrintAreaCanvas({
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
}: {
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
}) {
  const canvasHostRef = useRef<HTMLDivElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const liveStateRef = useRef({
    view,
    activeTool,
    activeDrawTarget,
    selectedZoneKey,
    zoom,
    pan,
    onZoneRectChange,
    onMockupRectChange,
    onSelectedZoneKeyChange,
  })
  const viewportSizeRef = useRef({ width: 0, height: 0 })
  const isRenderingRef = useRef(false)
  const selectedZoneKeyRef = useRef<ZoneKey | null>(null)
  const panStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)
  const drawStateRef = useRef<{ startX: number; startY: number; rect: Rect | null } | null>(null)

  useEffect(() => {
    liveStateRef.current = {
      view,
      activeTool,
      activeDrawTarget,
      selectedZoneKey,
      zoom,
      pan,
      onZoneRectChange,
      onMockupRectChange,
      onSelectedZoneKeyChange,
    }
  }, [
    activeDrawTarget,
    activeTool,
    onMockupRectChange,
    onSelectedZoneKeyChange,
    onZoneRectChange,
    pan,
    selectedZoneKey,
    view,
    zoom,
  ])

  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return

    const canvasElement = document.createElement('canvas')
    canvasElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1'
    host.replaceChildren(canvasElement)

    const canvas = new Canvas(canvasElement, {
      selection: true,
      preserveObjectStacking: true,
    })

    fabricCanvasRef.current = canvas

    const syncRect = (target?: Rect) => {
      if (isRenderingRef.current || !target) return
      const current = liveStateRef.current
      if ((target as unknown as MockupObject).__kind === 'mockup') {
        const workspace = resolveWorkspaceRect(current.view)
        const stage = viewportStageMetrics(
          viewportSizeRef.current.width,
          viewportSizeRef.current.height,
          workspace,
          current.view.fields.physicalSize.rect,
          current.zoom,
          current.pan,
        )
        current.onMockupRectChange(rectToMetricsWithinStage(target, stage))
        return
      }
      const zoneKey = (target as ZoneRectObject).__zoneKey
      if (!zoneKey) return
      const workspace = resolveWorkspaceRect(current.view)
      const stage = viewportStageMetrics(
        viewportSizeRef.current.width,
        viewportSizeRef.current.height,
        workspace,
        current.view.fields.physicalSize.rect,
        current.zoom,
        current.pan,
      )
      current.onZoneRectChange(zoneKey, rectToMetricsWithinStage(target, stage))
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
      const rect = createZoneRect(
        current.activeDrawTarget,
        { x: 0, y: 0, width: 1, height: 1, rotation: 0 },
        false,
      )
      rect.set({
        left: pointer.x,
        top: pointer.y,
        width: 1,
        height: 1,
        angle: 0,
        selectable: false,
        evented: false,
      })
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

      drawStateRef.current.rect.set({
        left: left + width / 2,
        top: top + height / 2,
        width: Math.max(1, width),
        height: Math.max(1, height),
      })
      canvas.requestRenderAll()
    }

    const handleMouseUp = () => {
      const current = liveStateRef.current
      if (!drawStateRef.current?.rect || !current.activeDrawTarget) return
      const workspace = resolveWorkspaceRect(current.view)
      const stage = viewportStageMetrics(
        viewportSizeRef.current.width,
        viewportSizeRef.current.height,
        workspace,
        current.view.fields.physicalSize.rect,
        current.zoom,
        current.pan,
      )
      const nextRect = rectToMetricsWithinStage(drawStateRef.current.rect, stage)
      canvas.remove(drawStateRef.current.rect)
      drawStateRef.current = null
      if (nextRect.width <= 0 || nextRect.height <= 0) return
      current.onZoneRectChange(current.activeDrawTarget, nextRect)
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
  }, [])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return

    isRenderingRef.current = true

    let disposed = false

    async function renderCanvas() {
      const viewportWidth = Math.max(320, wrapper.clientWidth)
      const viewportHeight = Math.max(320, wrapper.clientHeight)
      viewportSizeRef.current = { width: viewportWidth, height: viewportHeight }
      const workspace = resolveWorkspaceRect(view)

      const stage = viewportStageMetrics(
        viewportWidth,
        viewportHeight,
        workspace,
        view.fields.physicalSize.rect,
        zoom,
        pan,
      )

      canvas.clear()
      canvas.backgroundColor = 'rgba(255,255,255,0)'
      canvas.setDimensions({ width: viewportWidth, height: viewportHeight })

      if (view.mockupSrc && view.mockupRect) {
        const image = (await FabricImage.fromURL(view.mockupSrc)) as MockupObject
        if (disposed) {
          return
        }

        const scaledWidth = mmToStage(view.mockupRect.width) * stage.effectiveScale
        const scaledHeight = mmToStage(view.mockupRect.height) * stage.effectiveScale
        const centerX =
          stage.originX +
          (mmToStage(view.mockupRect.x - workspace.x) + mmToStage(view.mockupRect.width) / 2) * stage.effectiveScale
        const centerY =
          stage.originY +
          (mmToStage(view.mockupRect.y - workspace.y) + mmToStage(view.mockupRect.height) / 2) * stage.effectiveScale

        image.set({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
          width: image.width,
          height: image.height,
          scaleX: scaledWidth / Math.max(1, image.width ?? 1),
          scaleY: scaledHeight / Math.max(1, image.height ?? 1),
          angle: view.mockupRect.rotation ?? 0,
          opacity: 0.88,
          selectable: activeTool === 'select',
          evented: activeTool !== 'pan',
          borderColor: '#0050cc',
          cornerColor: '#0050cc',
          cornerStrokeColor: '#ffffff',
          cornerStyle: 'circle',
          cornerSize: 16,
          touchCornerSize: 28,
          transparentCorners: false,
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
        const centerX =
          stage.originX +
          (mmToStage(field.rect.x - workspace.x) + mmToStage(field.rect.width) / 2) * stage.effectiveScale
        const centerY =
          stage.originY +
          (mmToStage(field.rect.y - workspace.y) + mmToStage(field.rect.height) / 2) * stage.effectiveScale

        rect.set({
          left: centerX,
          top: centerY,
          width: scaledWidth,
          height: scaledHeight,
          scaleX: 1,
          scaleY: 1,
          angle: field.rect.rotation ?? 0,
        })
        ;(rect as ZoneRectObject).__zoneKey = key
        canvas.add(rect)
      }

      if (selectedZoneKeyRef.current && activeTool === 'select') {
        const selectedObject = canvas
          .getObjects()
          .find((object) => (object as ZoneRectObject).__zoneKey === selectedZoneKeyRef.current)
        if (selectedObject) {
          canvas.setActiveObject(selectedObject)
        }
      }

      canvas.renderAll()
      isRenderingRef.current = false
    }

    void renderCanvas()

    return () => {
      disposed = true
    }
  }, [activeTool, pan, view, zoom])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas || activeTool !== 'select') return

    if (!selectedZoneKey) {
      canvas.discardActiveObject()
      canvas.requestRenderAll()
      return
    }

    const selectedObject = canvas
      .getObjects()
      .find((object) => (object as ZoneRectObject).__zoneKey === selectedZoneKey)

    if (selectedObject) {
      canvas.setActiveObject(selectedObject)
      canvas.requestRenderAll()
    }
  }, [activeTool, selectedZoneKey])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    const selectable = activeTool === 'select'
    for (const object of canvas.getObjects()) {
      const zoneKey = (object as ZoneRectObject).__zoneKey ?? null
      const isSelectedObject = selectedZoneKey ? zoneKey === selectedZoneKey : true
      object.set({
        selectable: selectable && isSelectedObject,
        evented: activeTool === 'select' ? isSelectedObject : activeTool !== 'pan',
        hasControls: selectable && isSelectedObject,
        hasBorders: selectable && isSelectedObject,
      })
    }

    canvas.selection = selectable
    canvas.hoverCursor = selectable ? 'move' : activeTool === 'draw' ? 'crosshair' : 'grab'
    canvas.moveCursor = 'move'
    canvas.defaultCursor = activeTool === 'pan' ? 'grab' : activeTool === 'draw' ? 'crosshair' : 'default'
    if (!selectable) {
      canvas.discardActiveObject()
    }
    canvas.requestRenderAll()
  }, [activeTool, selectedZoneKey])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    function handlePointerDown(event: PointerEvent) {
      if (activeTool !== 'pan') return
      panStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: pan.x,
        originY: pan.y,
      }
      wrapper.setPointerCapture(event.pointerId)
    }

    function handlePointerMove(event: PointerEvent) {
      if (!panStateRef.current || activeTool !== 'pan') return
      onPanChange({
        x: panStateRef.current.originX + (event.clientX - panStateRef.current.startX),
        y: panStateRef.current.originY + (event.clientY - panStateRef.current.startY),
      })
    }

    function handlePointerUp(event: PointerEvent) {
      if (!panStateRef.current) return
      panStateRef.current = null
      wrapper.releasePointerCapture(event.pointerId)
    }

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      const nextZoom = clampZoom(zoom - event.deltaY * 0.0025)
      onZoomChange(nextZoom)
    }

    function handleTouchMove(event: TouchEvent) {
      event.preventDefault()
    }

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

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        ref={wrapperRef}
        className={cn(
          'relative min-h-[640px] overflow-hidden rounded-2xl border border-border',
          activeTool === 'pan' && 'cursor-grab',
        )}
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
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs text-foreground transition-colors',
                  selectedZoneKey === key && 'bg-[#eef4ff] text-[#001849]',
                )}
                onClick={() => onSelectedZoneKeyChange(key)}
              >
                <span
                  className="h-4 w-4 rounded-[4px]"
                  style={ZONE_SWATCH_STYLE[key] ?? {}}
                />
                <span>{fieldLabel(key)}</span>
              </button>
            ))}
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground">
        {activeTool === 'draw'
          ? `Drawing ${activeDrawTarget ? view.fields[activeDrawTarget].label : 'zone'} directly on the canvas.`
          : activeTool === 'pan'
            ? 'Hand tool active. Drag to pan. Use Ctrl + wheel to zoom.'
            : 'Select a guide once to move, resize, or rotate it. Use Ctrl + wheel to zoom.'}
      </p>
    </div>
  )
}

// ─── Shared chip/pill styles ──────────────────────────────────────────────────

const CHIP_BASE =
  'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 py-2 text-sm transition-colors'
const CHIP_INACTIVE = 'border-border bg-white text-foreground hover:border-primary'
const CHIP_ACTIVE = 'border-primary bg-[#eef4ff] text-[#001849]'

const PILL_BASE =
  'inline-flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2.5 text-sm transition-colors'

const TILE_BASE = 'grid cursor-pointer gap-2 rounded-xl border p-3.5 text-left transition-colors'
const TILE_INACTIVE = 'border-border bg-white text-foreground hover:border-primary'
const TILE_ACTIVE = 'border-primary bg-[#eef4ff] text-[#001849]'

// ─── Main designer component ──────────────────────────────────────────────────

export function PrintAreasDesigner({ state, actions, isSaving, onSave, onPreview }: Props) {
  const {
    views,
    selectedViewId,
    draft,
    activeTool,
    activeDrawTarget,
    zoom,
    pan,
    statusMessage,
  } = state
  const {
    setViews,
    setSelectedViewId,
    setDraft,
    setActiveTool,
    setActiveDrawTarget,
    setZoom,
    setPan,
    setStatusMessage,
  } = actions

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
    setSelectedZoneKey(null)
    resetViewport()
  }

  async function handleMockupChange(file: File | null) {
    if (!file) {
      setDraft((currentDraft) => ({ ...currentDraft, mockupName: null, mockupSrc: null }))
      return
    }

    const mockupSrc = await readMockupFile(file)
    setDraft((currentDraft) => ({
      ...currentDraft,
      mockupName: file.name,
      mockupSrc,
    }))
  }

  function handleFieldToggle(key: ZoneKey, enabled: boolean) {
    if (!selectedViewId || key === 'physicalSize') return

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
    if (!selectedViewId) return

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
    handleFieldRectChange(key, rect)
    setActiveTool('select')
    setActiveDrawTarget(null)
    setSelectedZoneKey(key)
  }

  function handleMockupRectChange(rect: ZoneRect) {
    if (!selectedViewId) return

    setViews((currentViews) =>
      updateViewCollection(currentViews, selectedViewId, (view) => ({
        ...view,
        mockupRect: {
          ...(view.mockupRect ?? {
            x: 0,
            y: 0,
            width: rect.width,
            height: rect.height,
            rotation: 0,
          }),
          ...rect,
        },
      })),
    )
  }

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)] items-start gap-4">
      <aside className="flex flex-col gap-4">
        <SectionCard title="Canvas setup" description="Add and switch between product print views.">
          <div className="my-4 flex flex-wrap gap-2">
            {views.length === 0 ? (
              <p className="m-0 text-sm text-muted-foreground">No views created yet.</p>
            ) : (
              views.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  className={cn(
                    PILL_BASE,
                    selectedViewId === view.id ? CHIP_ACTIVE : CHIP_INACTIVE,
                  )}
                  onClick={() => handleSelectView(view.id)}
                >
                  <Layers3 className="size-4" aria-hidden="true" />
                  <span>{view.name}</span>
                </button>
              ))
            )}
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label>View name</Label>
              <Input
                type="text"
                value={draft.name}
                placeholder="Front, Back, Sleeve, Lid..."
                onChange={(event) =>
                  setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2.5">
              <button
                type="button"
                className={cn(
                  TILE_BASE,
                  draft.sourceMode === 'template' ? TILE_ACTIVE : TILE_INACTIVE,
                )}
                onClick={() => setDraft((currentDraft) => ({ ...currentDraft, sourceMode: 'template' }))}
              >
                <Shapes className="size-4" aria-hidden="true" />
                <strong>Predefined product template</strong>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  Business cards, flyers, mugs, apparel, packaging.
                </span>
              </button>

              <button
                type="button"
                className={cn(
                  TILE_BASE,
                  draft.sourceMode === 'upload' ? TILE_ACTIVE : TILE_INACTIVE,
                )}
                onClick={() => setDraft((currentDraft) => ({ ...currentDraft, sourceMode: 'upload' }))}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                <strong>Upload mockup</strong>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  Use a reference image and draw the print zones manually.
                </span>
              </button>

              <button
                type="button"
                className={cn(
                  TILE_BASE,
                  draft.sourceMode === 'blank' ? TILE_ACTIVE : TILE_INACTIVE,
                )}
                onClick={() => setDraft((currentDraft) => ({ ...currentDraft, sourceMode: 'blank' }))}
              >
                <Plus className="size-4" aria-hidden="true" />
                <strong>Blank canvas</strong>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  Start with a clean artboard and define every zone manually.
                </span>
              </button>
            </div>

            {draft.sourceMode === 'template' ? (
              <div className="flex flex-col gap-1.5">
                <Label>Template preset</Label>
                <Select
                  value={draft.templateId}
                  onValueChange={(value) =>
                    setDraft((currentDraft) => ({ ...currentDraft, templateId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templatePresets.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {draft.sourceMode === 'upload' ? (
              <div className="flex flex-col gap-1.5">
                <Label>Mockup file</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    void handleMockupChange(event.target.files?.[0] ?? null)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {draft.mockupName ?? 'No mockup selected yet.'}
                </p>
              </div>
            ) : null}

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

        {selectedView ? (
          <SectionCard
            title={selectedView.name}
            description="Configure optional print-area guides for the selected view."
            actions={
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={validation?.hasErrors || isSaving}
                  onClick={() => void onPreview()}
                >
                  <Eye className="size-4" aria-hidden="true" />
                  Preview
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={validation?.hasErrors || isSaving}
                  onClick={() => void onSave()}
                >
                  <Save className="size-4" aria-hidden="true" />
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            }
          >
            <div className="mb-4 mt-2 flex flex-wrap gap-2.5">
              <button
                type="button"
                className={cn(CHIP_BASE, activeTool === 'select' ? CHIP_ACTIVE : CHIP_INACTIVE)}
                onClick={() => {
                  setActiveTool('select')
                  setActiveDrawTarget(null)
                  setStatusMessage('Select mode active. Tap a guide once to move, resize, or rotate it.')
                }}
              >
                <MousePointer2 className="size-4" aria-hidden="true" />
                Select
              </button>
              <button
                type="button"
                className={cn(CHIP_BASE, activeTool === 'pan' ? CHIP_ACTIVE : CHIP_INACTIVE)}
                onClick={() => {
                  setActiveTool('pan')
                  setActiveDrawTarget(null)
                  setStatusMessage('Hand tool active. Drag anywhere on the stage to pan around the view.')
                }}
              >
                <Hand className="size-4" aria-hidden="true" />
                Hand
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {fieldOrder.map((key) => {
                const field = selectedView.fields[key]
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
                          onChange={(event) => handleFieldToggle(field.key, event.target.checked)}
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
                        onClick={() => {
                          setActiveTool('draw')
                          setActiveDrawTarget(key)
                          setSelectedZoneKey(key)
                          setStatusMessage(
                            `Draw ${field.label} directly on the canvas. Release to create the zone, then switch back to Select to fine-tune it.`,
                          )
                        }}
                      >
                        <SquarePen className="size-4" aria-hidden="true" />
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
                                handleFieldRectChange(key, { x: Number(event.target.value) })
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
                                handleFieldRectChange(key, { y: Number(event.target.value) })
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
                            handleFieldRectChange(key, { width: Number(event.target.value) })
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
                            handleFieldRectChange(key, { height: Number(event.target.value) })
                          }
                        />
                      </div>

                      {zoneSupportsPosition(key) ? (
                        <div className="col-span-2 flex flex-col gap-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Rotation
                          </Label>
                          <Input
                            type="number"
                            disabled={!field.enabled}
                            value={field.rect.rotation ?? 0}
                            onChange={(event) =>
                              handleFieldRectChange(key, { rotation: Number(event.target.value) })
                            }
                          />
                        </div>
                      ) : null}
                    </div>

                    <InlineZoneAlerts alerts={validation?.alerts[key] ?? []} />
                  </section>
                )
              })}
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="No canvas selected"
            description="Create a view to start defining print areas."
          >
            <p className="m-0 text-sm text-muted-foreground">
              Select a starting mode above and add your first canvas.
            </p>
          </SectionCard>
        )}
      </aside>

      <section className="flex min-w-0 self-start flex-col gap-4 lg:sticky lg:top-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
              Print Area Designer
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedView ? selectedView.name : 'View setup workspace'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="outline"
              type="button"
              onClick={() => setZoom((current) => clampZoom(current - 0.1))}
            >
              <ZoomOut className="size-4" aria-hidden="true" />
              Zoom out
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setZoom((current) => clampZoom(current + 0.1))}
            >
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
                setStatusMessage(
                  'Hand tool active. Drag anywhere on the stage to pan around the view.',
                )
              }}
            >
              <Hand className="size-4" aria-hidden="true" />
              Hand tool
            </Button>
          </div>
        </div>

        <SectionCard
          title={selectedView ? 'Canvas workspace' : 'Choose how the first canvas starts'}
          description={
            selectedView
              ? selectedView.sourceMode === 'template'
                ? 'Template-based view'
                : selectedView.sourceMode === 'upload'
                  ? 'Mockup-guided view'
                  : 'Blank canvas view'
              : 'Create a view from a template, uploaded mockup, or blank canvas to begin.'
          }
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
                if (key) {
                  setActiveTool('select')
                  setActiveDrawTarget(null)
                }
              }}
            />
          ) : (
            <div className="flex min-h-[520px] flex-col justify-center">
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
        </SectionCard>

        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{statusMessage}</span>
          {selectedView && validation?.hasErrors ? (
            <span className="font-semibold text-destructive">
              Saving is disabled until the design is valid.
            </span>
          ) : null}
        </div>
      </section>
    </div>
  )
}
