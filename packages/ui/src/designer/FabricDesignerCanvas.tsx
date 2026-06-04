import { useEffect, useRef } from 'react'
import { Canvas, Rect } from 'fabric'
import { mmToStage, stageToMm, zoneVisual } from './geometry'
import type { DesignerTool, DesignerView, ZoneKey, ZoneRect } from './types'

type FabricDesignerCanvasProps = {
  view: DesignerView
  activeTool: DesignerTool
  activeDrawTarget: ZoneKey | null
  zoom: number
  pan: { x: number; y: number }
  legendEntries: Array<{ key: ZoneKey; label: string }>
  onPanChange: (pan: { x: number; y: number }) => void
  onZoneRectChange: (key: ZoneKey, rect: ZoneRect) => void
}

type ZoneRectObject = Rect & { __zoneKey?: ZoneKey }

function rectToMetrics(rect: Rect) {
  return {
    x: stageToMm(rect.left ?? 0),
    y: stageToMm(rect.top ?? 0),
    width: stageToMm(rect.getScaledWidth()),
    height: stageToMm(rect.getScaledHeight()),
  }
}

export function FabricDesignerCanvas({
  view,
  activeTool,
  activeDrawTarget,
  zoom,
  pan,
  legendEntries,
  onPanChange,
  onZoneRectChange,
}: Readonly<FabricDesignerCanvasProps>) {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const isRenderingRef = useRef(false)
  const panStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  )
  const drawStateRef = useRef<{ startX: number; startY: number; rect: Rect | null } | null>(null)

  useEffect(() => {
    if (!canvasElementRef.current) {
      return
    }

    const canvas = new Canvas(canvasElementRef.current, {
      selection: false,
      preserveObjectStacking: true,
    })

    fabricCanvasRef.current = canvas

    const handleObjectModified = (event: { target?: unknown }) => {
      const target = event.target as Rect | undefined

      if (isRenderingRef.current || !target) {
        return
      }

      const zoneKey = (target as ZoneRectObject).__zoneKey
      if (!zoneKey) {
        return
      }

      onZoneRectChange(zoneKey, rectToMetrics(target))
    }

    const handleMouseDown = (event: { e: unknown }) => {
      if (activeTool !== 'draw' || !activeDrawTarget) {
        return
      }

      const pointer = canvas.getScenePoint(event.e as MouseEvent)
      const visual = zoneVisual(activeDrawTarget)
      const rect = new Rect({
        left: pointer.x,
        top: pointer.y,
        width: 1,
        height: 1,
        fill: visual.fill,
        opacity: visual.opacity,
        stroke: visual.stroke,
        strokeWidth: 2,
        strokeDashArray: visual.strokeDashArray,
        selectable: false,
        evented: false,
      })

      ;(rect as ZoneRectObject).__zoneKey = activeDrawTarget
      drawStateRef.current = {
        startX: pointer.x,
        startY: pointer.y,
        rect,
      }

      canvas.add(rect)
    }

    const handleMouseMove = (event: { e: unknown }) => {
      if (!drawStateRef.current) {
        return
      }

      const pointer = canvas.getScenePoint(event.e as MouseEvent)
      const nextLeft = Math.min(drawStateRef.current.startX, pointer.x)
      const nextTop = Math.min(drawStateRef.current.startY, pointer.y)
      const nextWidth = Math.abs(pointer.x - drawStateRef.current.startX)
      const nextHeight = Math.abs(pointer.y - drawStateRef.current.startY)

      drawStateRef.current.rect?.set({
        left: nextLeft,
        top: nextTop,
        width: nextWidth,
        height: nextHeight,
      })

      canvas.requestRenderAll()
    }

    const handleMouseUp = () => {
      if (!drawStateRef.current?.rect || !activeDrawTarget) {
        return
      }

      const nextMetrics = rectToMetrics(drawStateRef.current.rect)
      canvas.remove(drawStateRef.current.rect)
      drawStateRef.current = null

      if (nextMetrics.width <= 0 || nextMetrics.height <= 0) {
        return
      }

      onZoneRectChange(activeDrawTarget, nextMetrics)
    }

    canvas.on('object:modified', handleObjectModified as never)
    canvas.on('mouse:down', handleMouseDown as never)
    canvas.on('mouse:move', handleMouseMove as never)
    canvas.on('mouse:up', handleMouseUp as never)

    return () => {
      canvas.off('object:modified', handleObjectModified as never)
      canvas.off('mouse:down', handleMouseDown as never)
      canvas.off('mouse:move', handleMouseMove as never)
      canvas.off('mouse:up', handleMouseUp as never)
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [activeDrawTarget, activeTool, onZoneRectChange])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    async function renderScene() {
      if (!canvas) {
        return
      }

      isRenderingRef.current = true

      const physical = view.fields.physicalSize.rect
      const width = Math.max(240, mmToStage(physical.width))
      const height = Math.max(180, mmToStage(physical.height))

      canvas.clear()
      canvas.backgroundColor = '#ffffff'
      canvas.setDimensions({
        width,
        height,
      })

      for (const [key, field] of Object.entries(view.fields) as Array<[ZoneKey, DesignerView['fields'][ZoneKey]]>) {
        if (key === 'physicalSize' || !field.enabled) {
          continue
        }

        const visual = zoneVisual(key)
        const rect = new Rect({
          left: mmToStage(field.rect.x),
          top: mmToStage(field.rect.y),
          width: mmToStage(field.rect.width),
          height: mmToStage(field.rect.height),
          fill: visual.fill,
          opacity: visual.opacity,
          stroke: visual.stroke,
          strokeWidth: 2,
          strokeDashArray: visual.strokeDashArray,
          lockRotation: true,
          transparentCorners: false,
          cornerStyle: 'circle',
          cornerColor: visual.stroke,
          borderColor: visual.stroke,
          selectable: activeTool === 'select',
        })

        ;(rect as ZoneRectObject).__zoneKey = key
        canvas.add(rect)
      }

      canvas.renderAll()
      isRenderingRef.current = false
    }

    void renderScene()
  }, [activeTool, view])

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    for (const object of canvas.getObjects()) {
      object.selectable = activeTool === 'select'
      object.evented = activeTool !== 'pan'
    }

    canvas.selection = activeTool === 'select'
    let defaultCursor = 'default'
    if (activeTool === 'pan') {
      defaultCursor = 'grab'
    } else if (activeTool === 'draw') {
      defaultCursor = 'crosshair'
    }
    canvas.defaultCursor = defaultCursor
    canvas.requestRenderAll()
  }, [activeTool])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (activeTool !== 'pan' || !wrapper) {
        return
      }

      panStateRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: pan.x,
        originY: pan.y,
      }
      wrapper.setPointerCapture(event.pointerId)
    }

    function handlePointerMove(event: PointerEvent) {
      if (!panStateRef.current || activeTool !== 'pan') {
        return
      }

      onPanChange({
        x: panStateRef.current.originX + (event.clientX - panStateRef.current.startX),
        y: panStateRef.current.originY + (event.clientY - panStateRef.current.startY),
      })
    }

    function handlePointerUp(event: PointerEvent) {
      if (!panStateRef.current || !wrapper) {
        return
      }

      panStateRef.current = null
      wrapper.releasePointerCapture(event.pointerId)
    }

    wrapper.addEventListener('pointerdown', handlePointerDown)
    wrapper.addEventListener('pointermove', handlePointerMove)
    wrapper.addEventListener('pointerup', handlePointerUp)
    wrapper.addEventListener('pointercancel', handlePointerUp)

    return () => {
      wrapper.removeEventListener('pointerdown', handlePointerDown)
      wrapper.removeEventListener('pointermove', handlePointerMove)
      wrapper.removeEventListener('pointerup', handlePointerUp)
      wrapper.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [activeTool, onPanChange, pan.x, pan.y])

  const physicalWidth = Math.max(240, mmToStage(view.fields.physicalSize.rect.width))
  const physicalHeight = Math.max(180, mmToStage(view.fields.physicalSize.rect.height))
  const viewportClassName =
    activeTool === 'pan' ? 'fabric-stage-viewport fabric-stage-viewport-pan' : 'fabric-stage-viewport'
  const transformClassName =
    activeTool === 'pan'
      ? 'fabric-stage-transform fabric-stage-transform-pan'
      : 'fabric-stage-transform'
  let canvasFootnote = 'Select a zone to move or resize it directly on the canvas.'

  if (activeTool === 'draw') {
    const drawTargetLabel = activeDrawTarget ? view.fields[activeDrawTarget].label : 'zone'
    canvasFootnote = `Drawing ${drawTargetLabel} on canvas.`
  } else if (activeTool === 'pan') {
    canvasFootnote = 'Hand tool active. Drag the stage to move around.'
  }

  return (
    <div className="fabric-stage-shell">
      <div className={viewportClassName} ref={wrapperRef}>
        <div
          className={transformClassName}
          style={{
            width: physicalWidth,
            height: physicalHeight,
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          }}
        >
          {view.mockupSrc ? (
            <img
              className="fabric-stage-mockup"
              src={view.mockupSrc}
              alt={`${view.name} mockup`}
              draggable={false}
            />
          ) : null}
          <canvas ref={canvasElementRef} className="fabric-stage-canvas" />
          <div className="canvas-legend">
            {legendEntries
              .filter((entry) => view.fields[entry.key].enabled)
              .map((entry) => (
                <div key={entry.key} className="legend-item">
                  <span className={`legend-swatch legend-swatch-${entry.key}`} />
                  <span>{entry.label}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="canvas-footnote">{canvasFootnote}</div>
    </div>
  )
}
