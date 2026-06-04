import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { DesignerView } from '@printforge/ui/designer'
import type { UserDesignerTool } from './types.js'
import { computePinchStart } from './designerUtils.js'

type SetZoom = (updater: (z: number) => number) => void
type SetPan = (p: { x: number; y: number }) => void

/**
 * Registers wheel-zoom, mouse-pan, and pinch-to-zoom event listeners on the
 * viewport element. Also tracks viewport size for base-scale calculations.
 *
 * `selectedView` is included in effect deps so listeners re-attach after the
 * loading screen unmounts and the viewport div enters the DOM.
 */
export function useViewportInteraction(
  viewportRef: RefObject<HTMLDivElement | null>,
  selectedView: DesignerView | null,
  liveActiveToolRef: RefObject<UserDesignerTool>,
  zoomRef: RefObject<number>,
  panRef: RefObject<{ x: number; y: number }>,
  setZoom: SetZoom,
  setPan: SetPan,
) {
  const [viewportSize, setViewportSize] = useState({ width: 320, height: 360 })

  // Internal gesture tracking refs — never need to trigger re-renders
  const panDragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStartRef = useRef<{ dist: number; zoom: number } | null>(null)

  // ── Viewport size ────────────────────────────────────────────────────────────

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const update = () =>
      setViewportSize({
        width: Math.max(320, viewport.clientWidth),
        height: Math.max(360, viewport.clientHeight),
      })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [viewportRef])

  // ── Wheel zoom ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function handleWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setZoom((z) => Number(Math.max(0.25, Math.min(4, z - event.deltaY * 0.005)).toFixed(2)))
    }

    viewport.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    return () => viewport.removeEventListener('wheel', handleWheel, { capture: true })
  }, [selectedView, viewportRef, setZoom])

  // ── Mouse pan ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function onMouseDown(e: MouseEvent) {
      if (liveActiveToolRef.current !== 'pan') return
      panDragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        ox: panRef.current.x,
        oy: panRef.current.y,
      }
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

    viewport.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      viewport.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [selectedView, viewportRef, liveActiveToolRef, panRef, setPan])

  // ── Pinch-to-zoom ────────────────────────────────────────────────────────────

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    function onPointerDown(e: PointerEvent) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (activePointersRef.current.size === 2) {
        pinchStartRef.current = computePinchStart(activePointersRef.current, zoomRef.current)
      }
    }

    function onPointerMove(e: PointerEvent) {
      activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (activePointersRef.current.size >= 2 && pinchStartRef.current) {
        const pts = [...activePointersRef.current.values()]
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        const next = pinchStartRef.current.zoom * (dist / pinchStartRef.current.dist)
        setZoom(() => Number(Math.max(0.25, Math.min(4, next)).toFixed(2)))
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
  }, [selectedView, viewportRef, zoomRef, setZoom])

  return { viewportSize }
}
