import type {
  CreateViewDraft,
  DesignerView,
  StageMetrics,
  TemplatePreset,
  ZoneFieldDefinition,
  ZoneFieldMap,
  ZoneKey,
  ZoneRect,
} from './types'
import { templatePresets } from './templates'

export const MM_TO_STAGE_UNITS = 3

export const fieldOrder: ZoneKey[] = [
  'physicalSize',
  'cutArea',
  'bleedArea',
  'safeZone',
  'allowedPrintArea',
]

export function fieldLabel(key: ZoneKey) {
  switch (key) {
    case 'physicalSize':
      return 'Physical Size'
    case 'cutArea':
      return 'Cut Area'
    case 'bleedArea':
      return 'Bleed Area'
    case 'safeZone':
      return 'Safe Zone'
    case 'allowedPrintArea':
      return 'Allowed Print Area'
  }
}

export function zoneSupportsPosition(key: ZoneKey) {
  return key !== 'physicalSize'
}

export function zoneVisual(key: ZoneKey) {
  if (key === 'physicalSize') {
    return {
      fill: '#e9eef7',
      opacity: 0.4,
      stroke: '#31415f',
      strokeDashArray: undefined as number[] | undefined,
    }
  }

  if (key === 'cutArea') {
    return {
      fill: '#ffffff',
      opacity: 0.5,
      stroke: '#050809',
      strokeDashArray: [8, 4],
    }
  }

  if (key === 'bleedArea') {
    return {
      fill: '#ff5a5a',
      opacity: 0.24,
      stroke: '#ba1a1a',
      strokeDashArray: [10, 6],
    }
  }

  if (key === 'safeZone') {
    return {
      fill: '#43a047',
      opacity: 0.22,
      stroke: '#2e7d32',
      strokeDashArray: [10, 6],
    }
  }

  return {
    fill: '#0266ff',
    opacity: 0.18,
    stroke: '#0050cc',
    strokeDashArray: undefined as number[] | undefined,
  }
}

export function roundMetric(value: number) {
  return Math.round(value * 10) / 10
}

export function mmToStage(value: number) {
  return roundMetric(value * MM_TO_STAGE_UNITS)
}

export function stageToMm(value: number) {
  return roundMetric(value / MM_TO_STAGE_UNITS)
}

export function clampMetric(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, roundMetric(value))
}

export function normalizeRect(rect: ZoneRect): ZoneRect {
  const rotation = rect.rotation ?? 0

  return {
    x: Number.isFinite(rect.x) ? roundMetric(rect.x) : 0,
    y: Number.isFinite(rect.y) ? roundMetric(rect.y) : 0,
    width: clampMetric(rect.width),
    height: clampMetric(rect.height),
    rotation: Number.isFinite(rotation) ? roundMetric(rotation) : 0,
  }
}

function createZoneField(key: ZoneKey): ZoneFieldDefinition {
  return {
    key,
    label: fieldLabel(key),
    enabled: key === 'physicalSize',
    optional: key !== 'physicalSize',
    rect:
      key === 'physicalSize'
        ? { x: 0, y: 0, width: 100, height: 100, rotation: 0 }
        : { x: 10, y: 10, width: 80, height: 80, rotation: 0 },
  }
}

export function createFieldMap(): ZoneFieldMap {
  return fieldOrder.reduce<ZoneFieldMap>((map, key) => {
    map[key] = createZoneField(key)
    return map
  }, {} as ZoneFieldMap)
}

function applyPreset(view: DesignerView, preset: TemplatePreset) {
  view.fields.physicalSize = {
    ...view.fields.physicalSize,
    enabled: true,
    rect: {
      x: 0,
      y: 0,
      width: preset.physicalSize.width,
      height: preset.physicalSize.height,
      rotation: 0,
    },
  }

  for (const key of fieldOrder) {
    if (key === 'physicalSize') {
      continue
    }

    const presetField = preset.fields[key]
    if (!presetField) {
      view.fields[key] = {
        ...view.fields[key],
        enabled: false,
      }
      continue
    }

    view.fields[key] = {
      ...view.fields[key],
      enabled: presetField.enabled ?? true,
      rect: normalizeRect({
        x: presetField.x ?? 0,
        y: presetField.y ?? 0,
        width: presetField.width ?? view.fields[key].rect.width,
        height: presetField.height ?? view.fields[key].rect.height,
        rotation: presetField.rotation ?? 0,
      }),
    }
  }
}

function createViewId() {
  return `view-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createViewFromDraft(draft: CreateViewDraft): DesignerView {
  const nextView: DesignerView = {
    id: createViewId(),
    name: draft.name.trim() || 'Untitled view',
    sourceMode: draft.sourceMode,
    templateId: draft.sourceMode === 'template' ? draft.templateId : null,
    mockupName: draft.sourceMode === 'upload' ? draft.mockupName : null,
    mockupSrc: draft.sourceMode === 'upload' ? draft.mockupSrc : null,
    mockupRect:
      draft.sourceMode === 'upload'
        ? { x: 0, y: 0, width: 100, height: 100, rotation: 0 }
        : null,
    fields: createFieldMap(),
  }

  nextView.mockupRect = {
    x: 0,
    y: 0,
    width: nextView.fields.physicalSize.rect.width,
    height: nextView.fields.physicalSize.rect.height,
    rotation: 0,
  }

  if (draft.sourceMode === 'template') {
    const preset = templatePresets.find((entry) => entry.id === draft.templateId)
    if (preset) {
      applyPreset(nextView, preset)
      nextView.mockupRect = {
        x: 0,
        y: 0,
        width: nextView.fields.physicalSize.rect.width,
        height: nextView.fields.physicalSize.rect.height,
        rotation: 0,
      }
    }
  }

  return nextView
}

/**
 * Computes the scale and origin needed to render the workspace on a viewport.
 * Fits the physical artboard at zoom=1 so zone guides are always fully visible.
 */
export function viewportStageMetrics(
  viewportWidth: number,
  viewportHeight: number,
  workspaceRect: ZoneRect,
  physicalRect: ZoneRect,
  zoom: number,
  pan: { x: number; y: number },
): StageMetrics {
  const stagePhysicalW = Math.max(1, mmToStage(physicalRect.width))
  const stagePhysicalH = Math.max(1, mmToStage(physicalRect.height))
  const inset = 56
  const availableWidth = Math.max(160, viewportWidth - inset * 2)
  const availableHeight = Math.max(160, viewportHeight - inset * 2)
  const fitScale = Math.min(availableWidth / stagePhysicalW, availableHeight / stagePhysicalH)
  const effectiveScale = fitScale * zoom
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

/**
 * Returns the workspace bounding rect anchored to the physical size with padding.
 * Zone positions are excluded so the viewport stays stable while guides are dragged.
 */
export function resolveWorkspaceRect(view: DesignerView): ZoneRect {
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

export function createEmptyDraft() {
  return {
    name: '',
    sourceMode: 'template',
    templateId: templatePresets[0]?.id ?? '',
    mockupName: null,
    mockupSrc: null,
  } satisfies CreateViewDraft
}
