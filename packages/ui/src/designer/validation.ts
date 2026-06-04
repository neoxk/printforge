import { fieldOrder } from './geometry'
import type { DesignerView, InlineAlert, ZoneKey } from './types'

type AlertMap = Record<ZoneKey, InlineAlert[]>

function createAlertMap(): AlertMap {
  return fieldOrder.reduce<AlertMap>((map, key) => {
    map[key] = []
    return map
  }, {} as AlertMap)
}

function addAlert(target: AlertMap, key: ZoneKey, tone: InlineAlert['tone'], message: string) {
  target[key].push({ tone, message })
}

function containsRect(outer: { x: number; y: number; width: number; height: number }, inner: { x: number; y: number; width: number; height: number }) {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  )
}

function validatePhysicalSize(view: DesignerView, alerts: AlertMap) {
  const physical = view.fields.physicalSize.rect

  if (physical.width <= 0 || physical.height <= 0) {
    addAlert(alerts, 'physicalSize', 'error', 'Physical size must have a positive width and height.')
  }

  return physical
}

function validateField(field: DesignerView['fields'][ZoneKey], key: ZoneKey, alerts: AlertMap, physical: { x: number; y: number; width: number; height: number }) {
  if (!field.enabled || key === 'physicalSize') {
    return
  }

  if (field.rect.width <= 0 || field.rect.height <= 0) {
    addAlert(alerts, key, 'error', `${field.label} must have a positive width and height.`)
  }

  if (field.rect.rotation && Math.abs(field.rect.rotation) > 0.1) {
    addAlert(
      alerts,
      key,
      'info',
      `${field.label} is rotated. Boundary validation is approximate until backend geometry rules are added.`,
    )
  }

  if (key !== 'bleedArea' && !containsRect(physical, field.rect)) {
    addAlert(
      alerts,
      key,
      'error',
      `${field.label} must stay inside the physical size boundaries.`,
    )
  }
}

function validateContainment(
  view: DesignerView,
  alerts: AlertMap,
  outerKey: ZoneKey,
  innerKey: ZoneKey,
  alertKey: ZoneKey,
  message: string,
) {
  if (view.fields[outerKey].enabled && view.fields[innerKey].enabled) {
    if (!containsRect(view.fields[outerKey].rect, view.fields[innerKey].rect)) {
      addAlert(alerts, alertKey, 'error', message)
    }
  }
}

function validateAllowedPrintArea(view: DesignerView, alerts: AlertMap) {
  if (!view.fields.allowedPrintArea.enabled) {
    addAlert(
      alerts,
      'allowedPrintArea',
      'info',
      'Allowed Print Area is disabled for this view. Use it when print placement must be constrained.',
    )
    return
  }

  if (view.fields.safeZone.enabled) {
    validateContainment(
      view,
      alerts,
      'safeZone',
      'allowedPrintArea',
      'allowedPrintArea',
      'Allowed Print Area must stay inside the Safe Zone.',
    )
  } else if (view.fields.cutArea.enabled) {
    validateContainment(
      view,
      alerts,
      'cutArea',
      'allowedPrintArea',
      'allowedPrintArea',
      'Allowed Print Area must stay inside the Cut Area.',
    )
  }
}

export function validateDesignerView(view: DesignerView) {
  const alerts = createAlertMap()
  const physical = validatePhysicalSize(view, alerts)

  for (const key of fieldOrder) {
    validateField(view.fields[key], key, alerts, physical)
  }

  validateContainment(
    view,
    alerts,
    'bleedArea',
    'cutArea',
    'bleedArea',
    'Bleed Area must fully contain the Cut Area.',
  )

  validateContainment(
    view,
    alerts,
    'cutArea',
    'safeZone',
    'safeZone',
    'Safe Zone must stay inside the Cut Area.',
  )

  validateAllowedPrintArea(view, alerts)

  validateContainment(
    view,
    alerts,
    'bleedArea',
    'safeZone',
    'safeZone',
    'Safe Zone must stay inside the Bleed Area.',
  )

  const hasErrors = Object.values(alerts).some((entries) =>
    entries.some((entry) => entry.tone === 'error'),
  )

  return { alerts, hasErrors }
}
