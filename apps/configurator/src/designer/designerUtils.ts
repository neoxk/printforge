import { Canvas, FabricImage, IText } from 'fabric'
import { roundMetric, stageToMm } from '@printforge/ui/designer'
import type { DesignerView } from '@printforge/ui/designer'
import type {
  UserDesignElement,
  UserDesignState,
  UserDesignViewState,
} from './types.js'

// Types

export type FabricObjectWithMeta = (IText | FabricImage) & {
  __kind?: 'user-text' | 'user-image'
  __elementId?: string
}

// Constants

export const VIEWPORT_PADDING = 40
export const DESIGNER_SESSION_STORAGE_PREFIX = 'printforge:designer:session:'

// Element ID

export function createElementId() {
  return `element-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// File reading

export function readImageFile(file: File) {
  return new Promise<{ src: string; width: number; height: number }>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read the image.'))
        return
      }
      const src = reader.result
      const img = new Image()
      img.onload = () => resolve({ src, width: img.width, height: img.height })
      img.onerror = () => reject(new Error('Unable to read the image.'))
      img.src = src
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read the image.'))
    reader.readAsDataURL(file)
  })
}

// Zone helpers

export function resolveConstraintRect(view: DesignerView) {
  if (view.fields.allowedPrintArea.enabled) return view.fields.allowedPrintArea.rect
  if (view.fields.safeZone.enabled) return view.fields.safeZone.rect
  if (view.fields.cutArea.enabled) return view.fields.cutArea.rect
  return view.fields.physicalSize.rect
}

export function containsRect(
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

// Design state helpers

export function getViewDesign(design: UserDesignState, viewId: string): UserDesignViewState {
  return design.views.find((v) => v.viewId === viewId) ?? { viewId, elements: [] }
}

export function updateViewDesign(
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

export function patchElementInDesign(
  design: UserDesignState,
  viewId: string,
  next: UserDesignElement,
): UserDesignState {
  return updateViewDesign(design, viewId, (entry) => ({
    ...entry,
    elements: entry.elements.map((el) => (el.id === next.id ? next : el)),
  }))
}

export function addElementToDesign(
  design: UserDesignState,
  viewId: string,
  element: UserDesignElement,
): UserDesignState {
  return updateViewDesign(design, viewId, (entry) => ({
    ...entry,
    elements: [...entry.elements, element],
  }))
}

export function removeElementFromDesign(
  design: UserDesignState,
  viewId: string,
  elementId: string,
): UserDesignState {
  return updateViewDesign(design, viewId, (entry) => ({
    ...entry,
    elements: entry.elements.filter((el) => el.id !== elementId),
  }))
}

// Fabric to design element conversion

function colorToString(fill: any): string {
  if (fill == null) return '#0f172a'
  if (typeof fill === 'string') return fill
  // fabric.Color and similar types provide a toString that yields a CSS color
  if (typeof fill.toString === 'function') return fill.toString()
  return String(fill)
}

function textElementFromFabric(id: string, obj: IText): UserDesignElement {
  const sw = obj.getScaledWidth()
  const sh = obj.getScaledHeight()
  return {
    id,
    kind: 'text',
    text: obj.text ?? 'Your text',
    src: null,
    x: roundMetric(stageToMm(obj.left ?? 0)),
    y: roundMetric(stageToMm(obj.top ?? 0)),
    width: roundMetric(stageToMm(sw)),
    height: roundMetric(stageToMm(sh)),
    rotation: roundMetric(obj.angle ?? 0),
    fontSize: roundMetric(stageToMm(obj.fontSize ?? 32)),
    fill: colorToString(obj.fill),
    fontFamily: String(obj.fontFamily ?? 'Inter'),
    fontWeight: String(obj.fontWeight ?? '400'),
    fontStyle: obj.fontStyle === 'italic' ? 'italic' : 'normal',
    textAlign: (obj.textAlign as 'left' | 'center' | 'right') ?? 'left',
    charSpacing: obj.charSpacing ?? 0,
    lineHeight: obj.lineHeight ?? 1.16,
    underline: Boolean(obj.underline),
    linethrough: Boolean(obj.linethrough),
  }
}

function imageElementFromFabric(id: string, obj: FabricImage): UserDesignElement {
  const sw = obj.getScaledWidth()
  const sh = obj.getScaledHeight()
  return {
    id,
    kind: 'image',
    text: null,
    src: (obj.getSrc?.()) ?? null,
    x: roundMetric(stageToMm((obj.left ?? 0) - sw / 2)),
    y: roundMetric(stageToMm((obj.top ?? 0) - sh / 2)),
    width: roundMetric(stageToMm(sw)),
    height: roundMetric(stageToMm(sh)),
    rotation: roundMetric(obj.angle ?? 0),
    fontSize: null, fill: colorToString(obj.fill), fontFamily: null, fontWeight: null,
    fontStyle: null, textAlign: null, charSpacing: null,
    lineHeight: null, underline: null, linethrough: null,
  }
}

export function elementFromObject(object: FabricObjectWithMeta): UserDesignElement | null {
  const { __elementId: id, __kind: kind } = object
  if (!id) return null
  if (kind === 'user-text' && object instanceof IText) return textElementFromFabric(id, object)
  if (kind === 'user-image' && object instanceof FabricImage) return imageElementFromFabric(id, object)
  return null
}

// Session persistence

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

export function loadSession(sessionId: string): UserDesignState | null {
  try {
    const raw = globalThis.localStorage.getItem(`${DESIGNER_SESSION_STORAGE_PREFIX}${sessionId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    return isUserDesignState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSession(sessionId: string, design: UserDesignState) {
  globalThis.localStorage.setItem(
    `${DESIGNER_SESSION_STORAGE_PREFIX}${sessionId}`,
    JSON.stringify(design),
  )
}

// Validation

function getPrimaryZone(view: DesignerView) {
  if (view.fields.allowedPrintArea.enabled) return view.fields.allowedPrintArea
  if (view.fields.safeZone.enabled) return view.fields.safeZone
  if (view.fields.cutArea.enabled) return view.fields.cutArea
  return view.fields.physicalSize
}

export function validateDesignForView(view: DesignerView, design: UserDesignViewState) {
  const primaryZone = getPrimaryZone(view)

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

export function validateFromCanvas(canvas: Canvas, view: DesignerView) {
  const primaryZone = getPrimaryZone(view)

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
      const b = o.getBoundingRect()
      const elRect = {
        x: stageToMm(b.left),
        y: stageToMm(b.top),
        width: stageToMm(b.width),
        height: stageToMm(b.height),
      }
      return zones
        .filter((z) => !containsRect(z.rect, elRect))
        .map((z) => `${o.__kind === 'user-text' ? 'Text' : 'Image'} layer is outside ${z.label}.`)
    })

  return { isValid: violations.length === 0, violations }
}

// Gesture helpers

export function computePinchStart(
  pointers: Map<number, { x: number; y: number }>,
  currentZoom: number,
): { dist: number; zoom: number } {
  const pts = [...pointers.values()]
  return {
    dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
    zoom: currentZoom,
  }
}
