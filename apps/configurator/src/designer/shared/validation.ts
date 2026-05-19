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

export function validateDesignerView(view: DesignerView) {
  const alerts = createAlertMap()
  const physical = view.fields.physicalSize.rect

  if (physical.width <= 0 || physical.height <= 0) {
    addAlert(alerts, 'physicalSize', 'error', 'Physical size must have a positive width and height.')
  }

  for (const key of fieldOrder) {
    const field = view.fields[key]

    if (!field.enabled || key === 'physicalSize') {
      continue
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

    if (!containsRect(physical, field.rect)) {
      addAlert(
        alerts,
        key,
        'error',
        `${field.label} must stay inside the physical size boundaries.`,
      )
    }
  }

  if (view.fields.cutArea.enabled && view.fields.bleedArea.enabled) {
    if (!containsRect(view.fields.bleedArea.rect, view.fields.cutArea.rect)) {
      addAlert(alerts, 'bleedArea', 'warning', 'Bleed Area should fully contain the Cut Area.')
    }
  }

  if (view.fields.cutArea.enabled && view.fields.safeZone.enabled) {
    if (!containsRect(view.fields.cutArea.rect, view.fields.safeZone.rect)) {
      addAlert(alerts, 'safeZone', 'warning', 'Safe Zone should stay inside the Cut Area.')
    }
  }

  if (!view.fields.allowedPrintArea.enabled) {
    addAlert(
      alerts,
      'allowedPrintArea',
      'info',
      'Allowed Print Area is disabled for this view. Use it when print placement must be constrained.',
    )
  }

  const hasErrors = Object.values(alerts).some((entries) =>
    entries.some((entry) => entry.tone === 'error'),
  )

  return { alerts, hasErrors }
}
