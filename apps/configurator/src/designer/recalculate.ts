import type { DesignerView, ZoneKey, ZoneRect } from '@printforge/ui/designer'
import { roundMetric } from '@printforge/ui/designer'

const SCALED_ZONE_KEYS: ZoneKey[] = ['bleedArea', 'cutArea', 'safeZone', 'allowedPrintArea']

/**
 * Preserves the absolute mm offset of each zone from physicalSize when the
 * product dimensions change.  E.g. a 2.5 mm bleed on every side stays 2.5 mm
 * regardless of whether the user ordered 100×100 mm or 250×192 mm.
 */
function reoffsetRect(phys: ZoneRect, newW: number, newH: number, zone: ZoneRect): ZoneRect {
  const leftInset   = zone.x - phys.x
  const topInset    = zone.y - phys.y
  const rightInset  = (phys.x + phys.width)  - (zone.x + zone.width)
  const bottomInset = (phys.y + phys.height) - (zone.y + zone.height)
  return {
    x:        roundMetric(phys.x + leftInset),
    y:        roundMetric(phys.y + topInset),
    width:    roundMetric(newW - leftInset - rightInset),
    height:   roundMetric(newH - topInset - bottomInset),
    rotation: zone.rotation,
  }
}

export function recalculateViewsForDimensions(
  baseViews: DesignerView[],
  widthMm: number,
  heightMm: number,
): DesignerView[] {
  return baseViews.map((view) => {
    const phys = view.fields.physicalSize.rect
    const newFields = { ...view.fields }

    newFields.physicalSize = {
      ...view.fields.physicalSize,
      rect: { ...phys, width: widthMm, height: heightMm },
    }

    for (const key of SCALED_ZONE_KEYS) {
      if (view.fields[key].enabled) {
        newFields[key] = {
          ...view.fields[key],
          rect: reoffsetRect(phys, widthMm, heightMm, view.fields[key].rect),
        }
      }
    }

    return { ...view, fields: newFields }
  })
}
