import { useEffect, useRef } from 'react'
import { Canvas, Rect } from 'fabric'
import {
  mmToStage,
  stageToMm,
  zoneSupportsPosition,
  zoneVisual,
} from '../../shared/geometry'
import type { DesignerTool, DesignerView, ZoneKey, ZoneRect } from '../../shared/types'

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

function zoneObjectFor(canvas: Canvas, zoneKey: ZoneKey) {
  return canvas
    .getObjects()
    .find((object) => (object as ZoneRectObject).__zoneKey === zoneKey) as ZoneRectObject | undefined
}

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
}: FabricDesignerCanvasProps) {
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

    const handleObjectModified = (event: { target?: Rect }) => {
      if (isRenderingRef.current || !event.target) {
        return
      }

      const zoneKey = (event.target as ZoneRectObject).__zoneKey
      if (!zoneKey) {
        return
      }

      onZoneRectChange(zoneKey, rectToMetrics(event.target))
    }

    const handleMouseDown = (event: { e: MouseEvent }) => {
      if (activeTool !== 'draw' || !activeDrawTarget) {
        return
      }

      const pointer = canvas.getScenePoint(event.e)
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

    const handleMouseMove = (event: { e: MouseEvent }) => {
      if (!drawStateRef.current) {
        return
      }

      const pointer = canvas.getScenePoint(event.e)
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

    canvas.on('object:modified', handleObjectModified)
    canvas.on('mouse:down', handleMouseDown)
    canvas.on('mouse:move', handleMouseMove)
    canvas.on('mouse:up', handleMouseUp)

    return () => {
      canvas.off('object:modified', handleObjectModified)
      canvas.off('mouse:down', handleMouseDown)
      canvas.off('mouse:move', handleMouseMove)
      canvas.off('mouse:up', handleMouseUp)
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
    canvas.defaultCursor = activeTool === 'pan' ? 'grab' : activeTool === 'draw' ? 'crosshair' : 'default'
    canvas.requestRenderAll()
  }, [activeTool])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (activeTool !== 'pan') {
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
      if (!panStateRef.current) {
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

  return (
    <div className="fabric-stage-shell">
      <div
        className={activeTool === 'pan' ? 'fabric-stage-viewport fabric-stage-viewport-pan' : 'fabric-stage-viewport'}
        ref={wrapperRef}
      >
        <div
          className={activeTool === 'pan' ? 'fabric-stage-transform fabric-stage-transform-pan' : 'fabric-stage-transform'}
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

      <div className="canvas-footnote">
        {activeTool === 'draw'
          ? `Drawing ${activeDrawTarget ? view.fields[activeDrawTarget].label : 'zone'} on canvas.`
          : activeTool === 'pan'
            ? 'Hand tool active. Drag the stage to move around.'
            : 'Select a zone to move or resize it directly on the canvas.'}
      </div>
    </div>
  )
}
