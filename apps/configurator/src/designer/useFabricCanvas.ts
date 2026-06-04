import { useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { Canvas, FabricImage, IText } from 'fabric'
import { mmToStage } from '@printforge/ui/designer'
import type { DesignerView } from '@printforge/ui/designer'
import { ensureFontReady } from './fonts.js'
import type { UserDesignState, UserDesignerTool } from './types.js'
import {
  elementFromObject,
  getViewDesign,
  patchElementInDesign,
  type FabricObjectWithMeta,
} from './designerUtils.js'

type OnSelectionChange = (obj: FabricObjectWithMeta | null) => void

export function useFabricCanvas(
  selectedView: DesignerView | null,
  design: UserDesignState,
  setDesign: Dispatch<SetStateAction<UserDesignState>>,
  activeTool: UserDesignerTool,
  onSelectionChange: OnSelectionChange,
) {
  const canvasHostMapRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const fabricCanvasRef = useRef<Canvas | null>(null)
  const fabricCanvasMapRef = useRef<Map<string, Canvas>>(new Map())
  const lastRenderedDesignRef = useRef<Map<string, ReturnType<typeof getViewDesign>>>(new Map())
  const liveViewRef = useRef<DesignerView | null>(null)
  const selectedElementIdRef = useRef<string | null>(null)
  const skipNextRenderRef = useRef(false)

  const onSelectionChangeRef = useRef<OnSelectionChange>(onSelectionChange)
  useEffect(() => { onSelectionChangeRef.current = onSelectionChange })

  // ── Canvas init (once per selected view) ──────────────────────────────────

  useEffect(() => {
    if (!selectedView) return
    const viewId = selectedView.id

    if (fabricCanvasMapRef.current.has(viewId)) {
      fabricCanvasRef.current = fabricCanvasMapRef.current.get(viewId)!
      liveViewRef.current = selectedView
      return
    }

    const host = canvasHostMapRef.current.get(viewId)
    if (!host) return

    const canvasEl = document.createElement('canvas')
    host.replaceChildren(canvasEl)

    const canvas = new Canvas(canvasEl, { preserveObjectStacking: true, selection: true })
    canvas.wrapperEl.style.background = 'transparent'
    canvas.lowerCanvasEl.style.backgroundColor = 'transparent'
    canvas.upperCanvasEl.style.backgroundColor = 'transparent'
    canvas.lowerCanvasEl.style.touchAction = 'none'
    canvas.upperCanvasEl.style.touchAction = 'none'

    const syncObject = (target?: FabricObjectWithMeta) => {
      if (!target) return
      const nextEl = elementFromObject(target)
      if (!nextEl) return
      skipNextRenderRef.current = true
      setDesign((cur) => patchElementInDesign(cur, viewId, nextEl))
    }

    function notifySelection(obj: FabricObjectWithMeta | undefined) {
      selectedElementIdRef.current = obj?.__elementId ?? null
      onSelectionChangeRef.current(obj ?? null)
    }

    canvas.on('selection:created', ((e: { selected?: FabricObjectWithMeta[] }) => notifySelection(e.selected?.[0])) as never)
    canvas.on('selection:updated', ((e: { selected?: FabricObjectWithMeta[] }) => notifySelection(e.selected?.[0])) as never)
    canvas.on('selection:cleared', () => notifySelection(undefined))
    canvas.on('object:modified', ((e: { target?: FabricObjectWithMeta }) => {
      syncObject(e.target)
      if (e.target) onSelectionChangeRef.current(e.target)
    }) as never)

    fabricCanvasMapRef.current.set(viewId, canvas)
    fabricCanvasRef.current = canvas
    liveViewRef.current = selectedView
  }, [selectedView, setDesign])

  // ── Dispose on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      for (const canvas of fabricCanvasMapRef.current.values()) canvas.dispose()
      fabricCanvasMapRef.current.clear()
    }
  }, [])

  // ── Canvas render (design / view changes only — NOT zoom/pan) ────────────

  useEffect(() => {
    const canvas = fabricCanvasRef.current
    const view = selectedView
    if (!canvas || !view) return

    if (skipNextRenderRef.current) {
      skipNextRenderRef.current = false
      lastRenderedDesignRef.current.set(view.id, getViewDesign(design, view.id))
      return
    }

    const currentViewDesign = getViewDesign(design, view.id)
    if (lastRenderedDesignRef.current.get(view.id) === currentViewDesign) return
    lastRenderedDesignRef.current.set(view.id, currentViewDesign)

    liveViewRef.current = view
    let disposed = false

    async function render(canvas: Canvas) {
      if (!view) return
      const physical = view.fields.physicalSize.rect
      const w = Math.max(1, mmToStage(physical.width))
      const h = Math.max(1, mmToStage(physical.height))

      canvas.clear()
      canvas.setDimensions({ width: w, height: h })
      canvas.backgroundColor = 'rgba(0,0,0,0)'

      for (const el of getViewDesign(design, view.id).elements) {
        const left = mmToStage(el.x)
        const top = mmToStage(el.y)
        const width = mmToStage(el.width)
        const height = mmToStage(el.height)

        if (el.kind === 'text') {
          await ensureFontReady(el.fontFamily ?? 'Inter', el.fontWeight ?? '400', el.fontStyle === 'italic')
          if (disposed) return

          const obj = new IText(el.text ?? 'Your text', {
            originX: 'left', originY: 'top',
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
            cornerStyle: 'circle', cornerSize: 16, touchCornerSize: 30,
            transparentCorners: false,
            cornerColor: '#0050cc', cornerStrokeColor: '#ffffff',
            borderColor: '#0050cc', borderScaleFactor: 2,
            lockScalingFlip: true, centeredRotation: true, objectCaching: false,
          }) as FabricObjectWithMeta
          obj.__kind = 'user-text'
          obj.__elementId = el.id
          const uniformScale = height / Math.max(1, obj.height ?? 1)
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
            left: left + width / 2, top: top + height / 2,
            originX: 'center', originY: 'center',
            scaleX: width / Math.max(1, obj.width ?? 1),
            scaleY: height / Math.max(1, obj.height ?? 1),
            angle: el.rotation,
            cornerStyle: 'circle', cornerSize: 16, touchCornerSize: 30,
            transparentCorners: false,
            cornerColor: '#0050cc', cornerStrokeColor: '#ffffff',
            borderColor: '#0050cc', borderScaleFactor: 2,
            lockScalingFlip: true, centeredRotation: true, objectCaching: false,
          })
          canvas.add(obj)
        }
      }

      canvas.renderAll()
    }

    void render(canvas)
    return () => { disposed = true }
  }, [design, selectedView])

  // ── Tool cursor / selectability ───────────────────────────────────────────

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
    canvas.upperCanvasEl.style.pointerEvents = isPan ? 'none' : ''
    canvas.lowerCanvasEl.style.pointerEvents = isPan ? 'none' : ''
    if (isPan) canvas.discardActiveObject()
    canvas.requestRenderAll()
  }, [activeTool])

  return {
    canvasHostMapRef,
    fabricCanvasRef,
    fabricCanvasMapRef,
    liveViewRef,
    selectedElementIdRef,
    skipNextRenderRef,
  }
}

